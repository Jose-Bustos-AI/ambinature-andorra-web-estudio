(function () {
  'use strict';
  var SCRIPT = document.currentScript && document.currentScript.src;
  var d = document, root = d.documentElement, body = d.body;
  var i18n = window.AMBI_I18N || {};
  var FX = root.classList.contains('fx');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- Funciones básicas: funcionan siempre, con o sin efectos ---------- */
  var ticking = false;
  function onScroll() {
    root.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  var btn = $('.menu-btn'), nav = $('#nav');
  if (btn && nav) {
    var setMenu = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? btn.dataset.close : btn.dataset.open);
      nav.classList.toggle('open', open);
      body.classList.toggle('menu-open', open);
    };
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); } });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function () { setMenu(false); });
  }

  /* Interruptor de efectos */
  function setFx(on) {
    try { localStorage.setItem('ambi-fx', on ? 'on' : 'off'); } catch (e) { /* sin almacenamiento */ }
    window.location.replace(window.location.href.replace(/([?&])fx=(on|off)&?/, '$1').replace(/[?&]$/, ''));
  }
  $$('.fx-toggle').forEach(function (t) {
    t.textContent = FX ? t.dataset.off : t.dataset.on;
    t.addEventListener('click', function () { setFx(!FX); });
  });
  var pill = $('.fx-pill');
  if (pill && !FX && root.classList.contains('prefers-still')) {
    pill.hidden = false;
    pill.addEventListener('click', function () { setFx(true); });
  }

  /* Pestañas (pirámide olfativa) */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var select = function (t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        d.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
      if (window.AmbiFluid && t.dataset.ink) window.AmbiFluid.burst(t.dataset.ink, 0.3 + Math.random() * 0.4, 0.5);
    };
    list.addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t) select(t); });
    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(d.activeElement), n = tabs.length;
      if (i < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(tabs[(i + 1) % n], true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i - 1 + n) % n], true); }
    });
  });

  /* Formulario: valida y prepara un correo; nunca simula un envío */
  var form = d.getElementById('contact-form');
  if (form) {
    var status = d.getElementById('form-status');
    var preset = new URLSearchParams(window.location.search).get('s');
    var presetOpt = preset && $('#f-interes option[value="' + preset.replace(/[^a-z]/g, '') + '"]');
    if (presetOpt) presetOpt.selected = true;
    var showErr = function (field, msg) {
      var err = d.getElementById(field.id + '-err');
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.textContent = msg || ''; err.classList.toggle('show', !!msg); }
    };
    var check = function (field) {
      var v = field.value.trim(), msg = '';
      if (field.required && !v) msg = i18n.required;
      else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = i18n.badEmail;
      else if (field.type === 'tel' && v && !/^[+()\d\s.-]{6,20}$/.test(v)) msg = i18n.badTel;
      showErr(field, msg);
      return !msg;
    };
    var fields = $$('input[type="text"], input[type="email"], input[type="tel"], textarea', form);
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value.trim() || f.getAttribute('aria-invalid') === 'true') check(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.hidden = true;
      var firstBad = null;
      fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
      if (firstBad) { firstBad.focus(); return; }
      var val = function (id) { return d.getElementById(id).value.trim(); };
      var who = $('input[name="tipo"]:checked', form);
      var interest = d.getElementById('f-interes');
      var label = interest.options[interest.selectedIndex].text;
      var lines = [
        i18n.lName + ': ' + val('f-nombre'),
        val('f-empresa') ? i18n.lCompany + ': ' + val('f-empresa') : null,
        i18n.lType + ': ' + who.parentElement.textContent.trim(),
        i18n.lInterest + ': ' + label,
        i18n.lEmail + ': ' + val('f-email'),
        val('f-tel') ? i18n.lTel + ': ' + val('f-tel') : null,
        '',
        val('f-mensaje')
      ].filter(function (l) { return l !== null; }).join('\r\n');
      var mail = d.createElement('a');
      mail.href = 'mailto:' + form.dataset.to + '?subject=' + encodeURIComponent(i18n.subject + ' - ' + label) + '&body=' + encodeURIComponent(lines);
      mail.hidden = true;
      body.appendChild(mail);
      mail.click();
      mail.remove();
      status.hidden = false;
      status.focus();
      if (window.AmbiFluid) window.AmbiFluid.burst('#cfe657');
    });
  }

  /* Botones de aromas: funcionan si hay fluido */
  $$('[data-paint] button').forEach(function (b, i) {
    b.addEventListener('click', function () {
      if (!window.AmbiFluid) return;
      var r = b.getBoundingClientRect();
      window.AmbiFluid.burst(b.dataset.ink, (r.left + r.width / 2) / window.innerWidth, 1 - (r.top + r.height / 2) / window.innerHeight);
      b.classList.add('is-on');
      setTimeout(function () { b.classList.remove('is-on'); }, 900);
    });
  });

  /* Sin efectos o sin GSAP: la página queda completa y estática */
  if (!FX || !window.gsap || !window.ScrollTrigger) { return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  root.classList.add('fx-ready');
  var mm = gsap.matchMedia();
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Desplazamiento suave en escritorio */
  ST.config({ ignoreMobileResize: true });
  var lenis = null;
  if (fine && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.14, wheelMultiplier: 1, anchors: { offset: -80 } });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* El scroll remueve el humo; el lienzo se detiene si no se ve */
  var smokeSections = $$('.smoke');
  d.addEventListener('ambi-fluid', function () {
    if (window.AMBI_INK) window.AmbiFluid.setPalette(window.AMBI_INK);
    var visible = new Set();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      window.AmbiFluid.setActive(visible.size > 0);
    });
    smokeSections.forEach(function (s) { io.observe(s); });
    var lastY = window.scrollY;
    ST.create({ onUpdate: function () { var y = window.scrollY; window.AmbiFluid.stir(y - lastY); lastY = y; } });
    if ($('.hero')) { window.AmbiFluid.burst('#7fb746', 0.72, 0.5); window.AmbiFluid.burst('#cfe657', 0.86, 0.32); window.AmbiFluid.burst('#f06a8a', 0.6, 0.22); }
    else { window.AmbiFluid.burst(undefined, 0.78, 0.55); window.AmbiFluid.burst(undefined, 0.62, 0.3); }
  });

  /* Texto por letras, palabras y líneas */
  function wrapWords(el, cls) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    return words.map(function (w, i) {
      var s = d.createElement('span');
      s.className = cls;
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(d.createTextNode(' '));
      return s;
    });
  }
  function splitChars(el) {
    var out = [];
    wrapWords(el, 'w').forEach(function (w) {
      var txt = w.textContent;
      w.textContent = '';
      Array.from(txt).forEach(function (c) {
        var s = d.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        w.appendChild(s);
        out.push(s);
      });
    });
    return out;
  }
  $$('[data-chars]').forEach(function (el) {
    var label = el.textContent.trim();
    var chars = splitChars(el);
    el.setAttribute('aria-label', label);
    gsap.from(chars, { yPercent: 115, rotate: 7, opacity: 0, duration: 0.85, ease: 'expo.out', stagger: { amount: 0.42 }, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  $$('[data-lines]').forEach(function (el) {
    gsap.from(wrapWords(el, 'w'), { yPercent: 60, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  $$('[data-rise]').forEach(function (el) {
    gsap.from(el, { y: 36, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
  });

  /* Portada: productos que flotan y se dispersan al bajar */
  var hero = $('.hero');
  if (hero) {
    gsap.to('.hero-in', { yPercent: -14, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: hero, start: '35% top', end: 'bottom top', scrub: true } });
  }

  /* Manifiesto: el vídeo se abre y las palabras se encienden */
  var man = $('[data-manifesto]');
  if (man) {
    var video = $('video', man), text = $('[data-words]', man), stage = $('.man-stage', man);
    var words = wrapWords(text, 'w');
    var loadVideo = function () {
      if (video.dataset.loaded) return;
      video.dataset.loaded = '1';
      $$('source', video).forEach(function (s) { s.src = s.dataset.src; });
      video.load();
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    };
    var manVideo = $('.man-video', man);
    manVideo.style.willChange = 'opacity, transform';
    var tl = gsap.timeline({ scrollTrigger: { trigger: man, start: 'top top', end: '+=200%', pin: stage, scrub: true, anticipatePin: 1, onEnter: loadVideo, onEnterBack: loadVideo } });
    tl.fromTo(manVideo, { opacity: 0, scale: 1.22 }, { opacity: 1, scale: 1, ease: 'power1.out', duration: 1 }, 0);
    tl.fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.08, duration: 0.2, ease: 'none' }, 0.25);
    tl.to({}, { duration: 0.35 });
    ST.create({ trigger: man, start: 'top bottom', end: 'bottom top', onLeave: function () { video.pause(); }, onLeaveBack: function () { video.pause(); }, onEnter: loadVideo, onEnterBack: function () { video.play().catch(function () {}); } });
  }

  /* Paneles duo */
  $$('.duo-panel').forEach(function (p, i) {
    gsap.from(p, { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', delay: i * 0.1, scrollTrigger: { trigger: p, start: 'top 90%', once: true } });
    var img = $('img', p);
    if (img) gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: p, scrub: true } });
  });

  /* Servicios en horizontal (escritorio) y cartas apiladas (móvil) */
  var hs = $('[data-hscroll]');
  if (hs) {
    var track = $('.h-track', hs);
    mm.add('(min-width: 900px)', function () {
      hs.classList.add('is-h');
      gsap.to(track, { x: function () { return -(track.scrollWidth - window.innerWidth); }, ease: 'none', scrollTrigger: { trigger: hs, start: 'top top', end: function () { return '+=' + (track.scrollWidth - window.innerWidth); }, pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true } });
      return function () { hs.classList.remove('is-h'); gsap.set(track, { clearProps: 'x' }); };
    });
    mm.add('(max-width: 899px)', function () {
      var panels = $$('.h-service', hs);
      panels.forEach(function (p, i) {
        if (i === panels.length - 1) return;
        gsap.to(p, { scale: 0.9, opacity: 0, ease: 'none', scrollTrigger: { trigger: panels[i + 1], start: 'top bottom', end: 'top 15%', scrub: true } });
      });
    });
  }

  /* Cinta de aromas: se inclina y acelera con el scroll */
  $$('[data-marquee]').forEach(function (m) {
    var uls = $$('ul', m), tween = gsap.to(uls, { xPercent: -100, duration: 34, ease: 'none', repeat: -1, paused: true });
    var skew = gsap.quickTo(m.firstElementChild, 'skewX', { duration: 0.4, ease: 'power3' });
    var calm = gsap.delayedCall(0.25, function () { skew(0); gsap.to(tween, { timeScale: 1, duration: 0.8, overwrite: true }); }).pause();
    ST.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onToggle: function (self) { if (self.isActive) tween.play(); else tween.pause(); },
      onUpdate: function (self) {
        var v = self.getVelocity();
        gsap.killTweensOf(tween, 'timeScale');
        tween.timeScale((v < 0 ? -1 : 1) * (1 + Math.min(Math.abs(v) / 700, 3)));
        skew(Math.max(-10, Math.min(10, -v / 300)));
        calm.restart(true);
      }
    });
  });

  /* Aromas: se dispara uno solo al entrar */
  var paint = $('[data-paint]');
  if (paint) {
    gsap.from($$('button', paint), { y: 50, opacity: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: paint, start: 'top 85%', once: true, onEnter: function () {
      var b = $$('button', paint);
      b.slice(0, 3).forEach(function (x, i) { setTimeout(function () { x.click(); }, 250 + i * 320); });
    } } });
  }

  /* Vitrina: una foto a pantalla por producto, con fundido al bajar */
  var show = $('[data-showcase]');
  if (show) {
    var items = $$('.show-item', show);
    mm.add('(min-width: 900px)', function () {
      show.classList.add('is-pinned');
      gsap.set(items[0], { autoAlpha: 1 });
      var stl = gsap.timeline({ scrollTrigger: { trigger: show, start: 'top top', end: '+=' + (items.length * 70) + '%', pin: $('.show-stage', show), scrub: true, anticipatePin: 1 } });
      items.forEach(function (it, i) {
        if (i === 0) return;
        var f = $('figure img', it), b = $('.show-body', it);
        // Primero sale un producto y luego entra el siguiente: nunca se solapan los textos.
        stl.to(items[i - 1], { autoAlpha: 0, duration: 0.22 }, i - 0.5)
          .fromTo(it, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, i - 0.27)
          .fromTo(f, { scale: 1.06 }, { scale: 1, duration: 0.7, ease: 'none' }, i - 0.27)
          .fromTo(b, { y: 36 }, { y: 0, duration: 0.3, ease: 'power2.out' }, i - 0.27);
      });
      stl.to({}, { duration: 0.4 });
      // Teclado: enfocar un producto lleva a su posición.
      items.forEach(function (it, i) {
        it.addEventListener('focus', function () {
          var st = stl.scrollTrigger;
          window.scrollTo(0, st.start + (st.end - st.start) * (i / (items.length - 0.6)));
        });
      });
      return function () { show.classList.remove('is-pinned'); gsap.set(items, { clearProps: 'all' }); };
    });
    mm.add('(max-width: 899px)', function () {
      items.forEach(function (it) { gsap.from(it, { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: it, start: 'top 88%', once: true } }); });
    });
  }

  /* Pasos: línea de progreso y encendido */
  $$('[data-steps]').forEach(function (s) {
    var items = $$('li', s);
    gsap.fromTo(s, { '--line': 0 }, { '--line': 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top 75%', end: 'bottom 55%', scrub: true } });
    items.forEach(function (it, i) { gsap.from(it, { opacity: 0.12, y: 40, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: s, start: 'top ' + (75 - i * 9) + '%', toggleActions: 'play none none reverse' } }); });
  });

  /* Filas y bloques */
  $$('[data-parallax]').forEach(function (f) {
    var im = $('img', f), k = Number(f.dataset.parallax) || 6;
    gsap.from(f, { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 90%', once: true } });
    gsap.fromTo(im, { yPercent: -k }, { yPercent: k, ease: 'none', scrollTrigger: { trigger: f, scrub: true } });
  });
  $$('[data-float]').forEach(function (f) {
    gsap.from(f, { y: 60, opacity: 0, scale: 0.86, duration: 1.3, delay: 0.2, ease: 'expo.out' });
    gsap.to(f, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: f.closest('section'), start: 'top top', end: 'bottom top', scrub: true } });
  });
  $$('.post').forEach(function (p, i) {
    gsap.from(p, { y: 90 + i * 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 95%', once: true } });
  });
  $$('[data-strip] .product').forEach(function (p, i) {
    gsap.from(p, { x: 80, opacity: 0, duration: 0.8, delay: i * 0.07, ease: 'power3.out', scrollTrigger: { trigger: p.parentNode, start: 'top 88%', once: true } });
  });
  gsap.from('.footer-logo', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.footer-logo', start: 'top 98%', once: true } });

  /* Pirámide: las capas se separan al entrar */
  var pyr = $$('.pyr-levels button');
  if (pyr.length) gsap.from(pyr, { y: function (i) { return 90 - i * 30; }, opacity: 0, duration: 1, stagger: 0.14, ease: 'expo.out', scrollTrigger: { trigger: pyr[0], start: 'top 85%', once: true } });

  if (fine) {
    /* Botones magnéticos */
    $$('[data-magnetic]').forEach(function (m) {
      var mx = gsap.quickTo(m, 'x', { duration: 0.5, ease: 'power3' }), my = gsap.quickTo(m, 'y', { duration: 0.5, ease: 'power3' });
      m.addEventListener('pointermove', function (e) {
        var r = m.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      m.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
    /* Imagen que sigue al cursor en listas */
    var hv = $('.hover-img'), hvImg = hv && $('img', hv);
    if (hv) {
      var hx = gsap.quickTo(hv, 'x', { duration: 0.5, ease: 'power3' }), hy = gsap.quickTo(hv, 'y', { duration: 0.5, ease: 'power3' });
      window.addEventListener('pointermove', function (e) { hx(e.clientX + 24); hy(e.clientY - 150); }, { passive: true });
      $$('[data-hover-img]').forEach(function (el) {
        if (!el.dataset.hoverImg) return;
        el.addEventListener('pointerenter', function () { hvImg.src = el.dataset.hoverImg; hv.classList.add('on'); });
        el.addEventListener('pointerleave', function () { hv.classList.remove('on'); });
      });
    }
    /* Inclinación 3D */
    $$('[data-tilt]').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect();
        gsap.to(t, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 22, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 22, duration: 0.5, ease: 'power3.out', transformPerspective: 900 });
      });
      t.addEventListener('pointerleave', function () { gsap.to(t, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, .5)' }); });
    });
  }

  /* El humo se carga después de la página para no retrasar la lectura */
  window.addEventListener('load', function () {
    ST.refresh();
    if (!SCRIPT || (navigator.connection && navigator.connection.saveData)) return;
    setTimeout(function () {
      var f = d.createElement('script');
      f.src = SCRIPT.replace('main.js', 'fluid.js');
      d.body.appendChild(f);
    }, 500);
  });
})();
