(() => {
  'use strict';
  let PACKS = window.PORTFOLIO_I18N || {};
  let DATA = window.PORTFOLIO_RECORDS || { experience: [], projects: [], certificates: [] };
  let CONFIG = window.PORTFOLIO_CONFIG || {};
  let RESEARCH = DATA.research || [];
  let GITHUB_REPOS = null; // null = loading, [] = unavailable
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const getSaved = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const h = (s) => String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const urlTheme = new URLSearchParams(window.location.search).get('theme');
  const language = urlLang || getSaved('haven-language', 'en');
  const state = { lang: PACKS[language] ? language : 'en', theme: ['light','dark'].includes(urlTheme) ? urlTheme : getSaved('haven-theme','dark'), expFilter:'all', projectFilter:'all', certFilter:'all', projectPage:1, certPage:1, selectedStage:0, stackView:'workflow' };
  const PAGE_SIZE = { project: 4, cert: 6 };
  const pageSlice = (items, page, size) => items.slice((page - 1) * size, page * size);
  function pager(group, page, total, d) {
    if (total <= 1) return '';
    const dots = Array.from({ length: total }, (_, i) =>
      `<button type="button" class="pager-dot ${i + 1 === page ? 'active' : ''}" data-page-group="${group}" data-page="${i + 1}" aria-label="${h(d.pageLabel)} ${i + 1}" ${i + 1 === page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('');
    return `<nav class="pager" aria-label="${h(d.pageLabel)}">
      <button type="button" class="pager-arrow" data-page-group="${group}" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="${h(d.pagePrev)}">←</button>
      ${dots}
      <span class="pager-status">${page} / ${total}</span>
      <button type="button" class="pager-arrow" data-page-group="${group}" data-page="${page + 1}" ${page === total ? 'disabled' : ''} aria-label="${h(d.pageNext)}">→</button>
    </nav>`;
  }
  function bindPager(container, group, onChange) {
    $$(`[data-page-group="${group}"]`, container).forEach(btn => btn.addEventListener('click', () => {
      onChange(Number(btn.dataset.page));
      const grid = $(group === 'project' ? '#project-grid' : '#cert-grid');
      grid?.classList.remove('page-enter'); void grid?.offsetWidth; grid?.classList.add('page-enter');
      const top = container.closest('section')?.querySelector('.tabs');
      if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }
  const t = () => PACKS[state.lang] || PACKS.en || {};
  async function loadDataFromJSON() {
    try {
      const [profileRes, expRes, projRes, certRes, resRes, i18nRes] = await Promise.all([
        fetch('data/profile.json'),
        fetch('data/experience.json'),
        fetch('data/projects.json'),
        fetch('data/certifications.json'),
        fetch('data/research.json').catch(() => null),
        fetch('data/i18n.json')
      ]);
      if (profileRes.ok && expRes.ok && projRes.ok && certRes.ok && i18nRes.ok) {
        CONFIG = await profileRes.json();
        const experience = await expRes.json();
        const projects = await projRes.json();
        const certificates = await certRes.json();
        DATA = { experience, projects, certificates };
        if (resRes && resRes.ok) RESEARCH = await resRes.json();
        PACKS = await i18nRes.json();
        if (!PACKS[state.lang]) state.lang = 'en';
        applyTranslation();
      }
    } catch {
      // Graceful fallback: on file:/// protocol or network restrictions,
      // bundled window.PORTFOLIO_* data from content.js provides seamless offline execution.
    }
  }
  let toastTimer;
  function toast(message) { const box = $('#toast'); box.textContent = message; box.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => box.classList.remove('visible'), 2800); }
  function tab(label, group, value, current) { return `<button class="tab ${current === value ? 'active':''}" type="button" role="tab" aria-selected="${current === value}" data-${group}="${h(value)}">${h(label)}</button>`; }
  function applyTranslation() {
    const dict = t();
    document.documentElement.lang = state.lang === 'zh-Hant' ? 'zh-Hant' : state.lang === 'zh-Hans' ? 'zh-Hans' : state.lang;
    document.title = dict.pageTitle;
    $('meta[name="description"]').content = dict.heroSummary;
    $$('[data-i18n]').forEach(el => { const key = el.dataset.i18n; if (typeof dict[key] === 'string') el.textContent = dict[key]; });
    $('#language-switcher').value = state.lang;
    $('#theme-switcher span:last-child').textContent = state.theme === 'dark' ? dict.themeLight : dict.themeDark;
    $('#year').textContent = new Date().getFullYear();
    renderExperience();renderProjects();renderGithubFeed();renderResearch();renderStack();renderCommunity();renderCerts();renderContacts();
    if (typeof moveNavIndicator === 'function') requestAnimationFrame(moveNavIndicator);
    setupObservers();
  }
  function renderExperience() {
    const d = t();
    $('#experience-tabs').innerHTML = tab(d.tabAll,'exp','all',state.expFilter) + tab(d.tabPlanning,'exp','planning',state.expFilter) + tab(d.tabLogistics,'exp','logistics',state.expFilter);
    const found = DATA.experience.filter(item => state.expFilter === 'all' || item.category === state.expFilter);
    $('#experience-list').innerHTML = found.map((item,index) => {
      const x = d.experienceData?.[item.id];
      if (!x) return '';
      const logoMarkup = item.logo ? `<img src="${h(item.logo)}" alt="${h(x.org)}" class="company-logo-img" width="58" height="58" loading="lazy" decoding="async">` : h(item.initials);
      const periodText = experiencePeriods[state.lang]?.[item.id] || item.period;
      return `<article class="experience-card reveal" style="--entry-delay:${index * 55}ms" data-exp-id="${h(item.id)}">
        <div class="exp-card-header">
          <div class="company-icon ${item.className}">${logoMarkup}</div>
          <div class="exp-header-info">
            <div class="exp-company-row">
              <span class="company-name">${h(x.org)}</span>
              <span class="exp-seq-pill" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>
            </div>
            <h3 class="exp-role-title">${h(x.role)}</h3>
            <div class="exp-date-row">
              <span class="exp-date-badge">
                <svg class="exp-calendar-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>${h(periodText)}</span>
              </span>
            </div>
          </div>
        </div>
        <div class="exp-layout">
          <div class="exp-card-body">
            <p class="exp-summary">${h(x.summary)}</p>
            <ul class="exp-bullets">
              ${x.bullets.map(line => `<li>${h(line)}</li>`).join('')}
            </ul>
          </div>
          ${x.facts ? `<aside class="exp-side">
            <p class="exp-side-title">${h(d.expGlance)}</p>
            <dl class="exp-facts">${x.facts.map(f => `<div><dt>${h(f.label)}</dt><dd>${h(f.value)}</dd></div>`).join('')}</dl>
            <p class="exp-side-title">${h(d.expTools)}</p>
            <div class="exp-tools">${(x.tools || []).map(tool => `<span>${h(tool)}</span>`).join('')}</div>
          </aside>` : ''}
        </div>
        <span class="card-index" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>
      </article>`;
    }).join('');
    $$('[data-exp]').forEach(btn => btn.addEventListener('click', () => { state.expFilter = btn.dataset.exp; renderExperience(); }));
  }
  const experiencePeriods = {
    vi:{'hoa-sen':'10/2024 – 04/2025','kodai':'07/2023 – 08/2024','vietlog':'01 – 07/2023'},
    'zh-Hant':{'hoa-sen':'2024/10 – 2025/04','kodai':'2023/07 – 2024/08','vietlog':'2023/01 – 2023/07'},
    'zh-Hans':{'hoa-sen':'2024/10 – 2025/04','kodai':'2023/07 – 2024/08','vietlog':'2023/01 – 2023/07'}
  };
  const formatCertDate = text => {
    const locale = state.lang === 'zh-Hant' ? 'zh-TW' : state.lang === 'zh-Hans' ? 'zh-CN' : state.lang;
    return new Intl.DateTimeFormat(locale, {year:'numeric', month:'short', day:'numeric'}).format(new Date(text));
  };
  const statusKey = {completed:'projCompleted',research:'projResearch',development:'projDevelopment',starter:'projStarter',concept:'projConcept',coursework:'projCoursework'};
  const projectCategoryKey = {supply:'projSupply',ai:'projAi',analytics:'projAnalytics',sql:'projSql'};
  function renderProjects() {
    const d = t();
    $('#project-tabs').innerHTML = tab(d.projAll,'project','all',state.projectFilter) + Object.entries(projectCategoryKey).map(([value,key]) => tab(d[key],'project',value,state.projectFilter)).join('');
    const projects = DATA.projects.filter(item => state.projectFilter === 'all' || state.projectFilter === item.category);
    const projectPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE.project));
    state.projectPage = Math.min(state.projectPage, projectPages);
    $('#project-grid').innerHTML = pageSlice(projects, state.projectPage, PAGE_SIZE.project).map(item => {
      const p = d.projectData?.[item.id];
      if (!p) return '';
      const catLabel = d[projectCategoryKey[item.category]] || item.category;
      const statusLabel = d[statusKey[item.status]] || item.status;
      const githubMarkup = item.githubUrl ? `<a class="project-github-btn" href="${h(item.githubUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${h(p.title)} on GitHub"><svg class="project-btn-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#icon-github"></use></svg><span>GitHub</span><span class="action-icon" aria-hidden="true">↗</span></a>` : '';
      return `<article class="project-card reveal" aria-label="${h(p.title)}" data-category="${h(item.category)}">
        <div class="project-card-header">
          <div class="project-badge-group">
            <span class="project-category-badge">${h(catLabel)}</span>
            <span class="project-status-badge status-${item.status}"><span class="status-indicator"></span><span>${h(statusLabel)}</span></span>
          </div>
          <div class="project-card-meta">
            <span class="project-icon" aria-hidden="true">${h(item.icon)}</span>
            <span class="project-index">/ ${h(item.number)}</span>
          </div>
        </div>
        <div class="project-card-body">
          <h3 class="project-title">${h(p.title)}</h3>
          <p class="project-desc">${h(p.description)}</p>
          <div class="project-tech-stack" aria-label="Technologies">
            ${item.chips.map(tag => `<span class="tech-tag">${h(tag)}</span>`).join('')}
          </div>
        </div>
        <div class="project-card-footer">
          <div class="project-actions">
            <button class="project-open-btn" type="button" data-project-open="${item.id}">
              <span>${h(d.projectDetails)}</span>
              <span class="action-icon" aria-hidden="true">↗</span>
            </button>
            ${githubMarkup}
          </div>
        </div>
      </article>`;
    }).join('');
    $('#project-pager').innerHTML = pager('project', state.projectPage, projectPages, d);
    bindPager($('#project-pager'), 'project', page => { state.projectPage = page; renderProjects(); });
    $$('[data-project]').forEach(btn => btn.addEventListener('click', () => { state.projectFilter = btn.dataset.project; state.projectPage = 1; renderProjects(); }));
    $$('[data-project-open]').forEach(btn => btn.addEventListener('click', () => openProject(btn.dataset.projectOpen)));
  }
  function getAssetLabel(docPath, d) {
    if (!docPath) return '';
    const lower = docPath.toLowerCase();
    if (lower.endsWith('.pbix')) return d.dlPbix || 'DOWNLOAD POWER BI FILE';
    if (lower.endsWith('.xlsx')) return d.dlXlsx || 'DOWNLOAD EXCEL FILE';
    if (lower.endsWith('.ipynb')) return d.dlIpynb || 'DOWNLOAD NOTEBOOK';
    if (lower.endsWith('.zip')) return d.dlProject || 'DOWNLOAD PROJECT FILE';
    return d.dlProject || 'DOWNLOAD PROJECT FILE';
  }
  function openProject(id) {
    const item = DATA.projects.find(p => p.id === id);
    if (!item) return;
    const d = t(), p = d.projectData?.[id];
    if (!p) return;
    const catLabel = d[projectCategoryKey[item.category]] || item.category;
    const isIpynb = Boolean(item.documentFile && item.documentFile.toLowerCase().endsWith('.ipynb'));
    const downloadBtn = item.documentFile ? `<a class="btn btn-primary dialog-download" href="${h(item.documentFile)}" download>${h(getAssetLabel(item.documentFile, d))} ↓</a>` : '';
    const viewBtn = item.githubUrl ? `<a class="btn btn-outline dialog-download" href="${h(item.githubUrl)}" target="_blank" rel="noopener noreferrer">${h(isIpynb ? (d.viewNotebook || 'VIEW NOTEBOOK') : 'GITHUB')} ↗</a>` : '';
    const actionButtons = (downloadBtn || viewBtn) ? `<div style="display:flex;gap:11px;flex-wrap:wrap;align-items:center">${downloadBtn}${viewBtn}</div>` : '';

    $('#project-dialog-content').innerHTML = `<div class="dialog-inner">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        <span class="section-overline" style="margin:0;">PROJECT / ${h(item.number)}</span>
        <span class="project-category-badge">${h(catLabel)}</span>
        <span class="project-status-badge status-${item.status}"><span class="status-indicator"></span><span>${h(d[statusKey[item.status]])}</span></span>
      </div>
      <h2>${h(p.title)}</h2><p class="dialog-lead">${h(p.description)}</p>
      <div class="dialog-section"><h3>${h(d.dialogProblem)}</h3><p>${h(p.goal)}</p></div><div class="dialog-section"><h3>${h(d.dialogMethods)}</h3><p>${h(p.methods)}</p></div><div class="dialog-section"><h3>${h(d.dialogEvidence)}</h3><p>${h(p.evidence)}</p></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:20px 0 10px;">${item.chips.map(chip=>`<span class="tech-tag">${h(chip)}</span>`).join('')}</div>
      ${actionButtons}
      </div>`;
    $('#project-dialog').showModal();
  }
  async function loadGithubRepos() {
    const user = CONFIG.githubUser || (CONFIG.github || '').split('/').filter(Boolean).pop();
    if (!user) { GITHUB_REPOS = []; renderGithubFeed(); return; }
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=30`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw Error(String(res.status));
      const repos = await res.json();
      const excluded = new Set((CONFIG.githubFeedExclude || []).map(name => name.toLowerCase()));
      GITHUB_REPOS = repos
        .filter(r => !r.fork && !r.archived && r.name.toLowerCase() !== user.toLowerCase() && !excluded.has(r.name.toLowerCase()))
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 6);
    } catch {
      GITHUB_REPOS = [];
    }
    renderGithubFeed();
  }
  function renderGithubFeed() {
    const box = $('#github-feed');
    if (!box) return;
    const d = t();
    const head = `<div class="gh-feed-head"><span class="gh-feed-live"><span class="pulse"></span>${h(d.githubFeedTitle)}</span><p>${h(d.githubFeedCaption)}</p></div>`;
    const all = CONFIG.github ? `<a class="text-arrow gh-feed-all" href="${h(CONFIG.github)}?tab=repositories" target="_blank" rel="noopener noreferrer">${h(d.githubFeedAll)} ↗</a>` : '';
    if (GITHUB_REPOS === null) { box.innerHTML = head + `<div class="gh-feed-grid">${'<div class="gh-repo skeleton"></div>'.repeat(3)}</div>`; return; }
    if (!GITHUB_REPOS.length) { box.innerHTML = head + `<p class="content-note">${h(d.githubFeedError)}</p>` + all; return; }
    box.innerHTML = head + `<div class="gh-feed-grid">${GITHUB_REPOS.map(r => `<a class="gh-repo" href="${h(r.html_url)}" target="_blank" rel="noopener noreferrer">
        <span class="gh-repo-name"><svg aria-hidden="true" viewBox="0 0 24 24"><use href="#icon-github"></use></svg>${h(r.name)}</span>
        <span class="gh-repo-desc">${h(r.description || '')}</span>
        <span class="gh-repo-meta">${r.language ? `<span><span class="gh-lang-dot"></span>${h(r.language)}</span>` : ''}<span>★ ${h(r.stargazers_count)}</span><span>${h(d.githubFeedUpdated)} ${h(formatCertDate(r.pushed_at))}</span></span>
      </a>`).join('')}</div>` + all;
  }
  function renderResearch() {
    const grid = $('#research-grid');
    if (!grid) return;
    const d = t();
    const typeLabel = { thesis: d.researchTypeThesis, conference: d.researchTypeConference };
    grid.innerHTML = RESEARCH.map((item, index) => {
      const r = d.researchData?.[item.id];
      if (!r) return '';
      const metrics = (item.metrics || []).map(m => `<div class="research-metric"><strong>${h(m.value)}</strong><span>${h(d.researchLabels?.[m.label] || m.label)}</span></div>`).join('');
      return `<article class="research-card reveal" style="--entry-delay:${index * 70}ms">
        <div class="research-card-top"><span class="research-badges"><span class="research-type ${h(item.type)}">${h(typeLabel[item.type] || item.type)}</span>${item.status === 'accepted' ? `<span class="research-status">✓ ${h(d.researchAccepted)}</span>` : ''}</span><span class="research-year">${h(item.year)}</span></div>
        <h3 class="research-title">${h(r.title)}</h3>
        <p class="research-venue">${h(r.venue)}</p>
        <div class="research-metrics">${metrics}</div>
        <p class="research-summary">${h(r.summary)}</p>
        <ul class="research-highlights">${r.highlights.map(x => `<li>${h(x)}</li>`).join('')}</ul>
        <div class="project-tech-stack">${(item.tags || []).map(tag => `<span class="tech-tag">${h(tag)}</span>`).join('')}</div>
        ${item.url ? `<a class="text-arrow" href="${h(item.url)}" target="_blank" rel="noopener noreferrer">${h(d.certView)}</a>` : ''}
      </article>`;
    }).join('');
  }
  function renderStack() {
    const d = t();
    const stageIcons = ['⤓','◇','⛁','▥','⇄','↗'];
    $('#stage-grid').innerHTML = d.stages.map((stage,index) => {
      const isActive = state.selectedStage === index;
      return `<button type="button" data-stage="${index}" class="stage-card ${isActive ? 'active' : ''}" role="tab" aria-selected="${isActive}">
        <div class="stage-card-indicator">
          <span class="stage-node"></span>
          <span class="stage-num">${h(stage.number)}</span>
        </div>
        <div class="stage-card-content">
          <div class="stage-card-header">
            <h3 class="stage-name">${h(stage.name)}</h3>
            <span class="stage-symbol" aria-hidden="true">${stageIcons[index]}</span>
          </div>
          <p class="stage-sub">${h(stage.sub)}</p>
        </div>
      </button>`;
    }).join('');

    const stage = d.stages[state.selectedStage] || d.stages[0];
    const prevStage = state.selectedStage > 0 ? state.selectedStage - 1 : 0;
    const nextStage = state.selectedStage < d.stages.length - 1 ? state.selectedStage + 1 : d.stages.length - 1;

    $('#stage-description').innerHTML = `
      <div class="stage-details-card">
        <div class="stage-details-header">
          <div class="stage-meta-badge">
            <span class="stage-step-pill">${h(d.stageBadge)} / ${h(stage.number)}</span>
            <span class="stage-lifecycle-tag">${h(stage.name)}</span>
          </div>
          <div class="stage-nav-actions" aria-label="Step navigation">
            <button type="button" class="stage-nav-btn" data-stage="${prevStage}" ${state.selectedStage === 0 ? 'disabled' : ''} aria-label="Previous step">←</button>
            <span class="stage-nav-status">${state.selectedStage + 1} / ${d.stages.length}</span>
            <button type="button" class="stage-nav-btn" data-stage="${nextStage}" ${state.selectedStage === d.stages.length - 1 ? 'disabled' : ''} aria-label="Next step">→</button>
          </div>
        </div>

        <div class="stage-lead-block">
          <div class="stage-lead-icon" aria-hidden="true">${stageIcons[state.selectedStage]}</div>
          <div>
            <h3 class="stage-lead-title">${h(stage.name)}<span class="brand-dot">.</span></h3>
            <p class="stage-lead-sub">${h(stage.sub)}</p>
          </div>
        </div>

        <div class="stage-content-section">
          <h4 class="stage-section-title">${h(d.stageBadge)}</h4>
          <p class="stage-desc-para">${h(stage.desc)}</p>
        </div>

        <div class="stage-toolkit-section">
          <h4 class="stage-section-title">${h(d.toolkitTitle)}</h4>
          <div class="stage-tags">
            ${stage.tools.map(tool => `<span class="tool-tag"><span class="tool-check">✓</span>${h(tool)}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    $('#stack-skills').innerHTML = `<div class="skills-grid">${d.skillsGroups.map((grp,i)=>`<div class="skill-group"><div class="skill-group-number">0${i+1}</div><h3>${h(grp.name)}</h3><ul>${grp.items.map(skill=>`<li><span class="skill-bullet"></span>${h(skill)}</li>`).join('')}</ul></div>`).join('')}</div>`;
    $$('.view-toggle').forEach(btn => { const active = btn.dataset.stackView === state.stackView; btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active)); });
    $('#stack-workflow').hidden = state.stackView !== 'workflow'; $('#stack-skills').hidden = state.stackView !== 'skills';
    $$('[data-stage]').forEach(btn => btn.addEventListener('click',()=> { state.selectedStage = Number(btn.dataset.stage); renderStack(); }));
  }
  const COMMUNITY_ICONS = {
    blood: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.6 4.5c2 0 3.6 1.1 4.4 2.6.8-1.5 2.4-2.6 4.4-2.6 3.6 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21Z"/></svg>',
    industry: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 3v14M7 8h10M5 13a7 7 0 0 0 14 0M5 13l-2 2M19 13l2 2"/><circle cx="12" cy="3.5" r="1.5" fill="currentColor"/></svg>',
    awards: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/></svg>',
    languages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 5.5 5 7M11 5c-.6 3.4-3 6.4-6 8M13 21l4-9 4 9M14.5 18h5"/></svg>'
  };
  function renderCommunity() {
    const cards = t().communityCards || {};
    const timeline = (id, card) => `
      <article class="bento-card bento-${id} reveal" data-accent="${id}">
        <div class="bento-head">
          <span class="bento-icon">${COMMUNITY_ICONS[id]}</span>
          <div><p class="bento-tag">${h(card.tag)}</p><h3>${h(card.title)}</h3></div>
        </div>
        <ol class="bento-timeline">
          ${card.items.map(item => `<li><time>${h(item.date)}</time><span>${h(item.text)}</span></li>`).join('')}
        </ol>
      </article>`;
    const blood = cards.blood;
    $('#community-grid').innerHTML = `
      ${blood ? `<article class="bento-card bento-blood reveal" data-accent="blood">
        <div class="bento-head">
          <span class="bento-icon">${COMMUNITY_ICONS.blood}</span>
          <div><p class="bento-tag">${h(blood.tag)}</p><h3>${h(blood.title)}</h3></div>
        </div>
        <div class="bento-stat"><strong data-count-to="7">${h(blood.stat)}</strong><span>${h(blood.statLabel)}</span></div>
        <svg class="pulse-line" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 30 H90 L104 30 L114 8 L126 52 L138 18 L148 30 H300"/>
        </svg>
        <p class="bento-detail">${h(blood.detail)}</p>
        <div class="bento-meta"><span>${h(blood.org)}</span><span>${h(blood.period)}</span></div>
      </article>` : ''}
      ${['industry', 'awards', 'languages'].filter(id => cards[id]).map(id => timeline(id, cards[id])).join('')}`;
  }
  const certMarks = { hacker: 'H', datacamp: 'DC', coursera: 'C', language: '文' };
  function renderCerts() {
    const d = t();
    $('#cert-tabs').innerHTML =
      tab(d.certAll, 'cert', 'all', state.certFilter) +
      tab(d.certHacker, 'cert', 'hacker', state.certFilter) +
      tab(d.certDatacamp, 'cert', 'datacamp', state.certFilter) +
      tab(d.certCoursera, 'cert', 'coursera', state.certFilter) +
      tab(d.certLang, 'cert', 'language', state.certFilter);

    const certs = DATA.certificates.filter(c => state.certFilter === 'all' || c.type === state.certFilter);
    const pages = Math.max(1, Math.ceil(certs.length / PAGE_SIZE.cert));
    state.certPage = Math.min(state.certPage, pages);

    $('#cert-grid').innerHTML = pageSlice(certs, state.certPage, PAGE_SIZE.cert).map(c => {
      const title = d.certNames[c.id] || c.id;
      const kindLabel = c.kind === 'assessment' ? d.certKindAssessment : d.certKindCourse;
      const external = /^https?:/.test(c.asset || '');
      const certId = c.certId || '';
      return `
        <article class="cert-card reveal ${c.featured ? 'is-featured' : ''}" data-type="${h(c.type)}">
          <a class="cert-visual" href="${h(c.asset)}" target="_blank" rel="noopener noreferrer" aria-label="${h(title)}">
            <img src="${h(c.thumb)}" alt="" loading="lazy" decoding="async">
            ${c.featured ? `<span class="cert-key">★ ${h(d.certKey)}</span>` : ''}
            <span class="cert-mark ${h(c.type)}"><span class="cert-mark-text">${h(certMarks[c.type] || c.mark)}</span></span>
          </a>
          <div class="cert-card-body">
            <span class="cert-kind-pill ${h(c.kind)}"><span class="kind-pip"></span>${h(kindLabel)}</span>
            <h3 class="cert-card-title">${h(title)}</h3>
            <p class="cert-provider-name">${h(c.provider)}</p>
            <div class="cert-meta-row">
              <span class="cert-date-chip">${h(formatCertDate(c.when))}</span>
              ${c.score ? `<span class="cert-score-chip"><span class="score-dot"></span>${h(c.score)}</span>` : ''}
            </div>
          </div>
          <div class="cert-card-footer">
            ${certId ? `<span class="cert-id-tag"><span class="cert-id-label">ID</span><span class="cert-id-code">${h(certId)}</span></span>` : '<span></span>'}
            <a href="${h(c.asset)}" target="_blank" rel="noopener noreferrer" class="cert-doc-btn">${h(external ? d.certVerify : d.certView)}</a>
          </div>
        </article>`;
    }).join('');

    $('#cert-pager').innerHTML = pager('cert', state.certPage, pages, d);
    bindPager($('#cert-pager'), 'cert', page => { state.certPage = page; renderCerts(); });
    $$('[data-cert]').forEach(btn =>
      btn.addEventListener('click', () => {
        state.certFilter = btn.dataset.cert;
        state.certPage = 1;
        renderCerts();
      })
    );
  }
  function renderContacts() {
    const d=t();
    const cards = [
      {kind:'email',icon:'✉',name:d.contactEmail,sub:d.contactEmailSub,url:'mailto:'+CONFIG.email},
      {kind:'linkedin',icon:'in',name:d.contactLinkedIn,sub:d.contactLinkedInSub,url:CONFIG.linkedin},
      {kind:'github',icon:'⌘',name:d.contactGithub,sub:d.contactGithubSub,url:CONFIG.github},
      {kind:'resume',icon:'↧',name:d.contactResume,sub:d.contactResumeSub,url:CONFIG.resume}
    ];
    $('#contact-grid').innerHTML = cards.map(card => card.url ? `<a class="contact-card reveal" href="${h(card.url)}" ${card.kind==='email'?'':'target="_blank" rel="noopener noreferrer"'}><span class="contact-icon ${card.kind}">${h(card.icon)}</span><h3>${h(card.name)}</h3><p>${h(card.sub)}</p><span class="contact-arrow">↗</span></a>` : `<div class="contact-card reveal disabled" aria-disabled="true"><span class="contact-icon ${card.kind}">${h(card.icon)}</span><h3>${h(card.name)}</h3><p>${h(card.sub)}</p><span class="coming-soon">${h(d.comingSoon)}</span></div>`).join('');
    const link = $('#github-hero'); if(CONFIG.github) {link.href=CONFIG.github;link.target='_blank';link.rel='noopener noreferrer';$('#github-status').textContent='↗';}else { link.href='#contact';$('#github-status').textContent='SOON'; }
  }
  function setTheme(theme) {
    state.theme=theme;document.body.classList.toggle('theme-light',theme==='light');document.body.classList.toggle('theme-dark',theme==='dark');
    $('.theme-symbol').textContent=theme==='dark'?'☼':'☾';
    $('#theme-switcher span:last-child').textContent=theme==='dark'?t().themeLight:t().themeDark;
    save('haven-theme',theme);
  }
  function bind() {
    $('#language-switcher').addEventListener('change',e=> {state.lang=e.target.value;save('haven-language',state.lang);applyTranslation();});
    $('#theme-switcher').addEventListener('click',()=>setTheme(state.theme==='dark'?'light':'dark'));
    $('#copy-email').addEventListener('click',async()=> {
      try { if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(CONFIG.email);
        else {const el=document.createElement('textarea');el.value=CONFIG.email;el.style.position='fixed';el.style.left='-10000px';document.body.appendChild(el);el.select();if(!document.execCommand('copy')) throw Error('copy failed');el.remove();}
        toast(t().emailCopied);
      } catch {toast(t().copyFallback+CONFIG.email);}
    });
    $('#menu-switcher').addEventListener('click',()=> {const opened=$('#nav').classList.toggle('opened');$('#menu-switcher').setAttribute('aria-expanded',String(opened));document.body.classList.toggle('mobile-nav-open',opened);});
    $$('.primary-nav a').forEach(anchor => anchor.addEventListener('click',()=> {$('#nav').classList.remove('opened');$('#menu-switcher').setAttribute('aria-expanded','false');document.body.classList.remove('mobile-nav-open');}));
    $$('.view-toggle').forEach(btn=>btn.addEventListener('click',()=>{state.stackView=btn.dataset.stackView;renderStack();}));
    $('#dialog-close').addEventListener('click',()=>$('#project-dialog').close());
    $('#project-dialog').addEventListener('click',e=> {if (e.target===$('#project-dialog')) $('#project-dialog').close();});
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#project-dialog').open) $('#project-dialog').close(); });
    $$('a[href="#top"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', moveNavIndicator, { passive: true });
  }
  function updateProgress() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    $('#progress').style.width = (height > 0 ? (window.scrollY / height) * 100 : 0) + '%';
  }
  const sectionIds = ['about', 'education', 'experience', 'certifications', 'projects', 'research', 'stack', 'community', 'contact'];
  function updateActiveNav() {
    const scrollY = window.scrollY;
    const headerOffset = 130;
    let currentId = '';
    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const sec = document.getElementById(sectionIds[i]);
      if (sec && (sec.offsetTop - headerOffset) <= scrollY) {
        currentId = sec.id;
        break;
      }
    }
    $$('.primary-nav a').forEach(a => {
      const isMatch = a.getAttribute('href') === '#' + currentId;
      a.classList.toggle('selected', isMatch);
      if (isMatch) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    $('#site-header')?.classList.toggle('scrolled', scrollY > 12);
    if (currentId !== lastNavId) { lastNavId = currentId; syncNavAccent(currentId); }
    moveNavIndicator();
  }
  let lastNavId = null;
  function navIndicator() {
    let el = $('.nav-indicator');
    if (!el) { el = document.createElement('span'); el.className = 'nav-indicator'; el.setAttribute('aria-hidden', 'true'); $('#nav').prepend(el); }
    return el;
  }
  function moveNavIndicator() {
    const el = navIndicator();
    const active = $('.primary-nav a.selected');
    if (!active) { el.classList.remove('on'); return; }
    el.style.width = `${active.offsetWidth}px`;
    el.style.transform = `translateX(${active.offsetLeft}px)`;
    el.classList.add('on');
  }
  function syncNavAccent(id) {
    const header = $('#site-header');
    const section = id && document.getElementById(id);
    if (!header || !section) return;
    const css = getComputedStyle(section);
    const a = css.getPropertyValue('--sa').trim();
    if (!a) return;
    header.style.setProperty('--nav-accent', a);
    header.style.setProperty('--nav-accent-2', css.getPropertyValue('--sa-2').trim());
    header.style.setProperty('--nav-accent-rgb', css.getPropertyValue('--sa-rgb').trim());
  }
  function setupObservers() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }
    const reveal = new IntersectionObserver((items, observer) => items.forEach(item => {
      if (item.isIntersecting) {
        item.target.classList.add('is-visible');
        observer.unobserve(item.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    // Hero entrance handled by motion.js - skip hero section elements
    $$('.reveal').forEach(el => { if (!el.closest('#hero')) reveal.observe(el); });
  }
  setTheme(state.theme === 'light' ? 'light' : 'dark');
  applyTranslation();
  bind();
  setupObservers();
  updateProgress();
  updateActiveNav();
  // content.js is regenerated from data/*.json on every change (scripts/build-content.js
  // + CI), so the JSON files are only fetched when the bundle is missing. This avoids
  // downloading the same data twice and rendering every section a second time.
  if (!window.PORTFOLIO_I18N || !window.PORTFOLIO_RECORDS) loadDataFromJSON();
  loadGithubRepos();
  const scrollTarget = new URLSearchParams(window.location.search).get('scroll');
  if (scrollTarget) {
    const doScroll = () => {
      setTimeout(() => {
        const target = document.getElementById(scrollTarget);
        if (target) {
          target.scrollIntoView({ behavior: 'instant', block: 'start' });
          target.querySelectorAll('.reveal, .contact-card').forEach(el => el.classList.add('is-visible'));
          if (target.id === 'experience') document.getElementById('experience-list')?.classList.add('rail-animated');
          if (target.id === 'stack') document.getElementById('stage-grid')?.classList.add('line-animated');
        }
      }, 150);
    };
    if (document.readyState === 'complete') doScroll();
    else window.addEventListener('load', doScroll);
  }
})();
