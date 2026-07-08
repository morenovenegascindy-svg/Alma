(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var resizeHandlers = [];

  // ── HERO SLIDESHOW ──
  var slides = document.querySelectorAll('.hero-slide');
  if (!prefersReduced && slides.length > 1) {
    var current = 0;
    setInterval(function () {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5000);
  }

  // ── STAFF FILTERS ──
  document.querySelectorAll('.sf-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.sf-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      document.querySelectorAll('.staff-card').forEach(function (card) {
        var cat = card.dataset.cat || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.style.display = '';
          setTimeout(function () { card.style.opacity = '1'; }, 10);
        } else {
          card.style.opacity = '0';
          setTimeout(function () { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  // ── SUC-PHOTO BACKGROUNDS ──
  document.querySelectorAll('.suc-photo[data-bg]').forEach(function (el) {
    el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
  });

  // ── PHOTO CAROUSEL ──
  document.querySelectorAll('.suc-photos-wrap').forEach(function (wrap) {
    var photos = Array.from(wrap.children);
    var count = photos.length;

    var track = document.createElement('div');
    track.className = 'suc-photos-track';
    photos.forEach(function (p) { track.appendChild(p); });
    photos.forEach(function (p) { track.appendChild(p.cloneNode(true)); });
    wrap.appendChild(track);

    var photoW = 0;
    var totalW = 0;
    var pos = 0;

    function size() {
      var isMobile = window.matchMedia('(max-width: 1023px)').matches;
      wrap.style.width = '';
      Array.from(track.children).forEach(function (p) {
        p.style.width = '';
        p.style.minWidth = '';
      });
      photoW = track.children[0].offsetWidth || wrap.offsetWidth || wrap.parentElement.offsetWidth || 320;
      if (!isMobile) {
        wrap.style.width = (photoW * count) + 'px';
      }
      Array.from(track.children).forEach(function (p) {
        p.style.width = photoW + 'px';
        p.style.minWidth = photoW + 'px';
      });
      totalW = photoW * count;
      if (totalW > 0) pos = pos % totalW;
    }

    size();
    resizeHandlers.push(size);

    if (prefersReduced) return;

    var CYCLE_MS = 16000;
    var lastTime = null;
    var paused = false;

    function tick(now) {
      if (!paused) {
        if (lastTime !== null) {
          pos += (totalW / CYCLE_MS) * (now - lastTime);
          if (pos >= totalW) pos -= totalW;
          track.style.transform = 'translate3d(-' + pos + 'px, 0, 0)';
        }
        lastTime = now;
      } else {
        lastTime = null;
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    wrap.addEventListener('mouseenter', function () { paused = true; });
    wrap.addEventListener('mouseleave', function () { paused = false; });
  });

  // ── EQUIP CAROUSEL ──
  var equipWrap = document.querySelector('.equip-carousel-wrap');
  if (equipWrap) {
    var equipCards = Array.from(equipWrap.children);
    var equipCount = equipCards.length;
    var equipTrack = document.createElement('div');
    equipTrack.className = 'equip-carousel-track';
    equipCards.forEach(function (c) { equipTrack.appendChild(c); });
    equipCards.forEach(function (c) {
      var clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      equipTrack.appendChild(clone);
    });
    equipWrap.appendChild(equipTrack);

    var equipCardW = 0;
    var equipTotalW = 0;
    var equipPos = 0;
    var equipLast = null;
    var equipPaused = false;

    var equipSize = function () {
      equipCardW = equipTrack.children[0].offsetWidth + 12;
      equipTotalW = equipCardW * equipCount;
      if (equipTotalW > 0) equipPos = equipPos % equipTotalW;
    };

    equipSize();
    resizeHandlers.push(equipSize);

    if (!prefersReduced) {
      var equipTick = function (now) {
        if (!equipPaused) {
          if (equipLast !== null) {
            equipPos += (equipTotalW / 22000) * (now - equipLast);
            if (equipPos >= equipTotalW) equipPos -= equipTotalW;
            equipTrack.style.transform = 'translate3d(-' + equipPos + 'px, 0, 0)';
          }
          equipLast = now;
        } else {
          equipLast = null;
        }
        requestAnimationFrame(equipTick);
      };
      requestAnimationFrame(equipTick);
    }

    equipWrap.addEventListener('mouseenter', function () { equipPaused = true; });
    equipWrap.addEventListener('mouseleave', function () { equipPaused = false; });
  }

  // ── RESIZE ──
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeHandlers.forEach(function (fn) { fn(); });
    }, 150);
  });

  // ── NAV HAMBURGER ──
  var hamburger = document.getElementById('hamburger');
  var drawer = document.getElementById('drawer');

  function closeDrawer() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    var isOpen = drawer.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  drawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  // ── SERV CARD EXPAND ──
  document.querySelectorAll('.serv-card-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expand = btn.closest('.serv-card-body').querySelector('.serv-card-expand');
      var isOpen = !expand.hidden;
      expand.hidden = isOpen;
      btn.textContent = isOpen ? 'Ver más +' : 'Ver menos −';
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ── NOSOTROS CARD EXPAND ──
  document.querySelectorAll('.nosotros-card-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.nosotros-card');
      var isOpen = card.classList.toggle('open');
      btn.textContent = isOpen ? 'Ver menos −' : 'Ver más +';
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // ── STAFF DETAIL TOGGLE ──
  document.querySelectorAll('.staff-plus[aria-expanded]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.staff-card');
      var isOpen = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      var name = card.querySelector('.staff-name').textContent;
      btn.setAttribute('aria-label', (isOpen ? 'Cerrar detalle de ' : 'Ver detalle de ') + name);
    });
  });

  // ── FORMULARIO CONSULTA ──
  var formConsulta = document.getElementById('form-consulta');
  if (formConsulta) {
    var SUPABASE_URL = 'https://omweqfddnsprxsfsuylg.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9td2VxZmRkbnNwcnhzZnN1eWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NjcxMDUsImV4cCI6MjA5OTA0MzEwNX0.a7T81lakLaHZxSUk5f-_AVhAnb_56kTdm5TQUfvnVF8';
    var formStatus = document.getElementById('cf-status');
    var formBtn = formConsulta.querySelector('.conv-form-btn');
    var formReadyAt = Date.now();

    function setStatus(msg, type) {
      if (!formStatus) return;
      formStatus.textContent = msg;
      formStatus.className = 'conv-form-status' + (type ? ' conv-form-status--' + type : '');
    }

    formConsulta.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!formConsulta.checkValidity()) {
        formConsulta.reportValidity();
        return;
      }

      // Anti-bot: honeypot lleno o envío demasiado rápido (< 2s) → descartar en silencio
      if (formConsulta.website.value !== '' || (Date.now() - formReadyAt) < 2000) {
        formConsulta.reset();
        setStatus('¡Gracias! Recibimos tu mensaje y te contactaremos pronto.', 'ok');
        return;
      }

      formBtn.disabled = true;
      setStatus('Enviando…', '');

      var payload = {
        nombre: formConsulta.nombre.value.trim(),
        email: formConsulta.email.value.trim(),
        telefono: formConsulta.telefono.value.trim() || null,
        mensaje: formConsulta.mensaje.value.trim() || null,
        privacidad: formConsulta.privacy.checked
      };

      fetch(SUPABASE_URL + '/rest/v1/consultas', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.ok) {
          formConsulta.reset();
          setStatus('¡Gracias! Recibimos tu mensaje y te contactaremos pronto.', 'ok');
        } else {
          setStatus('No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.', 'error');
        }
      }).catch(function () {
        setStatus('Error de conexión. Revisa tu internet e inténtalo nuevamente.', 'error');
      }).then(function () {
        formBtn.disabled = false;
      });
    });
  }

  // ── MODALES LEGALES ──
  var modalTrigger = null;

  function openModal(modal, trigger) {
    modalTrigger = trigger || null;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  }
  function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (modalTrigger) {
      modalTrigger.focus();
      modalTrigger = null;
    }
  }

  function bindModal(modal, closeBtn, triggers) {
    triggers.forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(modal, btn);
      });
    });
    closeBtn.addEventListener('click', function () { closeModal(modal); });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(modal);
    });
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = modal.querySelectorAll('.modal-close, .modal-body, .modal-body a[href], .modal-body button');
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  var modalTerminos = document.getElementById('modalTerminos');
  var modalPrivacidad = document.getElementById('modalPrivacidad');

  bindModal(modalTerminos, document.getElementById('modalTerminosClose'), [
    document.getElementById('btn-terminos')
  ]);
  bindModal(modalPrivacidad, document.getElementById('modalPrivacidadClose'), [
    document.getElementById('btn-privacidad-consulta'),
    document.getElementById('btn-privacidad-footer')
  ]);

  // ── AVISO DE COOKIES ──
  var cookieBar = document.getElementById('cookieBar');
  if (cookieBar) {
    var COOKIE_KEY = 'alma_cookies_ok';
    var cookiesOk = false;
    try {
      cookiesOk = localStorage.getItem(COOKIE_KEY) === '1';
    } catch (err) {}

    if (!cookiesOk) {
      setTimeout(function () {
        cookieBar.hidden = false;
      }, 800);

      document.getElementById('cookieBarOk').addEventListener('click', function () {
        try {
          localStorage.setItem(COOKIE_KEY, '1');
        } catch (err) {}
        cookieBar.hidden = true;
      });

      document.getElementById('cookieBarPolicy').addEventListener('click', function () {
        var btnPrivacidad = document.getElementById('btn-privacidad-footer');
        if (btnPrivacidad) btnPrivacidad.click();
      });
    }
  }

  // ── HAMBURGER VISIBILITY ──
  var heroEl = document.querySelector('.hero');
  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      hamburger.classList.remove('nav-visible');
    } else {
      hamburger.classList.add('nav-visible');
    }
  }, { threshold: 0 }).observe(heroEl);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (drawer.classList.contains('open')) {
        closeDrawer();
        hamburger.focus();
      }
      [modalTerminos, modalPrivacidad].forEach(function (modal) {
        if (modal.classList.contains('open')) closeModal(modal);
      });
    }
  });

}());
