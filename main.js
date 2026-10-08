(() => {
  'use strict';
  let PACKS = window.PORTFOLIO_I18N || {};
  let DATA = window.PORTFOLIO_RECORDS || { experience: [], projects: [], certificates: [] };
  let CONFIG = window.PORTFOLIO_CONFIG || {};
  let RESEARCH = [];
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const getSaved = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const h = (s) => String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const language = getSaved('haven-language', 'en');
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
    renderExperience();renderProjects();renderStack();renderCommunity();renderCerts();renderContacts();
  }
  function renderExperience() {
    const d = t();
    $('#experience-tabs').innerHTML = tab(d.tabAll,'exp','all',state.expFilter) + tab(d.tabPlanning,'exp','planning',state.expFilter) + tab(d.tabLogistics,'exp','logistics',state.expFilter);
    const found = DATA.experience.filter(item => state.expFilter === 'all' || item.category === state.expFilter);
    $('#experience-list').innerHTML = found.map((item,index) => {
      const x = d.experienceData?.[item.id];
      if (!x) return '';
      return `<article class="experience-card reveal is-visible" style="--entry-delay:${index * 55}ms">
        <div class="company-icon ${item.className}">${h(item.initials)}</div>
        <div class="experience-body"><div class="exp-header"><span class="company-name">${h(x.org)}</span><span class="exp-period">◷ &nbsp;${h(experiencePeriods[state.lang]?.[item.id] || item.period)}</span></div>
        <h3>${h(x.role)}</h3><p>${h(x.summary)}</p>
        <ul class="exp-bullets">${x.bullets.map(line => `<li>${h(line)}</li>`).join('')}</ul></div><span class="card-index">${String(index+1).padStart(2,'0')}</span>
      </article>`;
    }).join('');
    $$('[data-exp]').forEach(btn => btn.addEventListener('click', () => { state.expFilter = btn.dataset.exp; renderExperience(); }));
  }
  const experiencePeriods = {
    vi:{'hoa-sen':'10/2024 – 04/2025','kodai':'2023 – 08/2024','vietlog':'01 – 07/2023'},
    'zh-Hant':{'hoa-sen':'2024/10 – 2025/04','kodai':'2023 – 2024/08','vietlog':'2023/01 – 2023/07'},
    'zh-Hans':{'hoa-sen':'2024/10 – 2025/04','kodai':'2023 – 2024/08','vietlog':'2023/01 – 2023/07'}
  };
  const formatCertDate = text => {
    const locale = state.lang === 'zh-Hant' ? 'zh-TW' : state.lang === 'zh-Hans' ? 'zh-CN' : state.lang;
    return new Intl.DateTimeFormat(locale, {year:'numeric', month:'short', day:'numeric'}).format(new Date(text));
  };
  const statusKey = {development:'projDevelopment',starter:'projStarter',concept:'projConcept',coursework:'projCoursework'};
  function renderProjects() {
    const d = t();
    $('#project-tabs').innerHTML = tab(d.projAll,'project','all',state.projectFilter) + tab(d.projAnalytics,'project','analytics',state.projectFilter) + tab(d.projSql,'project','sql',state.projectFilter) + tab(d.projSupply,'project','supply',state.projectFilter);
    $('#project-grid').innerHTML = DATA.projects.filter(item => state.projectFilter === 'all' || state.projectFilter === item.category).map(item => {
      const p = d.projectData?.[item.id];
      if (!p) return '';
      return `<article class="project-card reveal is-visible" aria-label="${h(p.title)}">
        <div class="project-top"><div class="project-icon" aria-hidden="true">${h(item.icon)}</div><span class="project-index">/ ${item.number}</span></div>
        <span class="status status-${item.status}"><span class="status-indicator"></span>${h(d[statusKey[item.status]])}</span>
        <h3>${h(p.title)}</h3><p>${h(p.description)}</p>
        <div class="tech-tags">${item.chips.map(tag => `<span>${h(tag)}</span>`).join('')}</div>
        <button class="project-open" type="button" data-project-open="${item.id}">${h(d.projectDetails)} <span aria-hidden="true">↗</span></button></article>`;
    }).join('');
    $$('[data-project]').forEach(btn => btn.addEventListener('click', () => { state.projectFilter = btn.dataset.project; renderProjects(); }));
    $$('[data-project-open]').forEach(btn => btn.addEventListener('click', () => openProject(btn.dataset.projectOpen)));
  }
  function openProject(id) {
    const item = DATA.projects.find(p => p.id === id);
    if (!item) return;
    const d = t(), p = d.projectData?.[id];
    if (!p) return;
    const dl = {en:'DOWNLOAD SYNTHETIC SQL STARTER',vi:'TẢI DỰ ÁN SQL DỮ LIỆU GIẢ LẬP','zh-Hant':'下載模擬 SQL 範例','zh-Hans':'下载模拟 SQL 示例'};
    $('#project-dialog-content').innerHTML = `<div class="dialog-inner"><span class="section-overline">PROJECT / ${h(item.number)}</span><h2>${h(p.title)}</h2><span class="status status-${item.status}">${h(d[statusKey[item.status]])}</span><p class="dialog-lead">${h(p.description)}</p>
      <div class="dialog-section"><h3>${h(d.dialogProblem)}</h3><p>${h(p.goal)}</p></div><div class="dialog-section"><h3>${h(d.dialogMethods)}</h3><p>${h(p.methods)}</p></div><div class="dialog-section"><h3>${h(d.dialogEvidence)}</h3><p>${h(p.evidence)}</p></div><div class="tech-tags">${item.chips.map(chip=>`<span>${h(chip)}</span>`).join('')}</div>
      ${id === 'sql' ? `<a class="btn btn-primary dialog-download" href="projects/sql_supply_chain_starter.zip" download>${h(dl[state.lang])} ↓</a>` : ''}
      </div>`;
    $('#project-dialog').showModal();
  }
  function renderStack() {
    const d = t();
    $('#stage-grid').innerHTML = d.stages.map((stage,index) => `<button type="button" data-stage="${index}" class="stage-card ${state.selectedStage===index?'active':''}" aria-pressed="${state.selectedStage===index}"><div class="stage-top"><span>${h(stage.number)}. ${h(stage.name)}</span><span class="stage-symbol" aria-hidden="true">${['⤓','◇','⛁','▥','⇄','↗'][index]}</span></div><h3>${h(stage.sub)}</h3></button>`).join('');
    const stage = d.stages[state.selectedStage];
    $('#stage-description').innerHTML = `<div class="stage-details"><div><span class="section-overline">${h(d.stageBadge)} / ${h(stage.number)}</span><h3>${h(stage.name)}<span class="gold-dot">.</span></h3><p>${h(stage.desc)}</p></div><div><h4>${h(d.toolkitTitle)}</h4><div class="stage-tags">${stage.tools.map(tool => `<span>✓ ${h(tool)}</span>`).join('')}</div></div></div>`;
    $('#stack-skills').innerHTML = `<div class="skills-grid">${d.skillsGroups.map((grp,i)=>`<div class="skill-group"><div class="skill-group-number">0${i+1}</div><h3>${h(grp.name)}</h3><ul>${grp.items.map(skill=>`<li><span class="skill-bullet"></span>${h(skill)}</li>`).join('')}</ul></div>`).join('')}</div>`;
    $$('.view-toggle').forEach(btn => { const active = btn.dataset.stackView === state.stackView; btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active)); });
    $('#stack-workflow').hidden = state.stackView !== 'workflow'; $('#stack-skills').hidden = state.stackView !== 'skills';
    $$('[data-stage]').forEach(btn => btn.addEventListener('click',()=> { state.selectedStage = Number(btn.dataset.stage); renderStack(); }));
  }
  function renderCommunity() {$('#community-grid').innerHTML = t().communities.map(item=>`<article class="community-card"><div class="community-symbol" aria-hidden="true">${h(item.icon)}</div><span class="section-overline">${h(item.meta)}</span><h3>${h(item.title)}</h3><p>${h(item.detail)}</p></article>`).join('');}
  function renderCerts() {
    const d=t();
    $('#cert-tabs').innerHTML = tab(d.certAll,'cert','all',state.certFilter) + tab(d.certHacker,'cert','hacker',state.certFilter) + tab(d.certDatacamp,'cert','datacamp',state.certFilter) + tab(d.certLang,'cert','language',state.certFilter);
    $('#cert-grid').innerHTML = DATA.certificates.filter(c => state.certFilter === 'all' || c.type === state.certFilter).map(c => `<article class="cert-card"><div class="cert-heading"><div class="cert-mark ${c.type}">${h(c.mark)}</div><div><h3>${h(d.certNames[c.id])}</h3><span class="cert-provider">${h(c.provider)}</span></div></div><div class="cert-meta">${h(c.kind==='assessment'?d.certKindAssessment:d.certKindCourse)}</div><div class="cert-footer"><span>▦ &nbsp;${h(formatCertDate(c.when))}</span>${c.asset ? `<a href="${h(c.asset)}" target="_blank" rel="noopener noreferrer">${h(d.certView)}</a>`:`<span class="private-record">${h(d.certPrivate)}</span>`}</div></article>`).join('');
    $$('[data-cert]').forEach(btn => btn.addEventListener('click',()=> { state.certFilter = btn.dataset.cert; renderCerts(); }));
  }
  function renderContacts() {
    const d=t();
    const cards = [
      {kind:'email',icon:'✉',name:d.contactEmail,sub:d.contactEmailSub,url:'mailto:'+CONFIG.email},
      {kind:'linkedin',icon:'in',name:d.contactLinkedIn,sub:d.contactLinkedInSub,url:CONFIG.linkedin},
      {kind:'github',icon:'⌘',name:d.contactGithub,sub:d.contactGithubSub,url:CONFIG.github},
      {kind:'resume',icon:'↧',name:d.contactResume,sub:d.contactResumeSub,url:CONFIG.resume}
    ];
    $('#contact-grid').innerHTML = cards.map(card => card.url ? `<a class="contact-card" href="${h(card.url)}" ${card.kind==='email'?'':'target="_blank" rel="noopener noreferrer"'}><span class="contact-icon ${card.kind}">${h(card.icon)}</span><h3>${h(card.name)}</h3><p>${h(card.sub)}</p><span class="contact-arrow">↗</span></a>` : `<div class="contact-card disabled" aria-disabled="true"><span class="contact-icon ${card.kind}">${h(card.icon)}</span><h3>${h(card.name)}</h3><p>${h(card.sub)}</p><span class="coming-soon">${h(d.comingSoon)}</span></div>`).join('');
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
    window.addEventListener('scroll',updateProgress,{passive:true});
  }
  function updateProgress(){const height=document.documentElement.scrollHeight-window.innerHeight;$('#progress').style.width=(height>0?window.scrollY/height*100:0)+'%';}
  function setupObservers() {
    if(!('IntersectionObserver' in window)) { $$('.reveal').forEach(el=>el.classList.add('is-visible'));return; }
    const reveal = new IntersectionObserver((items,observer)=> items.forEach(item=>{if(item.isIntersecting){item.target.classList.add('is-visible');observer.unobserve(item.target);}}),{threshold:0.09,rootMargin:'0px 0px -30px 0px'});
    $$('.reveal').forEach(el=>reveal.observe(el));
    const sections=['about','experience','projects','stack','community','certifications','contact'].map(id=>document.getElementById(id));
    const navObserver = new IntersectionObserver((items)=>items.forEach(item=>{if(item.isIntersecting){$$('.primary-nav a').forEach(a=>a.classList.toggle('selected',a.getAttribute('href')==='#'+item.target.id));}}),{rootMargin:'-22% 0px -62% 0px',threshold:0});
    sections.forEach(s=>navObserver.observe(s));
  }
  setTheme(state.theme==='light'?'light':'dark'); applyTranslation();bind();setupObservers();updateProgress();loadDataFromJSON();
})();
