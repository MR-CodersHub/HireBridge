/* ============================================================
   HIREBRIDGE – MASTER INTERACTIONS (Vanilla ES6)
   Pure ES6 · Zero Dependencies · Accessible
   ============================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

/* ——— THEME & RTL DIRECTION PERSISTENCE ——— */
const Theme = (() => {
  const KEY_THEME = 'hb_theme';
  const KEY_DIR = 'hb_dir';

  function apply(theme, dir) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', dir);
    $$('[data-theme-toggle]').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
    });
    $$('[data-dir-toggle]').forEach(btn => {
      btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      btn.setAttribute('aria-pressed', String(dir === 'rtl'));
    });
  }

  function init() {
    const savedTheme = localStorage.getItem(KEY_THEME) || 'light';
    const savedDir = localStorage.getItem(KEY_DIR) || 'ltr';
    apply(savedTheme, savedDir);
  }

  function toggleTheme() {
    const next = (document.documentElement.getAttribute('data-theme') || 'light') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY_THEME, next);
    apply(next, document.documentElement.getAttribute('dir') || 'ltr');
  }

  function toggleDir() {
    const next = (document.documentElement.getAttribute('dir') || 'ltr') === 'rtl' ? 'ltr' : 'rtl';
    localStorage.setItem(KEY_DIR, next);
    apply(document.documentElement.getAttribute('data-theme') || 'light', next);
  }

  return { init, toggleTheme, toggleDir };
})();

/* ——— STICKY NAVBAR & ACTIVE LINK ——— */
const Navbar = (() => {
  function init() {
    const navbar = $('#navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 36);
    };
    on(window, 'scroll', onScroll, { passive: true });
    onScroll();

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link', navbar).forEach(link => {
      const href = link.getAttribute('href') || '';
      const baseHref = href.split('#')[0];
      const baseFile = baseHref.split('/').pop() || 'index.html';
      if (!href.includes('#') && baseFile === currentFile) {
        link.classList.add('active');
      } else if (currentFile === 'home2.html' && baseFile === 'index.html') {
        link.classList.add('active');
      } else if (currentFile === 'service-details.html' && baseFile === 'services.html') {
        link.classList.add('active');
      } else if (currentFile === 'blog-details.html' && baseFile === 'blog.html') {
        link.classList.add('active');
      }
    });
  }

  return { init };
})();

/* ——— MOBILE NAVIGATION DRAWER ——— */
const MobileNav = (() => {
  function init() {
    const hamburger = $('#hamburger');
    const mobileNav = $('#mobileNav');
    const closeBtn = $('#mobileNavClose');
    if (!hamburger || !mobileNav) return;

    function open() {
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('open');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    on(hamburger, 'click', () => (mobileNav.classList.contains('open') ? close() : open()));
    on(closeBtn, 'click', close);
    on(mobileNav, 'click', e => { if (e.target === mobileNav) close(); });
    $$('.mobile-nav-link, .mobile-nav-sub a, .mobile-nav-actions a', mobileNav).forEach(link => on(link, 'click', close));
    on(document, 'keydown', e => { if (e.key === 'Escape') close(); });
  }

  return { init };
})();

/* ——— SCROLL REVEAL ——— */
const ScrollReveal = (() => {
  function init() {
    const els = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ——— BACK TO TOP ——— */
const BackToTop = (() => {
  function init() {
    const btn = $('#backToTop');
    if (!btn) return;
    on(window, 'scroll', () => btn.classList.toggle('visible', window.scrollY > 460), { passive: true });
    on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  return { init };
})();

/* ——— TOAST NOTIFICATIONS ——— */
const Toast = (() => {
  let container;

  function getContainer() {
    if (!container) {
      container = $('#toastContainer') || document.createElement('div');
      container.className = 'toast-container';
      if (!container.parentNode) document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 5000) {
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <span>${message}</span>
      <button class="toast-close" type="button" aria-label="Dismiss notification">×</button>
    `;
    getContainer().appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

    function dismiss() {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
    on($('.toast-close', toast), 'click', dismiss);
    if (duration > 0) setTimeout(dismiss, duration);
    return { dismiss };
  }

  return { show };
})();

window.Toast = Toast;

/* ——— FAQ ACCORDIONS ——— */
const FAQ = (() => {
  function init() {
    $$('.faq-question').forEach(q => {
      on(q, 'click', () => {
        const item = q.closest('.faq-item');
        const answer = $('.faq-answer', item);
        const isOpen = item.classList.contains('open');

        $$('.faq-item.open').forEach(openItem => {
          openItem.classList.remove('open');
          const openBtn = $('.faq-question', openItem);
          if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
          const openAns = $('.faq-answer', openItem);
          if (openAns) openAns.style.maxHeight = '0px';
        });

        if (!isOpen && answer) {
          item.classList.add('open');
          q.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      });
    });
  }
  return { init };
})();

/* ——— FORM VALIDATION ——— */
const FormValidation = (() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[\d\s\-().]{7,}$/;

  function validateField(field) {
    const val = field.value.trim();
    const type = field.type;
    let error = '';

    if (type === 'checkbox') {
      if (field.required && !field.checked) error = 'Please acknowledge this confirmation.';
    } else if (field.required && !val) {
      error = 'This field is required.';
    } else if (type === 'email' && val && !emailRegex.test(val)) {
      error = 'Please enter a valid email address.';
    } else if (type === 'tel' && val && !phoneRegex.test(val)) {
      error = 'Please enter a valid phone number.';
    } else if (type === 'url' && val && !/^https?:\/\/.+/i.test(val)) {
      error = 'Please enter a valid URL starting with http:// or https://';
    } else if (field.name === 'confirm_password') {
      const form = field.closest('form');
      const pwd = form?.querySelector('input[name="password"]');
      if (pwd && field.value !== pwd.value) error = 'Passwords do not match.';
    }

    const group = field.closest('.form-group, .auth-form-group, .auth-checkbox-group');
    const errEl = group?.querySelector('.form-error, .input-error-msg');
    if (errEl) {
      errEl.textContent = error || errEl.dataset.defaultMsg || errEl.textContent;
      errEl.classList.toggle('visible', Boolean(error));
    }
    if (type !== 'checkbox') {
      field.classList.toggle('error', Boolean(error));
      field.classList.toggle('success', !error && Boolean(val));
    }
    return !error;
  }

  function init() {
    $$('form[data-validate]').forEach(form => {
      $$('.form-error, .input-error-msg', form).forEach(el => {
        el.dataset.defaultMsg = el.textContent;
      });
      const fields = $$('input:not([type="file"]), textarea, select', form);
      fields.forEach(field => {
        on(field, 'blur', () => validateField(field));
        on(field, 'input', () => {
          if (field.classList.contains('error')) validateField(field);
        });
      });

      on(form, 'submit', e => {
        e.preventDefault();
        let allValid = true;
        fields.forEach(field => {
          if (!validateField(field)) allValid = false;
        });

        const statusBox = form.querySelector('[data-form-status]');
        if (allValid) {
          const demoMsg = form.dataset.successMsg ||
            'Form validated (front-end demonstration only). No data is transmitted or stored without backend integration.';
          Toast.show(demoMsg, 'success', 7000);
          if (statusBox) {
            statusBox.className = 'form-status-banner form-status-banner--success';
            statusBox.textContent = demoMsg;
          }
          form.reset();
          fields.forEach(f => f.classList.remove('success', 'error'));
          const uploadStatus = form.querySelector('.upload-status');
          if (uploadStatus) uploadStatus.classList.remove('visible');
        } else {
          const errMsg = 'Please review and complete the highlighted required fields.';
          Toast.show(errMsg, 'error', 4500);
          if (statusBox) {
            statusBox.className = 'form-status-banner form-status-banner--error';
            statusBox.textContent = errMsg;
          }
        }
      });
    });
  }

  return { init };
})();

/* ——— FILE UPLOAD VALIDATION ——— */
const FileUpload = (() => {
  const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;
  const MAX_BYTES = 5 * 1024 * 1024;

  function init() {
    $$('.upload-zone').forEach(zone => {
      const input = $('input[type="file"]', zone);
      const group = zone.closest('.form-group');
      const status = group?.querySelector('.upload-status');
      const errorEl = group?.querySelector('.form-error');
      if (!input) return;

      function handleFile(file) {
        if (!file) return;
        if (!ALLOWED_EXT.test(file.name)) {
          if (status) status.classList.remove('visible');
          if (errorEl) {
            errorEl.textContent = 'Unsupported file type. Please select a PDF, DOC, or DOCX file.';
            errorEl.classList.add('visible');
          }
          Toast.show('Please upload a PDF, DOC, or DOCX file.', 'error');
          input.value = '';
          return;
        }
        if (file.size > MAX_BYTES) {
          if (status) status.classList.remove('visible');
          if (errorEl) {
            errorEl.textContent = 'File exceeds the 5 MB maximum limit.';
            errorEl.classList.add('visible');
          }
          Toast.show('File size must not exceed 5 MB.', 'error');
          input.value = '';
          return;
        }

        if (errorEl) errorEl.classList.remove('visible');
        const kb = Math.max(1, Math.round(file.size / 1024));
        if (status) {
          status.classList.add('visible');
          status.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>${file.name}</strong> (${kb} KB) — ready in browser preview (not uploaded without backend).</span>
          `;
        }
        Toast.show(`Selected ${file.name} (${kb} KB). Front-end preview only.`, 'info');
      }

      on(input, 'change', e => handleFile(e.target.files[0]));
      on(zone, 'dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
      on(zone, 'dragleave', () => zone.classList.remove('drag-over'));
      on(zone, 'drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      });
    });
  }

  return { init };
})();

/* ——— PASSWORD VISIBILITY TOGGLE ——— */
const PasswordToggle = (() => {
  function init() {
    $$('.password-toggle').forEach(btn => {
      const wrapper = btn.closest('.password-wrapper');
      const input = wrapper?.querySelector('input');
      if (!input) return;

      const eyeOpen = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      const eyeClosed = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      btn.innerHTML = eyeOpen;

      on(btn, 'click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? eyeClosed : eyeOpen;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    });
  }
  return { init };
})();

/* ——— AUTH PAGE SWITCHING (Login/Register + Candidate/Employer) ——— */
const AuthPage = (() => {
  function init() {
    const authRoot = $('[data-auth-root]');
    if (!authRoot) return;

    let activeType = 'candidate';
    let activeTab = 'login';

    function render() {
      $$('[data-user-type]', authRoot).forEach(b => {
        b.classList.toggle('active', b.dataset.userType === activeType);
      });
      $$('[data-auth-tab]', authRoot).forEach(t => {
        t.classList.toggle('active', t.dataset.authTab === activeTab);
      });
      $$('[data-auth-panel]', authRoot).forEach(panel => {
        const match = panel.dataset.authPanel === activeTab && panel.dataset.userContext === activeType;
        panel.classList.toggle('d-none', !match);
      });
    }

    $$('[data-user-type]', authRoot).forEach(btn => {
      on(btn, 'click', () => {
        activeType = btn.dataset.userType;
        render();
      });
    });

    $$('[data-auth-tab]', authRoot).forEach(tab => {
      on(tab, 'click', () => {
        activeTab = tab.dataset.authTab;
        render();
      });
    });

    $$('[data-action="forgot-password"]', authRoot).forEach(link => {
      on(link, 'click', e => {
        e.preventDefault();
        Toast.show('Forgot Password is a front-end demonstration only. No email or reset link is sent without a backend.', 'info', 5500);
      });
    });

    render();
  }
  return { init };
})();

/* ——— CONTACT ENQUIRY SWITCHING (Candidate / Employer + Hash Support) ——— */
const ContactSwitch = (() => {
  function init() {
    const btns = $$('[data-contact-type]');
    const forms = $$('[data-contact-form]');
    if (!btns.length || !forms.length) return;

    function activate(type, shouldScroll = false) {
      btns.forEach(b => {
        const active = b.dataset.contactType === type;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      forms.forEach(f => {
        f.classList.toggle('d-none', f.dataset.contactForm !== type);
      });
      if (shouldScroll) {
        const target = document.getElementById(type === 'employer' ? 'employers' : 'candidates');
        if (target) {
          const offset = 90;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }

    btns.forEach(btn => on(btn, 'click', () => activate(btn.dataset.contactType, false)));

    const syncFromHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#employers') activate('employer', true);
      else if (h === '#candidates') activate('candidate', true);
    };

    syncFromHash();
    on(window, 'hashchange', syncFromHash);
  }
  return { init };
})();

/* ——— BLOG CATEGORY FILTERING ——— */
const BlogFilter = (() => {
  function init() {
    const pills = $$('[data-blog-filter]');
    const cards = $$('[data-blog-category]');
    if (!pills.length || !cards.length) return;

    pills.forEach(pill => {
      on(pill, 'click', () => {
        const cat = pill.dataset.blogFilter;
        pills.forEach(p => p.classList.toggle('active', p === pill));
        cards.forEach(card => {
          const show = cat === 'all' || card.dataset.blogCategory === cat;
          card.classList.toggle('d-none', !show);
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
    const triggers = $$('[data-lightbox]');
    if (!triggers.length) return;

    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" type="button" aria-label="Close image preview">×</button>
        <img src="" alt="" />
      </div>`;
    document.body.appendChild(overlay);
    img = $('img', overlay);

    const close = () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    on($('.lightbox-close', overlay), 'click', close);
    on(overlay, 'click', e => { if (e.target === overlay) close(); });
    on(document, 'keydown', e => { if (e.key === 'Escape') close(); });

    triggers.forEach(el => {
      el.style.cursor = 'zoom-in';
      on(el, 'click', () => {
        img.src = el.getAttribute('src') || el.dataset.lightbox;
        img.alt = el.getAttribute('alt') || '';
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  return { init };
})();

/* ——— DEMO LINKS & NEWSLETTER HANDLERS ——— */
const DemoFeedback = (() => {
  function init() {
    $$('.newsletter-form').forEach(form => {
      on(form, 'submit', e => {
        e.preventDefault();
        const input = $('input[type="email"]', form);
        if (!input || !input.value.trim()) return;
        Toast.show('Newsletter sign-up noted (front-end demonstration — no email is stored without a backend).', 'success', 5500);
        input.value = '';
      });
    });

    $$('[data-demo-notice]').forEach(el => {
      on(el, 'click', e => {
        e.preventDefault();
        Toast.show(el.dataset.demoNotice, 'info', 5000);
      });
    });
  }
  return { init };
})();

/* ——— SMOOTH SCROLL FOR SAME-PAGE ANCHORS ——— */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    on(a, 'click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.getElementById(href.slice(1));
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'), 10) || 78;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ——— BOOTSTRAP ——— */
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
  BlogFilter.init();
  Lightbox.init();
  DemoFeedback.init();
  initSmoothScroll();

  $$('[data-theme-toggle]').forEach(btn => on(btn, 'click', () => Theme.toggleTheme()));
  $$('[data-dir-toggle]').forEach(btn => on(btn, 'click', () => Theme.toggleDir()));
});
