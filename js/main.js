/* ============================================================
   HIREBRIDGE – MASTER JAVASCRIPT
   Premium Recruitment & Staffing Agency
   Version 1.0
   ============================================================ */

'use strict';

/* ——— UTILITY ——— */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

/* ——— THEME & DIRECTION (LocalStorage persistence) ——— */
const Theme = (() => {
  const KEY_THEME = 'hb_theme';
  const KEY_DIR   = 'hb_dir';

  function apply(theme, dir) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', dir);
    // Update toggle button icons
    $$('[data-theme-toggle]').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    $$('[data-dir-toggle]').forEach(btn => {
      btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL');
    });
  }

  function init() {
    const savedTheme = localStorage.getItem(KEY_THEME) || 'light';
    const savedDir   = localStorage.getItem(KEY_DIR)   || 'ltr';
    apply(savedTheme, savedDir);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next    = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY_THEME, next);
    apply(next, document.documentElement.getAttribute('dir') || 'ltr');
  }

  function toggleDir() {
    const current = document.documentElement.getAttribute('dir') || 'ltr';
    const next    = current === 'rtl' ? 'ltr' : 'rtl';
    localStorage.setItem(KEY_DIR, next);
    apply(document.documentElement.getAttribute('data-theme') || 'light', next);
  }

  return { init, toggleTheme, toggleDir };
})();

/* ——— NAVBAR ——— */
const Navbar = (() => {
  function init() {
    const navbar = $('#navbar');
    if (!navbar) return;

    // Scroll behaviour
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    on(window, 'scroll', onScroll, { passive: true });
    onScroll();

    // Active link detection
    const links = $$('.nav-link', navbar);
    const path  = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes(path)) link.classList.add('active');
    });
  }

  return { init };
})();

/* ——— MOBILE NAVIGATION ——— */
const MobileNav = (() => {
  function init() {
    const hamburger  = $('#hamburger');
    const mobileNav  = $('#mobileNav');
    const closeBtn   = $('#mobileNavClose');

    if (!hamburger || !mobileNav) return;

    function open() {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }

    on(hamburger, 'click', () => mobileNav.classList.contains('open') ? close() : open());
    on(closeBtn, 'click', close);
    on(mobileNav, 'click', e => { if (e.target === mobileNav) close(); });
    $$('.mobile-nav-link', mobileNav).forEach(link => on(link, 'click', close));
    on(document, 'keydown', e => { if (e.key === 'Escape') close(); });
  }

  return { init };
})();

/* ——— SCROLL REVEAL ——— */
const ScrollReveal = (() => {
  let observer;

  function init() {
    const els = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    els.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ——— BACK TO TOP ——— */
const BackToTop = (() => {
  function init() {
    const btn = $('#backToTop');
    if (!btn) return;

    on(window, 'scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    on(btn, 'click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init };
})();

/* ——— TOAST NOTIFICATIONS ——— */
const Toast = (() => {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 4000) {
    const icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
      error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <span>${message}</span>
      <button class="toast-close" aria-label="Close">×</button>
    `;
    getContainer().appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });

    function dismiss() {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }
    on($('.toast-close', toast), 'click', dismiss);
    if (duration > 0) setTimeout(dismiss, duration);
    return { dismiss };
  }

  return { show };
})();

/* ——— FAQ ACCORDIONS ——— */
const FAQ = (() => {
  function init() {
    $$('.faq-question').forEach(q => {
      on(q, 'click', () => {
        const item   = q.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const isOpen = item.classList.contains('open');

        // Close all
        $$('.faq-item.open').forEach(open => {
          open.classList.remove('open');
          open.querySelector('.faq-answer').style.maxHeight = '0';
        });

        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  return { init };
})();

/* ——— FORM VALIDATION ——— */
const FormValidation = (() => {
  const rules = {
    required: v => v.trim() !== '',
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone:    v => /^[\+]?[\d\s\-\(\)]{7,}$/.test(v.trim()),
    minlen:   (v, n) => v.trim().length >= n,
  };

  function validate(field) {
    const type    = field.type;
    const value   = field.value;
    const name    = field.name;
    let   error   = '';

    if (field.required && !rules.required(value)) {
      error = 'This field is required.';
    } else if (type === 'email' && value && !rules.email(value)) {
      error = 'Please enter a valid email address.';
    } else if (name === 'phone' && value && !rules.phone(value)) {
      error = 'Please enter a valid phone number.';
    }

    const group  = field.closest('.form-group');
    const errMsg = group?.querySelector('.form-error');
    if (errMsg) {
      errMsg.textContent = error;
      errMsg.classList.toggle('visible', !!error);
    }
    field.classList.toggle('error', !!error);
    field.classList.toggle('success', !error && !!value);
    return !error;
  }

  function init() {
    $$('form[data-validate]').forEach(form => {
      const fields = $$('input, textarea, select', form);
      fields.forEach(field => on(field, 'blur', () => validate(field)));

      on(form, 'submit', e => {
        e.preventDefault();
        let valid = true;
        fields.forEach(field => { if (!validate(field)) valid = false; });
        if (valid) {
          Toast.show('Thank you! Your enquiry has been received. This is a front-end demonstration — please note that submissions are not delivered without backend integration.', 'success', 7000);
          form.reset();
          fields.forEach(f => f.classList.remove('success', 'error'));
        } else {
          Toast.show('Please complete all required fields.', 'error');
        }
      });
    });
  }

  return { init, validate };
})();

/* ——— FILE UPLOAD ——— */
const FileUpload = (() => {
  function init() {
    $$('.upload-zone').forEach(zone => {
      const input  = $('input[type="file"]', zone);
      const status = zone.closest('.form-group')?.querySelector('.upload-status') ||
                     zone.nextElementSibling;
      if (!input) return;

      function handleFile(file) {
        if (!file) return;
        const allowed = ['application/pdf','application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowed.includes(file.type)) {
          Toast.show('Please upload a PDF or Word document (.pdf, .doc, .docx).', 'error');
          return;
        }
        if (file.size > maxSize) {
          Toast.show('File size must not exceed 5MB.', 'error');
          return;
        }
        if (status) {
          status.classList.add('visible');
          const nameEl = status.querySelector('.upload-filename');
          if (nameEl) nameEl.textContent = file.name;
          else status.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${file.name} selected (front-end only)</span>
          `;
        }
        Toast.show(`${file.name} selected. Note: file is not uploaded without a backend.`, 'info');
      }

      on(input, 'change', e => handleFile(e.target.files[0]));

      on(zone, 'dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
      on(zone, 'dragleave', () => zone.classList.remove('drag-over'));
      on(zone, 'drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        handleFile(e.dataTransfer.files[0]);
      });
    });
  }

  return { init };
})();

/* ——— PASSWORD TOGGLE ——— */
const PasswordToggle = (() => {
  function init() {
    $$('.password-toggle').forEach(btn => {
      const wrapper = btn.closest('.password-wrapper');
      const input   = wrapper?.querySelector('input[type="password"], input[data-pwd]');
      if (!input) return;

      const eyeOpen   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      const eyeClosed = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

      btn.innerHTML = eyeOpen;
      on(btn, 'click', () => {
        const isHidden = input.type === 'password';
        input.type     = isHidden ? 'text' : 'password';
        btn.innerHTML  = isHidden ? eyeClosed : eyeOpen;
        btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      });
    });
  }

  return { init };
})();

/* ——— AUTH PAGE (Login / Register) ——— */
const AuthPage = (() => {
  function init() {
    // Tab switching
    $$('[data-auth-tab]').forEach(tab => {
      on(tab, 'click', () => {
        const target = tab.dataset.authTab;
        $$('[data-auth-tab]').forEach(t => t.classList.toggle('active', t === tab));
        $$('[data-auth-panel]').forEach(p => p.classList.toggle('d-none', p.dataset.authPanel !== target));
      });
    });

    // User type switching
    $$('[data-user-type]').forEach(btn => {
      on(btn, 'click', () => {
        const type    = btn.dataset.userType;
        const parent  = btn.closest('[data-user-type-group]') || btn.closest('.auth-panel');
        $$('[data-user-type]', parent).forEach(b => b.classList.toggle('active', b === btn));
        $$('[data-user-type-form]', parent).forEach(f => {
          f.classList.toggle('d-none', f.dataset.userTypeForm !== type);
        });
      });
    });
  }

  return { init };
})();

/* ——— CONTACT FORM SWITCHING (Candidate / Employer) ——— */
const ContactSwitch = (() => {
  function init() {
    $$('[data-contact-type]').forEach(btn => {
      on(btn, 'click', () => {
        const type = btn.dataset.contactType;
        $$('[data-contact-type]').forEach(b => b.classList.toggle('active', b === btn));
        $$('[data-contact-form]').forEach(f => {
          f.classList.toggle('d-none', f.dataset.contactForm !== type);
        });
      });
    });
  }

  return { init };
})();

/* ——— LIGHTBOX ——— */
const Lightbox = (() => {
  let overlay, img;

  function init() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close lightbox">×</button>
        <img src="" alt="">
      </div>`;
    document.body.appendChild(overlay);
    img = overlay.querySelector('img');

    on($('.lightbox-close', overlay), 'click', close);
    on(overlay, 'click', e => { if (e.target === overlay) close(); });
    on(document, 'keydown', e => { if (e.key === 'Escape') close(); });

    $$('[data-lightbox]').forEach(el => {
      on(el, 'click', () => open(el.src || el.dataset.lightbox, el.alt || ''));
    });
  }

  function open(src, alt = '') {
    img.src = src;
    img.alt = alt;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  return { init, open, close };
})();

/* ——— NEWSLETTER FORM ——— */
const Newsletter = (() => {
  function init() {
    $$('.newsletter-form').forEach(form => {
      on(form, 'submit', e => {
        e.preventDefault();
        const input = $('input', form);
        if (!input?.value.trim()) return;
        Toast.show('Thank you for subscribing! (Front-end demonstration — no data is stored without a backend.)', 'success');
        input.value = '';
      });
    });
  }

  return { init };
})();

/* ——— STAT COUNTER ANIMATION ——— */
const StatCounter = (() => {
  function animateCount(el, target, suffix = '') {
    const duration = 1800;
    const steps    = 60;
    const inc      = target / steps;
    let   current  = 0;
    let   step     = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(inc * step), target);
      el.textContent = current.toLocaleString() + suffix;
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  }

  function init() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          if (!isNaN(target)) animateCount(el, target, suffix);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    $$('[data-count]').forEach(el => obs.observe(el));
  }

  return { init };
})();

/* ——— SMOOTH SCROLL FOR ANCHOR LINKS ——— */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    on(a, 'click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-h'), 10) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ——— INIT ALL ON DOM READY ——— */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Navbar.init();
  MobileNav.init();
  ScrollReveal.init();
  BackToTop.init();
  FAQ.init();
  FormValidation.init();
  FileUpload.init();
  PasswordToggle.init();
  AuthPage.init();
  ContactSwitch.init();
  Lightbox.init();
  Newsletter.init();
  StatCounter.init();
  initSmoothScroll();

  // Wire up global toggles
  $$('[data-theme-toggle]').forEach(btn => on(btn, 'click', () => Theme.toggleTheme()));
  $$('[data-dir-toggle]').forEach(btn => on(btn, 'click', () => Theme.toggleDir()));
});
