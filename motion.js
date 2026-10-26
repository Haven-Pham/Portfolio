/**
 * MOTION SYSTEM - Pham Hong Hieu Portfolio
 * Phase 7: Motion & Dynamic Storytelling
 * Design principle: OPERATIONS => DATA => ANALYSIS => INSIGHT => DECISION
 * Motion character: professional, technical, restrained, premium, smooth
 */
(() => {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  /* =========================================================================
     1. HERO ENTRANCE SEQUENCE
     Staggered opacity + translateY following the storytelling order:
     availability > eyebrow > name > positioning > lead > pills > buttons
     > socials > location | profile card > floating cards
     ========================================================================= */
  function runHeroEntrance() {
    const heroText   = $('.hero-text');
    const heroVisual = $('.hero-visual');
    if (!heroText || !heroVisual) return;

    [heroText, heroVisual].forEach(el => {
      el.classList.remove('reveal', 'is-visible');
      el.style.opacity = '';
      el.style.transform = '';
    });

    if (prefersReducedMotion()) {
      [heroText, heroVisual].forEach(el => { el.style.opacity = '1'; });
      heroText.querySelectorAll(
        '.availability,.eyebrow,.hero-greeting,.gradient-text,.hero-positioning,.hero-lead,.hero-pills span,.hero-buttons,.hero-socials,.hero-location'
      ).forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      heroVisual.querySelectorAll(
        '.visual-halo,.profile-illustration,.floating-one,.floating-two'
      ).forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const availability = heroText.querySelector('.availability');
    const eyebrow      = heroText.querySelector('.eyebrow');
    const greeting     = heroText.querySelector('.hero-greeting');
    const heroName     = heroText.querySelector('.gradient-text');
    const positioning  = heroText.querySelector('.hero-positioning');
    const heroLead     = heroText.querySelector('.hero-lead');
    const pills        = [...heroText.querySelectorAll('.hero-pills span')];
    const buttons      = heroText.querySelector('.hero-buttons');
    const socials      = heroText.querySelector('.hero-socials');
    const location     = heroText.querySelector('.hero-location');
    const floatOne     = heroVisual.querySelector('.floating-one');
    const floatTwo     = heroVisual.querySelector('.floating-two');
    const profileIllus = heroVisual.querySelector('.profile-illustration');
    const halos        = [...heroVisual.querySelectorAll('.visual-halo')];

    const BASE    = 120;
    const STAGGER = 90;
    const T       = 'opacity 0.55s cubic-bezier(0.16,1,0.3,1),transform 0.55s cubic-bezier(0.16,1,0.3,1)';

    const sequence = [
      { el: availability, delay: BASE },
      { el: eyebrow,      delay: BASE + STAGGER },
      { el: greeting,     delay: BASE + STAGGER * 2 },
      { el: heroName,     delay: BASE + STAGGER * 3 },
      { el: positioning,  delay: BASE + STAGGER * 4 },
      { el: heroLead,     delay: BASE + STAGGER * 5 },
      ...pills.map((p, i) => ({ el: p, delay: BASE + STAGGER * 6 + i * 55 })),
      { el: buttons,      delay: BASE + STAGGER * 7 + pills.length * 55 },
      { el: socials,      delay: BASE + STAGGER * 8 + pills.length * 55 },
      { el: location,     delay: BASE + STAGGER * 9 + pills.length * 55 },
    ];

    const visualDelay   = BASE + STAGGER * 5;
    const floatOneDelay = visualDelay + 340;
    const floatTwoDelay = visualDelay + 500;

    sequence.forEach(({ el }) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = T;
    });

    if (profileIllus) {
      profileIllus.style.opacity = '0';
      profileIllus.style.transform = 'translateY(20px) scale(0.97)';
      profileIllus.style.transition = 'opacity 0.65s cubic-bezier(0.16,1,0.3,1),transform 0.65s cubic-bezier(0.16,1,0.3,1)';
    }
    halos.forEach(el => { el.style.opacity = '0'; el.style.transition = 'opacity 0.9s ease'; });
    [floatOne, floatTwo].forEach((el, idx) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = idx === 0 ? 'translateY(10px) scale(0.96)' : 'translateY(-8px) scale(0.96)';
      el.style.transition = T;
    });

    sequence.forEach(({ el, delay }) => {
      if (!el) return;
      setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, delay);
    });

    setTimeout(() => {
      halos.forEach(el => { el.style.opacity = '1'; });
      if (profileIllus) {
        profileIllus.style.opacity = '1';
        profileIllus.style.transform = 'translateY(0) scale(1)';
      }
    }, visualDelay);

    setTimeout(() => {
      if (floatOne) { floatOne.style.opacity = '1'; floatOne.style.transform = 'translateY(0) scale(1)'; }
    }, floatOneDelay);

    setTimeout(() => {
      if (floatTwo) { floatTwo.style.opacity = '1'; floatTwo.style.transform = 'translateY(0) scale(1)'; }
      startFloatingMicroMotion();
    }, floatTwoDelay + 400);
  }

  /* =========================================================================
     2. FLOATING CARD MICRO-MOTION
     ========================================================================= */
  function startFloatingMicroMotion() {
    if (prefersReducedMotion()) return;
    const f1 = $('.floating-one');
    const f2 = $('.floating-two');
    if (f1) f1.style.animation = 'motionFloat1 7s ease-in-out infinite';
    if (f2) f2.style.animation = 'motionFloat2 9s ease-in-out 1.4s infinite';
    const chipRight = $('.chip-right');
    if (chipRight) chipRight.style.animation = 'chipBreath 5s ease-in-out 2s infinite';
  }

  /* =========================================================================
     3. ROTATING EXPERTISE TEXT
     Smooth vertical ticker using keywords from existing portfolio data.
     Full i18n support. Falls back to static under prefers-reduced-motion.
     ========================================================================= */
  function initExpertiseRotator() {
    const posEl = $('.hero-positioning');
    if (!posEl) return;

    if (prefersReducedMotion()) {
      const lang = document.documentElement.lang || 'en';
      const dict = (window.PORTFOLIO_I18N && window.PORTFOLIO_I18N[lang]) || {};
      posEl.innerHTML = `<span data-i18n="heroPositioning">${dict.heroPositioning || 'Data Analytics | Supply Chain | SQL | ERP'}</span>`;
      posEl.style.overflow = '';
      posEl.style.minHeight = '';
      return;
    }

    const kw = {
      'en':      ['DATA ANALYTICS', 'SUPPLY CHAIN', 'SQL', 'POWER BI', 'ORACLE ERP', 'LOGISTICS'],
      'vi':      ['PHÂN TÍCH DỮ LIỆU', 'CHUỖI CUNG ỨNG', 'SQL', 'POWER BI', 'ORACLE ERP', 'LOGISTICS'],
      'zh-Hant': ['數據分析', '供應鏈', 'SQL', 'POWER BI', 'ORACLE ERP', '物流'],
      'zh-Hans': ['数据分析', '供应链', 'SQL', 'POWER BI', 'ORACLE ERP', '物流'],
    };

    const ticker = document.createElement('span');
    ticker.className = 'expertise-ticker';
    ticker.setAttribute('aria-live', 'polite');
    ticker.setAttribute('aria-atomic', 'true');
    const slot = document.createElement('span');
    slot.className = 'expertise-slot';
    ticker.appendChild(slot);
    posEl.innerHTML = '';
    posEl.style.overflow = 'hidden';
    posEl.style.minHeight = '2em';
    posEl.appendChild(ticker);

    let idx = 0;
    const next = () => {
      const lang = document.documentElement.lang || 'en';
      const words = kw[lang] || kw['en'];
      slot.style.animation = 'none';
      void slot.offsetHeight;
      slot.textContent = words[idx % words.length];
      slot.style.animation = 'expertiseSlide 0.45s cubic-bezier(0.16,1,0.3,1) both';
      idx++;
    };
    next();
    const iv = setInterval(next, 2800);
    window.__motionExpertiseCleanup = () => clearInterval(iv);
  }

  /* =========================================================================
     4. SCROLL REVEAL + STAGGER SYSTEM
     ========================================================================= */
  let _cardObserver = null;

  function scrollRevealCard(el, fastMode) {
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      el.style.opacity = '1'; el.style.transform = 'none';
      el.classList.add('is-visible'); return;
    }
    if (!_cardObserver) {
      _cardObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const base = e.target.dataset.fastMode === 'true' ? 40 : 75;
            const d = e.target.dataset.cardIndex
              ? parseInt(e.target.dataset.cardIndex, 10) * base : 0;
            setTimeout(() => e.target.classList.add('is-visible'), d);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' });
    }
    if (fastMode) el.dataset.fastMode = 'true';
    _cardObserver.observe(el);
  }

  function initScrollReveals() {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      $$('.reveal').forEach(el => {
        el.style.opacity = '1'; el.style.transform = 'none';
        el.classList.add('is-visible');
      });
      return;
    }

    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); o.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    $$('.reveal').forEach(el => {
      if (el.closest('#hero') || el.classList.contains('is-visible')) return;
      obs.observe(el);
    });
  }

  function applyCardStagger(container, step = 80) {
    if (!container) return;
    $$('.reveal:not(.is-visible), .contact-card:not(.is-visible)', container).forEach((c, i) => {
      c.dataset.cardIndex = String(i);
      c.style.setProperty('--entry-delay', `${i * step}ms`);
    });
  }

  function watchDynamicContainers() {
    const containers = ['#experience-list','#project-grid','#cert-grid','#community-grid','#contact-grid']
      .map(s => $(s)).filter(Boolean);
    if (!containers.length) return;
    const mo = new MutationObserver(muts => {
      muts.forEach(m => {
        if (m.addedNodes.length) {
          applyCardStagger(m.target, 40);
          $$('.reveal:not(.is-visible)', m.target).forEach(c => scrollRevealCard(c, true));
        }
      });
    });
    containers.forEach(c => mo.observe(c, { childList: true }));
  }

  /* =========================================================================
     5. EXPERIENCE TIMELINE RAIL
     ========================================================================= */
  function initTimelineRail() {
    const list = $('#experience-list');
    if (!list || prefersReducedMotion()) return;
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          list.classList.add('rail-animated');
          obs.disconnect();
        }
      });
    }, { threshold: 0.1 }).observe(list);
  }

  /* =========================================================================
     6. WORKFLOW CONNECTOR LINE + STAGE REVEAL
     ========================================================================= */
  function initWorkflowAnimation() {
    const grid = $('#stage-grid');
    if (!grid || prefersReducedMotion()) return;
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          grid.classList.add('line-animated');
          obs.disconnect();
        }
      });
    }, { threshold: 0.12 }).observe(grid);
  }

  function initWorkflowStageTransition() {
    if (prefersReducedMotion()) return;
    const grid = $('#stage-grid');
    if (!grid) return;
    grid.addEventListener('click', e => {
      const btn = e.target.closest('[data-stage]');
      if (!btn) return;
      const desc = $('#stage-description');
      if (!desc) return;
      desc.style.opacity = '0'; desc.style.transform = 'translateY(10px)';
      desc.style.transition = 'opacity 0.35s cubic-bezier(0.16,1,0.3,1),transform 0.35s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => { desc.style.opacity = '1'; desc.style.transform = 'translateY(0)'; }, 40);
    });
  }

  /* =========================================================================
     7. CONTACT REVEAL
     ========================================================================= */
  function initContactReveal() {
    const sec = $('#contact');
    if (!sec) return;
    if (prefersReducedMotion()) {
      sec.querySelectorAll('.contact-card, .contact-email').forEach(el => el.classList.add('is-visible'));
      return;
    }
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const grid = sec.querySelector('#contact-grid');
          const email = sec.querySelector('.contact-email');
          if (grid) {
            $$('.contact-card', grid).forEach((c, i) => {
              setTimeout(() => c.classList.add('is-visible'), i * 80);
            });
          }
          if (email) setTimeout(() => email.classList.add('is-visible'), 360);
          obs.disconnect();
        }
      });
    }, { threshold: 0.08 }).observe(sec);
  }

  /* =========================================================================
     8. CERT COUNTER ANIMATION
     ========================================================================= */
  function initCertCounter() {
    const badge = $('.counter-badge');
    if (!badge || prefersReducedMotion()) return;
    const text = badge.textContent.trim();
    const match = text.match(/^(\d+)/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = text.slice(match[0].length);
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const t0 = performance.now();
          const step = now => {
            const p = Math.min((now - t0) / 900, 1);
            badge.textContent = Math.round((1 - Math.pow(1-p, 3)) * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 }).observe(badge);
  }

  /* =========================================================================
     9. SCHEMATIC LINE DRAW
     ========================================================================= */
  function initSchematicAnimation() {
    if (prefersReducedMotion()) return;
    $$('.connector-line').forEach(l => l.classList.add('line-draw'));
  }

  /* =========================================================================
     10. AMBIENT BACKGROUND
     ========================================================================= */
  function initAmbientBackground() {
    if (prefersReducedMotion()) return;
    const dg = $('.dot-grid');
    if (dg) dg.style.animation = 'ambientDotDrift 28s ease-in-out infinite alternate';
    setTimeout(() => {
      const h1 = $('.halo-1'); const h2 = $('.halo-2');
      if (h1) h1.style.animation = 'halo1Drift 18s ease-in-out infinite alternate';
      if (h2) h2.style.animation = 'halo2Drift 22s ease-in-out 3s infinite alternate';
    }, 2400);
  }

  /* =========================================================================
     11. LANGUAGE CHANGE HOOK
     ========================================================================= */
  function hookLanguageChange() {
    const sw = $('#language-switcher');
    if (!sw) return;
    sw.addEventListener('change', () => {
      if (typeof window.__motionExpertiseCleanup === 'function') {
        window.__motionExpertiseCleanup(); window.__motionExpertiseCleanup = null;
      }
      setTimeout(initExpertiseRotator, 80);
      setTimeout(() => {
        ['#experience-list','#project-grid','#cert-grid','#community-grid','#contact-grid']
          .forEach(s => { const c = $(s); if (c) applyCardStagger(c); });
        initCertCounter();
      }, 120);
    });
  }

  /* =========================================================================
     INIT
     ========================================================================= */
  function init() {
    runHeroEntrance();
    setTimeout(initExpertiseRotator, 900);
    ['#experience-list','#project-grid','#cert-grid','#community-grid','#contact-grid']
      .forEach(s => { const c = $(s); if (c) applyCardStagger(c, 80); });
    initScrollReveals();
    watchDynamicContainers();
    initTimelineRail();
    initContactReveal();
    initCertCounter();
    initSchematicAnimation();
    initAmbientBackground();
    setTimeout(() => { initWorkflowAnimation(); initWorkflowStageTransition(); }, 250);
    hookLanguageChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
