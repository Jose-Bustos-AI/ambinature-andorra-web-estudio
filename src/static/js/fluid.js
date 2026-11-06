/* Simulación de fluido en WebGL2 (humo de tinta). Sin librerías.
   API: window.AmbiFluid = { burst(color, x, y), stir(amount), setPalette(colors), setActive(bool) } */
(function () {
  'use strict';
  var canvas = document.getElementById('smoke');
  if (!canvas) return;
  var gl = canvas.getContext('webgl2', { alpha: false, depth: false, stencil: false, antialias: false, powerPreference: 'high-performance' });
  if (!gl || !gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;

  var small = Math.min(window.innerWidth, window.innerHeight) < 700;
  var SIM = small ? 64 : 96, DYE = small ? 384 : 512, iterations = small ? 8 : 10;
  var VEL_DISS = 0.22, DYE_DISS = 0.42, CURL = 42;

  var vert = '#version 300 es\nin vec2 aPos;out vec2 vUv;out vec2 vL;out vec2 vR;out vec2 vT;out vec2 vB;uniform vec2 t;void main(){vUv=aPos*.5+.5;vL=vUv-vec2(t.x,0.);vR=vUv+vec2(t.x,0.);vT=vUv+vec2(0.,t.y);vB=vUv-vec2(0.,t.y);gl_Position=vec4(aPos,0.,1.);}';
  var head = '#version 300 es\nprecision highp float;precision highp sampler2D;in vec2 vUv;in vec2 vL;in vec2 vR;in vec2 vT;in vec2 vB;out vec4 o;';
  var FS = {
    copy: head + 'uniform sampler2D u;void main(){o=texture(u,vUv);}',
    display: head + 'uniform sampler2D u;void main(){vec3 c=texture(u,vUv).rgb;c=c*1.15/(1.+1.15*max(c.r,max(c.g,c.b)));c=pow(max(c,0.),vec3(.72));o=vec4(c,1.);}',
    clear: head + 'uniform sampler2D u;uniform float v;void main(){o=v*texture(u,vUv);}',
    splat: head + 'uniform sampler2D u;uniform float ar;uniform vec3 col;uniform vec2 p;uniform float r;void main(){vec2 d=vUv-p;d.x*=ar;vec3 s=exp(-dot(d,d)/r)*col;o=vec4(texture(u,vUv).xyz+s,1.);}',
    advect: head + 'uniform sampler2D v;uniform sampler2D s;uniform vec2 t;uniform float dt;uniform float diss;void main(){vec2 c=vUv-dt*texture(v,vUv).xy*t;o=texture(s,c)/(1.+diss*dt);}',
    div: head + 'uniform sampler2D v;void main(){float L=texture(v,vL).x,R=texture(v,vR).x,T=texture(v,vT).y,B=texture(v,vB).y;vec2 C=texture(v,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;o=vec4(.5*(R-L+T-B),0.,0.,1.);}',
    curl: head + 'uniform sampler2D v;void main(){float L=texture(v,vL).y,R=texture(v,vR).y,T=texture(v,vT).x,B=texture(v,vB).x;o=vec4(.5*(R-L-T+B),0.,0.,1.);}',
    vort: head + 'uniform sampler2D v;uniform sampler2D c;uniform float k;uniform float dt;void main(){float L=texture(c,vL).x,R=texture(c,vR).x,T=texture(c,vT).x,B=texture(c,vB).x,C=texture(c,vUv).x;vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+.0001;f*=k*C;f.y*=-1.;vec2 w=texture(v,vUv).xy+f*dt;o=vec4(clamp(w,-1000.,1000.),0.,1.);}',
    press: head + 'uniform sampler2D p;uniform sampler2D d;void main(){float L=texture(p,vL).x,R=texture(p,vR).x,T=texture(p,vT).x,B=texture(p,vB).x,D=texture(d,vUv).x;o=vec4((L+R+B+T-D)*.25,0.,0.,1.);}',
    grad: head + 'uniform sampler2D p;uniform sampler2D v;void main(){float L=texture(p,vL).x,R=texture(p,vR).x,T=texture(p,vT).x,B=texture(p,vB).x;vec2 w=texture(v,vUv).xy-vec2(R-L,T-B);o=vec4(w,0.,1.);}'
  };

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  var vs = shader(gl.VERTEX_SHADER, vert);
  function program(fs) {
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
    return { p: p, u: u, ok: gl.getProgramParameter(p, gl.LINK_STATUS) };
  }
  var P = {};
  for (var key in FS) { P[key] = program(FS[key]); if (!P[key].ok) return; }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function fbo(w, h) {
    gl.activeTexture(gl.TEXTURE0);
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex: tex, f: f, w: w, h: h, tx: 1 / w, ty: 1 / h, bind: function (unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit; } };
  }
  function pair(w, h) {
    var a = fbo(w, h), b = fbo(w, h);
    return { w: w, h: h, tx: a.tx, ty: a.ty, get read() { return a; }, get write() { return b; }, swap: function () { var t = a; a = b; b = t; } };
  }
  function blit(target) {
    if (target) { gl.viewport(0, 0, target.w, target.h); gl.bindFramebuffer(gl.FRAMEBUFFER, target.f); }
    else { gl.viewport(0, 0, canvas.width, canvas.height); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  function res(base) {
    var ar = canvas.width / canvas.height;
    return ar > 1 ? [Math.round(base * ar), base] : [base, Math.round(base / ar)];
  }
  var velocity, dye, divergence, curl, pressure;
  function resizeCanvas() {
    // El humo es suave: basta con menos resolución y el navegador lo escala.
    var dpr = small ? 0.75 : 0.66;
    var w = Math.round(canvas.clientWidth * dpr) || 1, h = Math.round(canvas.clientHeight * dpr) || 1;
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w; canvas.height = h;
    return true;
  }
  function init() {
    var s = res(SIM), d = res(DYE);
    velocity = pair(s[0], s[1]);
    dye = pair(d[0], d[1]);
    pressure = pair(s[0], s[1]);
    divergence = fbo(s[0], s[1]);
    curl = fbo(s[0], s[1]);
  }
  resizeCanvas();
  init();
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    // En móvil la barra del navegador cambia el alto: solo se reinicia si cambia el ancho.
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; small = Math.min(window.innerWidth, window.innerHeight) < 700; if (resizeCanvas()) { init(); ambient(4); } }
  });

  function use(pr, tx, ty) { gl.useProgram(pr.p); if (pr.u.t && tx) gl.uniform2f(pr.u.t, tx, ty); return pr.u; }

  function splat(x, y, dx, dy, c, radius) {
    var u = use(P.splat);
    var ar = canvas.width / canvas.height;
    gl.uniform1i(u.u, velocity.read.bind(0));
    gl.uniform1f(u.ar, ar);
    gl.uniform2f(u.p, x, y);
    gl.uniform3f(u.col, dx, dy, 0);
    var r = (radius || 0.28) / 100;
    if (ar > 1) r *= ar;
    gl.uniform1f(u.r, r);
    blit(velocity.write);
    velocity.swap();
    gl.uniform1i(u.u, dye.read.bind(0));
    gl.uniform3f(u.col, c[0], c[1], c[2]);
    blit(dye.write);
    dye.swap();
  }

  function step(dt) {
    gl.disable(gl.BLEND);
    var tx = velocity.tx, ty = velocity.ty, u;
    u = use(P.curl, tx, ty); gl.uniform1i(u.v, velocity.read.bind(0)); blit(curl);
    u = use(P.vort, tx, ty); gl.uniform1i(u.v, velocity.read.bind(0)); gl.uniform1i(u.c, curl.bind(1)); gl.uniform1f(u.k, CURL); gl.uniform1f(u.dt, dt); blit(velocity.write); velocity.swap();
    u = use(P.div, tx, ty); gl.uniform1i(u.v, velocity.read.bind(0)); blit(divergence);
    u = use(P.clear); gl.uniform1i(u.u, pressure.read.bind(0)); gl.uniform1f(u.v, 0.8); blit(pressure.write); pressure.swap();
    u = use(P.press, tx, ty); gl.uniform1i(u.d, divergence.bind(0));
    for (var i = 0; i < iterations; i++) { gl.uniform1i(u.p, pressure.read.bind(1)); blit(pressure.write); pressure.swap(); }
    u = use(P.grad, tx, ty); gl.uniform1i(u.p, pressure.read.bind(0)); gl.uniform1i(u.v, velocity.read.bind(1)); blit(velocity.write); velocity.swap();
    u = use(P.advect, tx, ty); gl.uniform2f(u.t, tx, ty);
    var vu = velocity.read.bind(0);
    gl.uniform1i(u.v, vu); gl.uniform1i(u.s, vu); gl.uniform1f(u.dt, dt); gl.uniform1f(u.diss, VEL_DISS); blit(velocity.write); velocity.swap();
    gl.uniform2f(P.advect.u.t, dye.tx, dye.ty);
    gl.uniform1i(u.v, velocity.read.bind(0)); gl.uniform1i(u.s, dye.read.bind(1)); gl.uniform1f(u.diss, DYE_DISS); blit(dye.write); dye.swap();
  }
  function render() {
    var u = use(P.display, dye.tx, dye.ty);
    gl.uniform1i(u.u, dye.read.bind(0));
    blit(null);
  }

  /* Paleta: tintas de la marca */
  var hex = function (h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; };
  var palette = ['#7fb746', '#cfe657', '#f06a8a', '#7fb746', '#9fe8d6'].map(hex);
  var pick = function () { return palette[Math.floor(Math.random() * palette.length)]; };
  var scale = function (c, k) { return [c[0] * k, c[1] * k, c[2] * k]; };

  function ambient(n) {
    for (var i = 0; i < (n || 1); i++) {
      var x = 0.08 + Math.random() * 0.84, up = 240 + Math.random() * 420;
      splat(x, Math.random() * 0.12, (Math.random() - 0.5) * 340, up, scale(pick(), 0.42), 0.08 + Math.random() * 0.1);
    }
  }

  var pointer = { x: 0, y: 0, moved: false, dx: 0, dy: 0, ready: false, color: pick() };
  function onMove(cx, cy) {
    var x = cx / window.innerWidth, y = 1 - cy / window.innerHeight;
    if (pointer.ready) { pointer.dx += (x - pointer.x); pointer.dy += (y - pointer.y); pointer.moved = true; }
    pointer.x = x; pointer.y = y; pointer.ready = true;
  }
  window.addEventListener('pointermove', function (e) { onMove(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('pointerdown', function (e) { pointer.ready = false; onMove(e.clientX, e.clientY); pointer.color = pick(); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  var skip = 1, tick = 0, scrollingUntil = 0;
  var active = true, running = false, last = 0, simTime = 0, nextAmbient = 0, colorAt = 0, slow = 0, frames = 0;
  function loop(now) {
    if (!active || document.hidden) { running = false; return; }
    requestAnimationFrame(loop);
    var ms = now - last;
    last = now;
    // Mientras se hace scroll el humo cede el procesador: el desplazamiento manda.
    if (++tick % (now < scrollingUntil ? skip + 2 : skip) !== 0) { last = now - ms; return; }
    var dt = Math.min(ms / 1000, 0.033);
    simTime += dt;
    if (ms > 45) slow++;
    if (++frames === 90) {
      // Equipos lentos: menos iteraciones antes que perder fluidez.
      if (slow > 45) { if (skip === 1) skip = 2; else if (iterations > 6) iterations = 6; else if (DYE > 320) { DYE = 320; SIM = 64; init(); ambient(3); } }
      frames = 0; slow = 0;
    }
    if (pointer.moved) {
      if (now > colorAt) { pointer.color = pick(); colorAt = now + 1300; }
      splat(pointer.x, pointer.y, pointer.dx * 7000, pointer.dy * 7000, scale(pointer.color, 0.4), 0.05);
      pointer.dx = pointer.dy = 0;
      pointer.moved = false;
    }
    if (simTime > nextAmbient) { ambient(1); nextAmbient = simTime + 0.6 + Math.random() * 0.7; }
    step(dt);
    render();
  }
  function start() { if (!running && active && !document.hidden) { running = true; last = performance.now(); requestAnimationFrame(loop); } }
  document.addEventListener('visibilitychange', start);

  var lastStir = 0;
  window.AmbiFluid = {
    burst: function (color, x, y) {
      var c = typeof color === 'string' ? hex(color) : color || pick();
      var px = x == null ? 0.5 : x, py = y == null ? 0.5 : y, n = 6;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2 + Math.random() * 0.5, f = 800 + Math.random() * 700;
        splat(px, py, Math.cos(a) * f, Math.sin(a) * f, scale(c, 0.6), 0.1);
      }
      start();
    },
    stir: function (v) {
      if (!running) return;
      var t = performance.now();
      scrollingUntil = t + 180;
      if (t - lastStir < 160) return;
      lastStir = t;
      var f = Math.max(-1600, Math.min(1600, v * 2.2));
      if (Math.abs(f) < 30) return;
      splat(Math.random(), Math.random(), (Math.random() - 0.5) * 200, f, scale(pick(), 0.03), 0.3);
    },
    setPalette: function (list) { if (list && list.length) palette = list.map(hex); },
    setActive: function (on) { active = on; if (on) start(); }
  };
  document.documentElement.classList.add('fluid');
  document.dispatchEvent(new Event('ambi-fluid'));
  ambient(4);
  start();
})();
