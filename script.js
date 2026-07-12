(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     NAV: scrolled state + scroll progress bar
     ============================================================ */
  const nav = document.getElementById('nav');
  const progressBar = document.getElementById('scrollProgress');

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    nav.classList.toggle('is-scrolled', scrollY > 12);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progressBar.style.width = pct.toFixed(2) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     SMOOTH ANCHOR SCROLL (in case scroll-behavior unsupported)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ============================================================
     CURSOR GLOW (desktop / hover-capable only)
     ============================================================ */
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    let raf = null;
    window.addEventListener('mousemove', (e) => {
      glow.classList.add('is-active');
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      });
    }, { passive: true });
    document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
  }

  /* ============================================================
     MAGNETIC BUTTONS
     ============================================================ */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = 0.25;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ============================================================
     SCROLL REVEALS (words / lines / fades)
     ============================================================ */
  const revealTargets = document.querySelectorAll('.reveal-words, .reveal-line, .reveal-fade');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(t => io.observe(t));
  } else {
    revealTargets.forEach(t => t.classList.add('is-in'));
  }

  /* stagger word reveal delays */
  document.querySelectorAll('.reveal-words').forEach(group => {
    const words = group.querySelectorAll('.word');
    words.forEach((w, i) => {
      w.style.transitionDelay = `${i * 45}ms`;
    });
  });

  /* ============================================================
     BROWSER ASSEMBLY ANIMATION (opening signature moment)
     ============================================================ */
  const browserSection = document.getElementById('opening');
  const browserViewport = document.getElementById('browserViewport');
  const browserCaption = document.getElementById('browserCaption');
  const captionSteps = ['Grid —', 'Navbar —', 'Hero —', 'CTA —', 'Services —', 'Portfolio —', 'Published ✓'];
  let assemblyPlayed = false;

  function playAssembly() {
    if (assemblyPlayed || !browserViewport) return;
    assemblyPlayed = true;
    const layers = browserViewport.querySelectorAll('.b-layer');
    const stepDelay = reduceMotion ? 0 : 420;

    layers.forEach((layer, i) => {
      setTimeout(() => {
        layer.classList.add('is-shown');
        if (browserCaption && captionSteps[i]) {
          browserCaption.textContent = captionSteps[i];
        }
      }, reduceMotion ? 0 : i * stepDelay + 200);
    });
  }

  if ('IntersectionObserver' in window) {
    const assemblyIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playAssembly();
          assemblyIO.disconnect();
        }
      });
    }, { threshold: 0.4 });
    if (browserSection) assemblyIO.observe(browserSection);
  } else {
    playAssembly();
  }

  /* ============================================================
     PROCESS STAGE INDICATOR (corner badge)
     ============================================================ */
  const stageIndicator = document.getElementById('stageIndicator');
  const stageNum = document.getElementById('stageNum');
  const stageLabel = document.getElementById('stageLabel');
  const processSteps = document.querySelectorAll('.process__step');

  if ('IntersectionObserver' in window && processSteps.length) {
    const stageIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const num = entry.target.getAttribute('data-stage');
          const label = entry.target.getAttribute('data-label');
          stageNum.textContent = num;
          stageLabel.textContent = label;
          stageIndicator.classList.add('is-visible');
        }
      });
    }, { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' });
    processSteps.forEach(step => stageIO.observe(step));

    /* hide indicator once user leaves the process section entirely */
    const processSection = document.getElementById('process');
    const visibilityIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) stageIndicator.classList.remove('is-visible');
      });
    }, { threshold: 0 });
    if (processSection) visibilityIO.observe(processSection);
  }

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */
  document.querySelectorAll('.faq__item').forEach(item => {
    const btn = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq__item.is-open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
          openItem.querySelector('.faq__answer').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ============================================================
     PROJECT BRIEF FORM — validation, sanitization, submission
     ============================================================ */
  const form = document.getElementById('briefForm');
  const submitBtn = document.getElementById('briefSubmit');
  const statusEl = document.getElementById('briefStatus');

  const fields = {
    name: document.getElementById('fName'),
    email: document.getElementById('fEmail'),
    phone: document.getElementById('fPhone'),
    service: document.getElementById('fService'),
    budget: document.getElementById('fBudget'),
    details: document.getElementById('fDetails'),
  };

  const errorEls = {
    name: document.getElementById('err-fName'),
    email: document.getElementById('err-fEmail'),
    phone: document.getElementById('err-fPhone'),
    service: document.getElementById('err-fService'),
    budget: document.getElementById('err-fBudget'),
    details: document.getElementById('err-fDetails'),
  };

  const EMAIL_RE = /^[^\s@<>"'`]+@[^\s@<>"'`]+\.[^\s@<>"'`]{2,}$/;
  const PHONE_RE = /^[0-9+\-()\s.]{7,20}$/;

  /* Strip anything that could be used for markup/script injection.
     We never render user input as HTML — only as text — but we still
     scrub angle brackets and control characters at the source so the
     data is clean wherever it travels (clipboard, mailto, memory). */
  function sanitize(value) {
    return String(value)
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .trim();
  }

  function validators() {
    return {
      name: (v) => v.length >= 2 && v.length <= 100,
      email: (v) => EMAIL_RE.test(v) && v.length <= 150,
      phone: (v) => PHONE_RE.test(v),
      service: (v) => v.length > 0,
      budget: (v) => v.length > 0,
      details: (v) => v.length >= 10 && v.length <= 1000,
    };
  }

  const messages = {
    name: 'Enter your full name (2–100 characters).',
    email: 'Enter a valid business email address.',
    phone: 'Enter a valid phone number.',
    service: 'Select a service.',
    budget: 'Select a budget range.',
    details: 'Tell us a bit more — at least 10 characters.',
  };

  function getValues() {
    return {
      name: sanitize(fields.name.value),
      email: sanitize(fields.email.value),
      phone: sanitize(fields.phone.value),
      service: sanitize(fields.service.value),
      budget: sanitize(fields.budget.value),
      details: sanitize(fields.details.value),
    };
  }

  function validateField(key, showError) {
    const value = sanitize(fields[key].value);
    const valid = validators()[key](value);
    const wrapper = fields[key].closest('.field');

    if (!valid && showError) {
      wrapper.classList.add('is-invalid');
      errorEls[key].textContent = messages[key];
    } else {
      wrapper.classList.remove('is-invalid');
      errorEls[key].textContent = '';
    }
    return valid;
  }

  function validateAll(showErrors) {
    let allValid = true;
    Object.keys(fields).forEach(key => {
      const valid = validateField(key, showErrors);
      if (!valid) allValid = false;
    });
    submitBtn.disabled = !allValid;
    return allValid;
  }

  Object.keys(fields).forEach(key => {
    const el = fields[key];
    el.addEventListener('input', () => validateAll(false));
    el.addEventListener('blur', () => validateField(key, true));
    el.addEventListener('change', () => validateAll(false));
  });

  validateAll(false);

  function buildMessage(values) {
    return [
      'New project brief — TheDraft.io',
      '',
      `Name: ${values.name}`,
      `Business email: ${values.email}`,
      `Phone: ${values.phone}`,
      `Service: ${values.service}`,
      `Budget: ${values.budget}`,
      '',
      'Project details:',
      values.details,
    ].join('\n');
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      /* fall through to legacy method */
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      return false;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const showErrors = true;
    if (!validateAll(showErrors)) {
      statusEl.textContent = 'Please fix the highlighted fields.';
      statusEl.classList.remove('is-success');
      return;
    }

    submitBtn.disabled = true;
    statusEl.classList.remove('is-success');
    statusEl.textContent = 'Preparing your brief…';

    const values = getValues();
    const message = buildMessage(values);

    const copied = await copyToClipboard(message);

    const subject = encodeURIComponent(`Project brief — ${values.name} (${values.service})`);
    const body = encodeURIComponent(message);
    const mailtoUrl = `mailto:thedarft.io@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;

    setTimeout(() => {
      window.open('https://www.instagram.com/the_draft.io', '_blank', 'noopener,noreferrer');
    }, 600);

    statusEl.textContent = copied
      ? 'Copied to clipboard — opening your email and Instagram…'
      : 'Opening your email and Instagram…';
    statusEl.classList.add('is-success');

    form.reset();
    setTimeout(() => validateAll(false), 50);
  });

})();
