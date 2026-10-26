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
  const language = urlLang || getSaved('haven-language', 'en');
  const state = { lang: PACKS[language] ? language : 'en', theme: getSaved('haven-theme','dark'), expFilter:'all', projectFilter:'all', certFilter:'all', selectedStage:0, stackView:'workflow' };
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
    setupObservers();
  }
  function renderExperience() {
    const d = t();
    $('#experience-tabs').innerHTML = tab(d.tabAll,'exp','all',state.expFilter) + tab(d.tabPlanning,'exp','planning',state.expFilter) + tab(d.tabLogistics,'exp','logistics',state.expFilter);
    const found = DATA.experience.filter(item => state.expFilter === 'all' || item.category === state.expFilter);
    $('#experience-list').innerHTML = found.map((item,index) => {
      const x = d.experienceData?.[item.id];
      if (!x) return '';
      const logoMarkup = item.logo ? `<img src="${h(item.logo)}" alt="${h(x.org)}" class="company-logo-img">` : h(item.initials);
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
        <div class="exp-card-body">
          <p class="exp-summary">${h(x.summary)}</p>
          <ul class="exp-bullets">
            ${x.bullets.map(line => `<li>${h(line)}</li>`).join('')}
          </ul>
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
    $('#project-grid').innerHTML = DATA.projects.filter(item => state.projectFilter === 'all' || state.projectFilter === item.category).map(item => {
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
    $$('[data-project]').forEach(btn => btn.addEventListener('click', () => { state.projectFilter = btn.dataset.project; renderProjects(); }));
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
      GITHUB_REPOS = repos
        .filter(r => !r.fork && !r.archived && r.name.toLowerCase() !== user.toLowerCase())
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
        <div class="research-card-top"><span class="research-type ${h(item.type)}">${h(typeLabel[item.type] || item.type)}</span><span class="research-year">${h(item.year)}</span></div>
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
  function renderCommunity() {
    const d = t();
    const lang = state.lang || 'en';

    const evidenceMeta = {
      en: [
        { evidence: 'VERIFIED RECORD', tags: ['Thu Duc Red Cross', 'Official Certificate'] },
        { evidence: 'FIELD OBSERVATION', tags: ['Lazada Vietnam', 'Cai Mep–Thi Vai Port'] },
        { evidence: 'COURSE COMPLETION', tags: ['Yuan Ze University', 'Dec 2025 · Level 2'] }
      ],
      vi: [
        { evidence: 'HỒ SƠ XÁC NHẬN', tags: ['Hội Chữ thập đỏ Thủ Đức', 'Giấy chứng nhận'] },
        { evidence: 'THỰC ĐỊA DOANH NGHIỆP', tags: ['Lazada Việt Nam', 'Cảng Cái Mép – Thị Vải'] },
        { evidence: 'CHỨNG NHẬN HOÀN THÀNH', tags: ['Đại học Nguyên Trí', '12/2025 · Level 2'] }
      ],
      'zh-Hant': [
        { evidence: '認證紀錄', tags: ['守德市紅十字會', '官方證明文件'] },
        { evidence: '實地參訪', tags: ['越南 Lazada', '蓋梅—氏威港'] },
        { evidence: '結業證明', tags: ['元智大學', '2025 年 12 月 · Level 2'] }
      ],
      'zh-Hans': [
        { evidence: '认证记录', tags: ['守德市红十字会', '官方证明文件'] },
        { evidence: '实地参访', tags: ['越南 Lazada', '盖梅—氏威港'] },
        { evidence: '结业证明', tags: ['元智大学', '2025 年 12 月 · Level 2'] }
      ]
    };

    const visuals = [
      {
        type: 'image',
        src: 'assets/blood-donation-evidence.jpg',
        alt: 'Blood Donation Certificate Evidence'
      },
      {
        type: 'schematic',
        flowLabel: lang === 'vi' ? 'Luồng thực địa' : (lang.startsWith('zh') ? '物流實務流程' : 'Logistics Field Flow'),
        node1: lang === 'vi' ? 'Cảng Cái Mép' : (lang === 'zh-Hant' ? '蓋梅—氏威港' : (lang === 'zh-Hans' ? '盖梅—氏威港' : 'Cai Mep Port')),
        node1Sub: lang === 'vi' ? 'Cảng nước sâu' : (lang.startsWith('zh') ? '國際深水港碼頭' : 'Deep-water Port'),
        node2: lang === 'vi' ? 'Lazada Việt Nam' : (lang.startsWith('zh') ? '越南 Lazada' : 'Lazada Vietnam'),
        node2Sub: lang === 'vi' ? 'Trung tâm điều phối' : (lang.startsWith('zh') ? '電商物流營運中心' : 'E-Commerce Hub')
      },
      {
        type: 'image',
        src: 'assets/mandarin-completion-evidence.jpg',
        alt: 'Yuan Ze University Mandarin Certificate Evidence'
      }
    ];

    const currentMeta = evidenceMeta[lang] || evidenceMeta.en;

    $('#community-grid').innerHTML = d.communities.map((item, index) => {
      const meta = currentMeta[index] || currentMeta[0];
      const visual = visuals[index] || visuals[0];

      let visualHtml = '';
      if (visual.type === 'image') {
        visualHtml = `
          <div class="community-visual">
            <img class="community-img" src="${visual.src}" alt="${visual.alt}" />
            <div class="community-visual-overlay">
              <span class="community-badge">${h(item.meta)}</span>
              <span class="community-evidence-pill"><span class="evidence-dot"></span>${h(meta.evidence)}</span>
            </div>
          </div>
        `;
      } else {
        visualHtml = `
          <div class="community-visual community-visual-schematic">
            <div class="schematic-backdrop">
              <div class="schematic-grid"></div>
              <div class="schematic-flow">
                <div class="schematic-node">
                  <span class="node-icon">⚓</span>
                  <span class="node-label">${h(visual.node1)}</span>
                  <span class="node-sub">${h(visual.node1Sub)}</span>
                </div>
                <div class="schematic-connector">
                  <span class="connector-line"></span>
                  <span class="connector-badge">${h(visual.flowLabel)}</span>
                </div>
                <div class="schematic-node">
                  <span class="node-icon">⬡</span>
                  <span class="node-label">${h(visual.node2)}</span>
                  <span class="node-sub">${h(visual.node2Sub)}</span>
                </div>
              </div>
            </div>
            <div class="community-visual-overlay">
              <span class="community-badge">${h(item.meta)}</span>
              <span class="community-evidence-pill"><span class="evidence-dot"></span>${h(meta.evidence)}</span>
            </div>
          </div>
        `;
      }

      return `
        <article class="community-card reveal">
          ${visualHtml}
          <div class="community-body">
            <div class="community-title-row">
              <span class="community-icon-box" aria-hidden="true">${h(item.icon)}</span>
              <h3 class="community-title">${h(item.title)}</h3>
            </div>
            <p class="community-desc">${h(item.detail)}</p>
            <div class="community-supporting">
              ${meta.tags.map(t => `<span class="supporting-chip"><span class="chip-pip"></span>${h(t)}</span>`).join('')}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }
  function renderCerts() {
    const d = t();

    const authenticCertIds = {
      'hr-advanced': '8BD0268A1AD0',
      'hr-intermediate': 'F96F359F6A36',
      'dc-powerbi': '#46,589,243',
      'dc-intermediate': '#48,286,431',
      'dc-ai': '#48,019,383',
      'dc-intro': '#47,991,469'
    };

    $('#cert-tabs').innerHTML =
      tab(d.certAll, 'cert', 'all', state.certFilter) +
      tab(d.certHacker, 'cert', 'hacker', state.certFilter) +
      tab(d.certDatacamp, 'cert', 'datacamp', state.certFilter) +
      tab(d.certCoursera, 'cert', 'coursera', state.certFilter) +
      tab(d.certLang, 'cert', 'language', state.certFilter);

    $('#cert-grid').innerHTML = DATA.certificates
      .filter(c => state.certFilter === 'all' || c.type === state.certFilter)
      .map(c => {
        const title = d.certNames[c.id] || c.id;
        const kindLabel = c.kind === 'assessment' ? d.certKindAssessment : d.certKindCourse;
        const certId = c.certId || authenticCertIds[c.id];

        let logoContent = '';
        if (c.id === 'mandarin') {
          logoContent = `<img src="assets/yuan-ze-university.png" alt="Yuan Ze University" class="cert-logo-img">`;
        } else {
          logoContent = `<span class="cert-mark-text">${h(c.mark)}</span>`;
        }

        return `
          <article class="cert-card reveal" data-type="${h(c.type)}">
            <div class="cert-card-header">
              <div class="cert-mark ${h(c.type)}">${logoContent}</div>
              <span class="cert-kind-pill ${h(c.kind)}">
                <span class="kind-pip"></span>${h(kindLabel)}
              </span>
            </div>

            <div class="cert-card-body">
              <h3 class="cert-card-title">${h(title)}</h3>
              <div class="cert-provider-row">
                <svg class="cert-provider-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-11zM2.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-11z"/>
                  <path d="M4 4h2v2H4V4zm3 0h2v2H7V4zm3 0h2v2h-2V4zM4 7h2v2H4V7zm3 0h2v2H7V7zm3 0h2v2h-2V7zM4 10h2v2H4v-2zm3 0h2v2H7v-2zm3 0h2v2h-2v-2z"/>
                </svg>
                <span class="cert-provider-name">${h(c.provider)}</span>
              </div>

              <div class="cert-meta-row">
                <span class="cert-date-chip">
                  <span class="cert-calendar-icon" aria-hidden="true">▦</span>
                  ${h(formatCertDate(c.when))}
                </span>
                ${c.score ? `<span class="cert-score-chip"><span class="score-dot"></span>${h(c.score)}</span>` : ''}
              </div>

              ${certId ? `
                <div class="cert-id-container">
                  <span class="cert-id-tag">
                    <span class="cert-id-label">ID</span>
                    <span class="cert-id-code">${h(certId)}</span>
                  </span>
                </div>
              ` : ''}
            </div>

            <div class="cert-card-footer">
              ${c.asset ? `
                <a href="${h(c.asset)}" target="_blank" rel="noopener noreferrer" class="cert-doc-btn">
                  <svg class="cert-doc-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                  </svg>
                  <span>${h(d.certView)}</span>
                </a>
              ` : `
                <span class="cert-private-tag">
                  <svg class="cert-lock-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                  </svg>
                  <span>${h(d.certPrivate)}</span>
                </span>
              `}
            </div>
          </article>
        `;
      })
      .join('');

    $$('[data-cert]').forEach(btn =>
      btn.addEventListener('click', () => {
        state.certFilter = btn.dataset.cert;
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
  loadDataFromJSON();
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
