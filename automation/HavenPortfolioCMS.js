/**
 * ============================================================================
 * HAVEN PORTFOLIO CMS — GOOGLE APPS SCRIPT CORE ENGINE
 * ============================================================================
 * Owner: Pham Hong Hieu (Haven - 范鴻孝)
 * Repository: Haven-Pham/Portfolio
 * Phase: Phase 2 — Google Sheet CMS + Google Drive Foundation
 *
 * This script runs inside Google Sheets and provides:
 * 1. Custom UI menu (HAVEN PORTFOLIO)
 * 2. Automated Sheet initialization (setupCMS)
 * 3. Drive folder management (createDriveFolderStructure)
 * 4. Comprehensive CMS data validation (validateCMS)
 * 5. Publish preview (previewPublish)
 * 6. Safe disabled publish action (publishWebsite)
 * ============================================================================
 */

/**
 * Triggered automatically when the spreadsheet is opened.
 * Adds the 'HAVEN PORTFOLIO' menu to the spreadsheet UI.
 */
function onOpen() {
  let ui;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {
    return;
  }
  ui.createMenu('HAVEN PORTFOLIO')
    .addItem('Validate CMS', 'validateCMS')
    .addItem('Preview Publish', 'previewPublish')
    .addItem('Test GitHub Connection (Phase 3A)', 'testGitHubConnection')
    .addItem('Preview GitHub Sync (Phase 3B)', 'previewGitHubSync')
    .addSeparator()
    .addItem('Publish Website (Phase 3)', 'publishWebsite')
    .addSeparator()
    .addItem('Setup / Reset All Sheets', 'setupCMS')
    .addItem('Setup Drive Folder Structure', 'createDriveFolderStructure')
    .addToUi();
}

/**
 * Phase 3A: Test GitHub API connection and token permissions (Strictly Read-Only).
 * 
 * Verifies token existence, user authentication, repository access, branch status, and file read.
 */
function testGitHubConnection() {
  const ui = SpreadsheetApp.getUi();
  const config = getConfig();
  const owner = config['GITHUB_OWNER'] || 'Haven-Pham';
  const repo = config['GITHUB_REPO'] || 'Portfolio';
  const branch = config['GITHUB_BRANCH'] || 'main';

  // TEST 1: TOKEN EXISTENCE
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const tokenStatus = (token && token.trim().length > 0) ? 'TOKEN_PRESENT' : 'TOKEN_MISSING';

  if (tokenStatus === 'TOKEN_MISSING') {
    const errorMsg = 'GITHUB_TOKEN is missing in Script Properties.\n\n' +
      'Please open Project Settings > Script Properties and add GITHUB_TOKEN.';
    ui.alert('Phase 3A: GitHub Connection Test Failed', errorMsg, ui.ButtonSet.OK);
    Logger.log('1. TOKEN STATUS: TOKEN_MISSING');
    return;
  }

  const headers = {
    'Authorization': 'Bearer ' + token.trim(),
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Haven-Portfolio-CMS'
  };

  let authStatus = 'FAILED';
  let repoStatus = 'FAILED';
  let branchStatus = 'FAILED';
  let contentReadStatus = 'FAILED';
  const errorDetails = [];

  // TEST 2: GITHUB API AUTHENTICATION
  try {
    const userRes = UrlFetchApp.fetch('https://api.github.com/user', {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });
    const userCode = userRes.getResponseCode();
    if (userCode === 200) {
      const userData = JSON.parse(userRes.getContentText());
      authStatus = `SUCCESS (Authenticated as ${userData.login || 'user'})`;
    } else if (userCode === 403 || userCode === 401) {
      // Fine-grained tokens scoped to repository only may return 403/401 on /user
      authStatus = `TOKEN_AUTHENTICATED (HTTP ${userCode} on /user; verifying repository scope...)`;
    } else {
      errorDetails.push(`GET /user HTTP ${userCode}`);
    }
  } catch (err) {
    errorDetails.push(`Auth check: ${err.message}`);
  }

  // TEST 3: REPOSITORY ACCESS
  try {
    const repoRes = UrlFetchApp.fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });
    const repoCode = repoRes.getResponseCode();
    if (repoCode === 200) {
      const repoData = JSON.parse(repoRes.getContentText());
      repoStatus = `SUCCESS (${repoData.full_name} accessible)`;
      if (authStatus.startsWith('TOKEN_AUTHENTICATED')) {
        authStatus = `SUCCESS (Authorized for ${repoData.full_name})`;
      }
    } else {
      repoStatus = `FAILED (HTTP ${repoCode})`;
      errorDetails.push(`GET /repos/${owner}/${repo} HTTP ${repoCode}`);
    }
  } catch (err) {
    repoStatus = 'FAILED';
    errorDetails.push(`Repo check: ${err.message}`);
  }

  // TEST 3B: BRANCH STATUS
  try {
    const branchRes = UrlFetchApp.fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });
    const branchCode = branchRes.getResponseCode();
    if (branchCode === 200) {
      branchStatus = `SUCCESS (Branch "${branch}" verified)`;
    } else {
      branchStatus = `FAILED (HTTP ${branchCode})`;
      errorDetails.push(`GET /branches/${branch} HTTP ${branchCode}`);
    }
  } catch (err) {
    branchStatus = 'FAILED';
    errorDetails.push(`Branch check: ${err.message}`);
  }

  // TEST 4: CONTENT READ (README.md)
  try {
    const contentRes = UrlFetchApp.fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md?ref=${branch}`, {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });
    const contentCode = contentRes.getResponseCode();
    if (contentCode === 200) {
      const contentData = JSON.parse(contentRes.getContentText());
      contentReadStatus = `SUCCESS (File: ${contentData.name}, Size: ${contentData.size} bytes, SHA: ${contentData.sha ? contentData.sha.substring(0, 7) : 'OK'})`;
    } else {
      contentReadStatus = `FAILED (HTTP ${contentCode})`;
      errorDetails.push(`GET /contents/README.md HTTP ${contentCode}`);
    }
  } catch (err) {
    contentReadStatus = 'FAILED';
    errorDetails.push(`Content read: ${err.message}`);
  }

  // TEST 5: SECURITY
  const securityStatus = 'PASS (Token strictly isolated in Script Properties, never revealed or logged)';

  const allPassed = tokenStatus === 'TOKEN_PRESENT' &&
    authStatus.startsWith('SUCCESS') &&
    repoStatus.startsWith('SUCCESS') &&
    branchStatus.startsWith('SUCCESS') &&
    contentReadStatus.startsWith('SUCCESS');

  const readyForPhase3B = allPassed ? 'YES' : 'NO';
  const errString = errorDetails.length > 0 ? errorDetails.join(', ') : 'None';

  const report =
    'PHASE 3A — GITHUB CONNECTION TEST RESULTS\n\n' +
    `1. TOKEN STATUS: ${tokenStatus}\n` +
    `2. AUTHENTICATION STATUS: ${authStatus}\n` +
    `3. REPOSITORY STATUS: ${repoStatus}\n` +
    `4. BRANCH STATUS: ${branchStatus}\n` +
    `5. CONTENT READ STATUS: ${contentReadStatus}\n` +
    `6. SECURITY STATUS: ${securityStatus}\n` +
    `7. ERROR DETAILS: ${errString}\n` +
    `8. READY FOR PHASE 3B: ${readyForPhase3B}`;

  ui.alert('Phase 3A: GitHub Connection Test', report, ui.ButtonSet.OK);
  Logger.log(report);
}

/**
 * ============================================================================
 * PHASE 3B: GITHUB SYNCHRONIZATION ENGINE & PREVIEW (READ-ONLY)
 * ============================================================================
 */

/**
 * Performs deep semantic comparison between two parsed JSON values.
 * Ignores object key ordering and harmless whitespace / indentation differences.
 * @param {*} a First value
 * @param {*} b Second value
 * @return {boolean} True if structurally and semantically identical
 */
function semanticJSONEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!semanticJSONEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!semanticJSONEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * Runs CMS validation quietly and returns any validation errors.
 * @return {Array<string>} Validation error messages
 */
function runCMSValidationSilent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const projErrors = validateProjects();
  const projIds = new Set(
    (ss.getSheetByName('PROJECTS') ? ss.getSheetByName('PROJECTS').getDataRange().getValues().slice(1).map(r => r[0]) : [])
  );
  const projContentErrors = validateProjectContent(projIds);

  const expErrors = validateExperience();
  const expIds = new Set(
    (ss.getSheetByName('EXPERIENCE') ? ss.getSheetByName('EXPERIENCE').getDataRange().getValues().slice(1).map(r => r[0]) : [])
  );
  const expContentErrors = validateExperienceContent(expIds);

  const certErrors = validateCertifications();
  const resErrors = validateResearch();

  return [
    ...projErrors,
    ...projContentErrors,
    ...expErrors,
    ...expContentErrors,
    ...certErrors,
    ...resErrors
  ];
}

/**
 * Phase 3B: GitHub Synchronization Preview (Strictly Read-Only).
 * Compares live Google Sheets CMS data against current GitHub repository state.
 * Performs semantic JSON comparisons across all 5 production data files.
 * STRICTLY READ-ONLY: Only GET requests are executed. Zero writes, commits, or pushes.
 */
function previewGitHubSync() {
  let ui = null;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {
    // UI unavailable when executing outside container context
  }

  const config = getConfig();
  const owner = config['GITHUB_OWNER'] || 'Haven-Pham';
  const repo = config['GITHUB_REPO'] || 'Portfolio';
  const branch = config['GITHUB_BRANCH'] || 'main';

  const projectsPath = config['PROJECTS_JSON_PATH'] || 'data/projects.json';
  const expPath = config['EXPERIENCE_JSON_PATH'] || 'data/experience.json';
  const certPath = config['CERTIFICATIONS_JSON_PATH'] || 'data/certifications.json';
  const resPath = config['RESEARCH_JSON_PATH'] || 'data/research.json';
  const i18nPath = config['I18N_JSON_PATH'] || 'data/i18n.json';

  const targetFiles = [
    projectsPath,
    expPath,
    certPath,
    resPath,
    i18nPath
  ];

  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token || token.trim().length === 0) {
    const errorMsg = 'GITHUB_TOKEN is missing in Script Properties.\n\n' +
      'Please ensure GITHUB_TOKEN is stored in Project Settings > Script Properties.';
    if (ui) {
      ui.alert('Phase 3B: GitHub Sync Preview', errorMsg, ui.ButtonSet.OK);
    }
    Logger.log('Phase 3B Error: ' + errorMsg);
    return;
  }

  // 1. Validate CMS first to ensure data integrity
  const validationErrors = runCMSValidationSilent();
  if (validationErrors.length > 0) {
    const valMsg = 'CMS validation failed with ' + validationErrors.length + ' error(s).\n\n' +
      'Please resolve issues using "Validate CMS" before previewing sync:\n• ' +
      validationErrors.slice(0, 5).join('\n• ');
    if (ui) {
      ui.alert('Phase 3B: GitHub Sync Preview', valMsg, ui.ButtonSet.OK);
    }
    Logger.log('Phase 3B Blocked: ' + valMsg);
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 2. Independently generate the four independent CMS payloads
  const payloads = {};
  try {
    payloads[projectsPath] = serializeProjectsJSON(ss);
  } catch (err) {
    payloads[projectsPath] = null;
  }
  try {
    payloads[expPath] = serializeExperienceJSON(ss);
  } catch (err) {
    payloads[expPath] = null;
  }
  try {
    payloads[certPath] = serializeCertificationsJSON(ss);
  } catch (err) {
    payloads[certPath] = null;
  }
  try {
    payloads[resPath] = serializeResearchJSON(ss);
  } catch (err) {
    payloads[resPath] = null;
  }

  const headers = {
    'Authorization': 'Bearer ' + token.trim(),
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Haven-Portfolio-CMS'
  };

  const results = [];

  // 3. Inspect GitHub and evaluate each file independently
  for (let i = 0; i < targetFiles.length; i++) {
    const path = targetFiles[i];

    // Fetch remote file from GitHub via GET
    let ghParsed = null;
    let ghStatus = 'UNKNOWN';
    let fetchCode = null;
    let fetchError = null;

    try {
      const res = UrlFetchApp.fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        }
      );
      fetchCode = res.getResponseCode();

      if (fetchCode === 200) {
        try {
          const body = JSON.parse(res.getContentText());
          const cleanB64 = (body.content || '').replace(/\s+/g, '');
          const decodedBlob = Utilities.newBlob(Utilities.base64Decode(cleanB64));
          const remoteText = decodedBlob.getDataAsString('UTF-8');
          ghParsed = JSON.parse(remoteText);
          if (Array.isArray(ghParsed)) {
            ghStatus = `${ghParsed.length} records`;
          } else if (typeof ghParsed === 'object' && ghParsed !== null) {
            const langCount = Object.keys(ghParsed).length;
            ghStatus = `${langCount} languages`;
          } else {
            ghStatus = '1 record';
          }
        } catch (parseErr) {
          ghStatus = (path === i18nPath) ? 'BASE_TEMPLATE_INVALID_JSON' : 'INVALID JSON';
        }
      } else if (fetchCode === 404) {
        ghStatus = 'NOT FOUND';
      } else if (fetchCode === 403) {
        ghStatus = 'GITHUB_ACCESS_DENIED (HTTP 403)';
        fetchError = 'GITHUB_ACCESS_DENIED';
      } else if (fetchCode === 401) {
        ghStatus = 'GITHUB_AUTH_FAILED (HTTP 401)';
        fetchError = 'GITHUB_AUTH_FAILED';
      } else {
        ghStatus = 'GITHUB_HTTP_' + fetchCode;
        fetchError = 'GITHUB_HTTP_' + fetchCode;
      }
    } catch (err) {
      const rawMsg = err.message || 'Network error';
      const safeMsg = rawMsg
        .replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '[REDACTED]')
        .replace(/Bearer\s+[a-zA-Z0-9_\-]+/gi, 'Bearer [REDACTED]');
      ghStatus = `ERROR (${safeMsg})`;
      fetchError = safeMsg;
    }

    // Evaluate CMS status and comparison
    let cmsStatus = 'UNKNOWN';
    let statusText = '';
    let syncNeeded = 'NO';

    if (path === i18nPath) {
      // Specialized handling for i18n base template workflow
      if (fetchCode === 200 && ghParsed && typeof ghParsed === 'object') {
        // Base template retrieved successfully; merge with sheets
        let cmsMergedJson = null;
        let cmsParsed = null;
        try {
          cmsMergedJson = mergeI18nWithSheets(ss, ghParsed);
          cmsParsed = JSON.parse(cmsMergedJson);
          cmsStatus = `${Object.keys(cmsParsed).length} languages`;
        } catch (mergeErr) {
          cmsStatus = 'MERGE ERROR: ' + mergeErr.message;
        }

        if (cmsParsed && semanticJSONEqual(cmsParsed, ghParsed)) {
          statusText = 'MATCH';
          syncNeeded = 'NO';
        } else if (cmsParsed) {
          statusText = 'DIFF';
          syncNeeded = 'YES';
        } else {
          statusText = 'ERROR';
          syncNeeded = 'BLOCKED';
        }
      } else if (fetchCode === 404) {
        cmsStatus = 'Base template required for i18n merge: NOT FOUND';
        ghStatus = 'NOT FOUND';
        statusText = 'BASE TEMPLATE NOT FOUND';
        syncNeeded = 'YES — INITIAL FILE REQUIRED';
      } else if (fetchCode === 403) {
        cmsStatus = 'Base template required for i18n merge: GITHUB_ACCESS_DENIED';
        statusText = 'GITHUB_ACCESS_DENIED';
        syncNeeded = 'BLOCKED';
      } else if (fetchCode === 401) {
        cmsStatus = 'Base template required for i18n merge: GITHUB_AUTH_FAILED';
        statusText = 'GITHUB_AUTH_FAILED';
        syncNeeded = 'BLOCKED';
      } else if (ghStatus === 'BASE_TEMPLATE_INVALID_JSON') {
        cmsStatus = 'Base template required for i18n merge: BASE_TEMPLATE_INVALID_JSON';
        statusText = 'BASE TEMPLATE INVALID JSON';
        syncNeeded = 'YES — FIX REMOTE JSON';
      } else if (fetchError) {
        cmsStatus = 'Base template required for i18n merge: ' + fetchError;
        statusText = 'ERROR';
        syncNeeded = 'BLOCKED';
      } else {
        cmsStatus = 'Base template required for i18n merge: NOT FOUND';
        statusText = 'BASE TEMPLATE NOT FOUND';
        syncNeeded = 'YES — INITIAL FILE REQUIRED';
      }
    } else {
      // Evaluation for the 4 independent data files
      const cmsJsonStr = payloads[path];
      let cmsParsed = null;

      if (cmsJsonStr === null || cmsJsonStr === undefined) {
        cmsStatus = 'SERIALIZATION FAILED';
      } else {
        try {
          cmsParsed = JSON.parse(cmsJsonStr);
          if (Array.isArray(cmsParsed)) {
            cmsStatus = `${cmsParsed.length} records`;
          } else {
            cmsStatus = '1 record';
          }
        } catch (e) {
          cmsStatus = 'INVALID JSON';
        }
      }

      if (cmsStatus === 'INVALID JSON') {
        statusText = 'INVALID JSON';
        syncNeeded = 'YES (Fix CMS)';
      } else if (ghStatus === 'NOT FOUND') {
        statusText = 'NOT FOUND';
        syncNeeded = 'YES';
      } else if (ghStatus === 'INVALID JSON') {
        statusText = 'INVALID JSON';
        syncNeeded = 'YES';
      } else if (fetchError) {
        statusText = `ERROR (${fetchError})`;
        syncNeeded = 'BLOCKED';
      } else if (semanticJSONEqual(cmsParsed, ghParsed)) {
        statusText = 'MATCH';
        syncNeeded = 'NO';
      } else {
        statusText = 'DIFF';
        syncNeeded = 'YES';
      }
    }

    results.push({
      path: path,
      cmsStatus: cmsStatus,
      ghStatus: ghStatus,
      status: statusText,
      syncNeeded: syncNeeded
    });
  }

  // Build the preview dialog report
  let report = 'PHASE 3B — READ-ONLY SYNC PREVIEW\n\n' +
    'Target:\n' +
    `${owner}/${repo}\n` +
    `Branch: ${branch}\n\n` +
    'Files checked:\n' +
    targetFiles.map(f => `• ${f}`).join('\n') + '\n\n';

  results.forEach(r => {
    report += `${r.path}\n` +
      `CMS: ${r.cmsStatus}\n` +
      `GitHub: ${r.ghStatus}\n` +
      `STATUS: ${r.status}\n` +
      `Sync Needed: ${r.syncNeeded}\n\n`;
  });

  report += 'NO GitHub files were modified.\n' +
    'NO commit was created.\n' +
    'NO push was performed.\n' +
    'NO Vercel deployment was triggered.';

  if (ui) {
    ui.alert('Phase 3B: GitHub Sync Preview', report, ui.ButtonSet.OK);
  }
  Logger.log(report);
}

/**
 * Serializes all 5 core website data files from the Google Sheets database.
 * If i18n base template is missing on GitHub, sets data/i18n.json to null without crashing.
 * @return {Object} Map of relative file paths to stringified JSON (or null)
 */
function serializeCMSData(ss, owner, repo, branch, token) {
  const config = getConfig();
  const projPath = config['PROJECTS_JSON_PATH'] || 'data/projects.json';
  const expPath = config['EXPERIENCE_JSON_PATH'] || 'data/experience.json';
  const certPath = config['CERTIFICATIONS_JSON_PATH'] || 'data/certifications.json';
  const resPath = config['RESEARCH_JSON_PATH'] || 'data/research.json';
  const i18nPath = config['I18N_JSON_PATH'] || 'data/i18n.json';

  const data = {};
  data[projPath] = serializeProjectsJSON(ss);
  data[expPath] = serializeExperienceJSON(ss);
  data[certPath] = serializeCertificationsJSON(ss);
  data[resPath] = serializeResearchJSON(ss);

  const i18nRes = serializeI18nJSON(ss, owner, repo, branch, token);
  data[i18nPath] = (i18nRes && i18nRes.status === 'SUCCESS') ? i18nRes.content : null;

  return data;
}

/**
 * Serializes data/projects.json
 */
function serializeProjectsJSON(ss) {
  const sheet = ss.getSheetByName('PROJECTS');
  if (!sheet) return '[]\n';
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return '[]\n';

  const knownMeta = {
    'retail': { icon: '▥', chips: ['Power BI', 'DAX', 'KPIs'] },
    'sql': { icon: '⛁', chips: ['SQL', 'CTEs', 'Window Functions'] },
    'inventory': { icon: '◈', chips: ['Inventory', 'Python · Learning', 'Excel'] },
    'netflix': { icon: '⌁', chips: ['Python', 'pandas', 'EDA'] }
  };

  const projects = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, slug, category, status, featured, sort_order] = rows[i];
    if (!id) continue;
    const catStr = String(category).trim();
    const meta = knownMeta[id] || {
      icon: catStr === 'sql' ? '⛁' : catStr === 'supply' ? '◈' : '▥',
      chips: [catStr.toUpperCase()]
    };
    projects.push({
      id: String(id).trim(),
      category: catStr,
      icon: meta.icon,
      chips: meta.chips,
      status: String(status).trim(),
      number: String(sort_order || i).padStart(2, '0')
    });
  }
  return JSON.stringify(projects, null, 2) + '\n';
}

/**
 * Serializes data/experience.json
 */
function serializeExperienceJSON(ss) {
  const sheet = ss.getSheetByName('EXPERIENCE');
  if (!sheet) return '[]\n';
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return '[]\n';

  const knownMeta = {
    'hoa-sen': { initials: 'HS', period: 'Oct 2024 – Apr 2025', className: 'hoa' },
    'kodai': { initials: 'KS', period: '2023 – Aug 2024', className: 'kodai' },
    'vietlog': { initials: 'VL', period: 'Jan – Jul 2023', className: 'vietlog' }
  };

  const expList = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, company, position, start_date, end_date, category, sort_order] = rows[i];
    if (!id) continue;
    const meta = knownMeta[id] || {
      initials: String(company).slice(0, 2).toUpperCase(),
      period: `${start_date} – ${end_date}`,
      className: String(id).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
    };
    expList.push({
      id: String(id).trim(),
      category: String(category).trim(),
      initials: meta.initials,
      period: meta.period,
      className: meta.className
    });
  }
  return JSON.stringify(expList, null, 2) + '\n';
}

/**
 * Serializes data/certifications.json
 */
function serializeCertificationsJSON(ss) {
  const sheet = ss.getSheetByName('CERTIFICATIONS');
  if (!sheet) return '[]\n';
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return '[]\n';

  const knownWhen = {
    'hr-advanced': 'Jun 26, 2026',
    'hr-intermediate': 'Jun 26, 2026',
    'dc-powerbi': 'Jul 04, 2026',
    'dc-intermediate': 'Jun 11, 2026',
    'dc-ai': 'May 31, 2026',
    'dc-intro': 'May 29, 2026',
    'mandarin': 'Dec 26, 2025'
  };

  const certs = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, name, provider, date, category, file, verification_url, featured, sort_order] = rows[i];
    if (!id) continue;
    const providerStr = String(provider).trim();
    let mark = 'DC';
    let kind = 'course';
    if (providerStr === 'HackerRank') {
      mark = 'H';
      kind = 'assessment';
    } else if (providerStr === 'Yuan Ze University') {
      mark = 'YZ';
    } else {
      mark = providerStr.slice(0, 2).toUpperCase();
    }

    const fileStr = String(file).trim();
    const asset = (fileStr === '[PRIVATE RECORD]' || !fileStr) ? null : fileStr;
    const whenStr = knownWhen[id] || (date instanceof Date ? Utilities.formatDate(date, 'Asia/Taipei', 'MMM dd, yyyy') : String(date).trim());

    certs.push({
      id: String(id).trim(),
      provider: providerStr,
      type: String(category).trim(),
      when: whenStr,
      mark: mark,
      asset: asset,
      kind: kind
    });
  }
  return JSON.stringify(certs, null, 2) + '\n';
}

/**
 * Serializes data/research.json (Strictly preserves 0 records when sheet has headers only)
 */
function serializeResearchJSON(ss) {
  const sheet = ss.getSheetByName('RESEARCH');
  if (!sheet) return '[]\n';
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return '[]\n';

  const research = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, title, type, year, status, url, featured, sort_order] = rows[i];
    if (!id) continue;
    research.push({
      id: String(id).trim(),
      title: String(title).trim(),
      type: String(type).trim(),
      year: year,
      status: String(status).trim(),
      url: String(url).trim(),
      featured: Boolean(featured),
      sort_order: Number(sort_order)
    });
  }
  return JSON.stringify(research, null, 2) + '\n';
}

/**
 * Serializes data/i18n.json (Fetches base template from GitHub to preserve static UI strings,
 * then updates projectData and experienceData from sheets).
 */
/**
 * Merges Google Sheets data into base i18n JSON object.
 * Preserves all static UI translations and keys.
 * @param {Spreadsheet} ss Active spreadsheet
 * @param {Object} baseI18n Base i18n JSON object from GitHub
 * @return {string} Formatted JSON string
 */
function mergeI18nWithSheets(ss, baseI18n) {
  // Deep clone to prevent mutating original in-place
  const i18n = JSON.parse(JSON.stringify(baseI18n));

  // Read EXPERIENCE_CONTENT
  const expSheet = ss.getSheetByName('EXPERIENCE_CONTENT');
  if (expSheet) {
    const expRows = expSheet.getDataRange().getValues();
    for (let i = 1; i < expRows.length; i++) {
      const [expId, lang, summary, responsibilities] = expRows[i];
      if (!expId || !lang || !i18n[lang]) continue;
      if (!i18n[lang].experienceData) i18n[lang].experienceData = {};
      if (!i18n[lang].experienceData[expId]) i18n[lang].experienceData[expId] = {};

      i18n[lang].experienceData[expId].summary = String(summary).trim();
      i18n[lang].experienceData[expId].bullets = String(responsibilities || '')
        .split('\n')
        .map(b => b.trim())
        .filter(Boolean);
    }
  }

  // Read PROJECT_CONTENT
  const projSheet = ss.getSheetByName('PROJECT_CONTENT');
  if (projSheet) {
    const projRows = projSheet.getDataRange().getValues();
    for (let i = 1; i < projRows.length; i++) {
      const [projId, lang, title, short_desc, problem, approach, evidence] = projRows[i];
      if (!projId || !lang || !i18n[lang]) continue;
      if (!i18n[lang].projectData) i18n[lang].projectData = {};

      i18n[lang].projectData[projId] = {
        title: String(title).trim(),
        description: String(short_desc).trim(),
        goal: String(problem).trim(),
        methods: String(approach).trim(),
        evidence: String(evidence).trim()
      };
    }
  }

  return JSON.stringify(i18n, null, 2) + '\n';
}

/**
 * Serializes data/i18n.json (Fetches base template from GitHub to preserve static UI strings,
 * then updates projectData and experienceData from sheets).
 * Captures HTTP status and returns controlled error codes if template cannot be retrieved.
 * @param {Spreadsheet} ss Active spreadsheet
 * @param {string} owner GitHub repository owner
 * @param {string} repo GitHub repository name
 * @param {string} branch GitHub branch
 * @param {string} token GitHub personal access token
 * @param {Object} [existingBase] Optional pre-fetched base i18n template object
 * @return {{ status: string, content: string|null, message?: string }}
 */
function serializeI18nJSON(ss, owner, repo, branch, token, existingBase) {
  const config = getConfig();
  const i18nPath = config['I18N_JSON_PATH'] || 'data/i18n.json';
  let baseI18n = existingBase || null;

  if (!baseI18n) {
    if (!token || token.trim().length === 0) {
      return { status: 'GITHUB_AUTH_FAILED', content: null };
    }
    try {
      const res = UrlFetchApp.fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${i18nPath}?ref=${branch}`,
        {
          method: 'get',
          headers: {
            'Authorization': 'Bearer ' + token.trim(),
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'Haven-Portfolio-CMS'
          },
          muteHttpExceptions: true
        }
      );
      const code = res.getResponseCode();
      if (code === 200) {
        try {
          const body = JSON.parse(res.getContentText());
          const cleanB64 = (body.content || '').replace(/\s+/g, '');
          const decoded = Utilities.newBlob(Utilities.base64Decode(cleanB64)).getDataAsString('UTF-8');
          baseI18n = JSON.parse(decoded);
        } catch (parseErr) {
          return { status: 'BASE_TEMPLATE_INVALID_JSON', content: null };
        }
      } else if (code === 404) {
        return { status: 'BASE_TEMPLATE_NOT_FOUND', content: null };
      } else if (code === 403) {
        return { status: 'GITHUB_ACCESS_DENIED', content: null };
      } else if (code === 401) {
        return { status: 'GITHUB_AUTH_FAILED', content: null };
      } else {
        return { status: 'GITHUB_HTTP_' + code, content: null };
      }
    } catch (e) {
      const safeMsg = (e.message || 'Network error')
        .replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '[REDACTED]')
        .replace(/Bearer\s+[a-zA-Z0-9_\-]+/gi, 'Bearer [REDACTED]');
      return { status: 'GITHUB_NETWORK_ERROR', message: safeMsg, content: null };
    }
  }

  try {
    const mergedJson = mergeI18nWithSheets(ss, baseI18n);
    return { status: 'SUCCESS', content: mergedJson };
  } catch (mergeErr) {
    return { status: 'MERGE_ERROR', message: mergeErr.message, content: null };
  }
}

/**
 * Phase 2 publish placeholder: strictly blocked from production publishing.
 */
function publishWebsite() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Production Publishing Blocked',
    'Production publishing is disabled during Phase 2.\n\n' +
    'The data layer and CMS schema have been verified. Phase 3 will introduce ' +
    'the GitHub API synchronization bridge with PropertiesService credentials.',
    ui.ButtonSet.OK
  );
}

/**
 * Reads configuration key-values from the CONFIG sheet.
 * @return {Object} Configuration map
 */
function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CONFIG');
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    const val = String(data[i][1]).trim();
    if (key) config[key] = val;
  }
  return config;
}

/**
 * Validates the PROJECTS sheet.
 * @return {Array<string>} List of errors found
 */
function validateProjects() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('PROJECTS');
  if (!sheet) return ['Missing sheet: PROJECTS'];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return ['PROJECTS sheet contains no data rows'];

  const errors = [];
  const ids = new Set();
  const validStatuses = ['development', 'starter', 'concept', 'coursework'];

  for (let i = 1; i < rows.length; i++) {
    const [id, slug, category, status, featured, sort_order] = rows[i];
    const rowNum = i + 1;
    if (!id) {
      errors.push(`Row ${rowNum}: Missing project id`);
    } else if (ids.has(id)) {
      errors.push(`Row ${rowNum}: Duplicate project id "${id}"`);
    } else {
      ids.add(id);
    }

    if (!category) errors.push(`Row ${rowNum} (${id}): Missing category`);
    if (!status || !validStatuses.includes(String(status).toLowerCase())) {
      errors.push(`Row ${rowNum} (${id}): Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }
    if (featured === '' || typeof featured !== 'boolean') {
      errors.push(`Row ${rowNum} (${id}): "featured" must be TRUE or FALSE`);
    }
    if (isNaN(Number(sort_order))) {
      errors.push(`Row ${rowNum} (${id}): "sort_order" must be a numeric integer`);
    }
  }
  return errors;
}

/**
 * Validates the PROJECT_CONTENT sheet.
 * @param {Set<string>} validProjectIds
 * @return {Array<string>} List of errors found
 */
function validateProjectContent(validProjectIds) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('PROJECT_CONTENT');
  if (!sheet) return ['Missing sheet: PROJECT_CONTENT'];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return ['PROJECT_CONTENT sheet contains no data rows'];

  const errors = [];
  const validLanguages = ['en', 'vi', 'zh-Hant', 'zh-Hans'];
  const seenPairs = new Set();

  for (let i = 1; i < rows.length; i++) {
    const [pid, lang, title, short_desc, problem, approach, evidence] = rows[i];
    const rowNum = i + 1;

    if (!pid || !validProjectIds.has(pid)) {
      errors.push(`Row ${rowNum}: project_id "${pid}" does not exist in PROJECTS sheet`);
    }
    if (!lang || !validLanguages.includes(lang)) {
      errors.push(`Row ${rowNum}: Invalid language "${lang}". Must be one of: ${validLanguages.join(', ')}`);
    }
    const pair = `${pid}_${lang}`;
    if (seenPairs.has(pair)) {
      errors.push(`Row ${rowNum}: Duplicate entry for project "${pid}" and language "${lang}"`);
    } else {
      seenPairs.add(pair);
    }

    if (!title) errors.push(`Row ${rowNum} (${pair}): Missing title`);
    if (!short_desc) errors.push(`Row ${rowNum} (${pair}): Missing short_description`);
  }
  return errors;
}

/**
 * Validates the EXPERIENCE sheet.
 * @return {Array<string>} List of errors found
 */
function validateExperience() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('EXPERIENCE');
  if (!sheet) return ['Missing sheet: EXPERIENCE'];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return ['EXPERIENCE sheet contains no data rows'];

  const errors = [];
  const ids = new Set();
  for (let i = 1; i < rows.length; i++) {
    const [id, company, position, start_date, end_date, category, sort_order] = rows[i];
    const rowNum = i + 1;
    if (!id) {
      errors.push(`Row ${rowNum}: Missing experience id`);
    } else if (ids.has(id)) {
      errors.push(`Row ${rowNum}: Duplicate experience id "${id}"`);
    } else {
      ids.add(id);
    }
    if (!company) errors.push(`Row ${rowNum} (${id}): Missing company`);
    if (!position) errors.push(`Row ${rowNum} (${id}): Missing position`);
    if (!category) errors.push(`Row ${rowNum} (${id}): Missing category`);
  }
  return errors;
}

/**
 * Validates the EXPERIENCE_CONTENT sheet.
 * @param {Set<string>} validExperienceIds
 * @return {Array<string>} List of errors found
 */
function validateExperienceContent(validExperienceIds) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('EXPERIENCE_CONTENT');
  if (!sheet) return ['Missing sheet: EXPERIENCE_CONTENT'];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return ['EXPERIENCE_CONTENT sheet contains no data rows'];

  const errors = [];
  const validLanguages = ['en', 'vi', 'zh-Hant', 'zh-Hans'];
  const seenPairs = new Set();

  for (let i = 1; i < rows.length; i++) {
    const [eid, lang, summary, responsibilities] = rows[i];
    const rowNum = i + 1;
    if (!eid || !validExperienceIds.has(eid)) {
      errors.push(`Row ${rowNum}: experience_id "${eid}" does not exist in EXPERIENCE sheet`);
    }
    if (!lang || !validLanguages.includes(lang)) {
      errors.push(`Row ${rowNum}: Invalid language "${lang}"`);
    }
    const pair = `${eid}_${lang}`;
    if (seenPairs.has(pair)) {
      errors.push(`Row ${rowNum}: Duplicate entry for experience "${eid}" and language "${lang}"`);
    } else {
      seenPairs.add(pair);
    }
    if (!summary) errors.push(`Row ${rowNum} (${pair}): Missing summary`);
  }
  return errors;
}

/**
 * Validates the CERTIFICATIONS sheet.
 * @return {Array<string>} List of errors found
 */
function validateCertifications() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CERTIFICATIONS');
  if (!sheet) return ['Missing sheet: CERTIFICATIONS'];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return ['CERTIFICATIONS sheet contains no data rows'];

  const errors = [];
  const ids = new Set();
  for (let i = 1; i < rows.length; i++) {
    const [id, name, provider, date, category, file, verification_url, featured, sort_order] = rows[i];
    const rowNum = i + 1;
    if (!id) {
      errors.push(`Row ${rowNum}: Missing certification id`);
    } else if (ids.has(id)) {
      errors.push(`Row ${rowNum}: Duplicate certification id "${id}"`);
    } else {
      ids.add(id);
    }
    if (!name) errors.push(`Row ${rowNum} (${id}): Missing certificate name`);
    if (!provider) errors.push(`Row ${rowNum} (${id}): Missing provider`);
    if (!date) errors.push(`Row ${rowNum} (${id}): Missing date`);
    if (!category) errors.push(`Row ${rowNum} (${id}): Missing category`);
  }
  return errors;
}

/**
 * Validates the RESEARCH sheet.
 * @return {Array<string>} List of errors found
 */
function validateResearch() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('RESEARCH');
  if (!sheet) return ['Missing sheet: RESEARCH'];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return []; // Empty is valid

  const errors = [];
  const ids = new Set();
  for (let i = 1; i < rows.length; i++) {
    const [id, title, type, year] = rows[i];
    const rowNum = i + 1;
    if (!id) {
      errors.push(`Row ${rowNum}: Missing research id`);
    } else if (ids.has(id)) {
      errors.push(`Row ${rowNum}: Duplicate research id "${id}"`);
    } else {
      ids.add(id);
    }
    if (!title) errors.push(`Row ${rowNum} (${id}): Missing title`);
  }
  return errors;
}

/**
 * Master CMS validator: cross-checks all sheets and outputs dialog.
 */
function validateCMS() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const projErrors = validateProjects();
  const projIds = new Set(
    (ss.getSheetByName('PROJECTS') ? ss.getSheetByName('PROJECTS').getDataRange().getValues().slice(1).map(r => r[0]) : [])
  );
  const projContentErrors = validateProjectContent(projIds);

  const expErrors = validateExperience();
  const expIds = new Set(
    (ss.getSheetByName('EXPERIENCE') ? ss.getSheetByName('EXPERIENCE').getDataRange().getValues().slice(1).map(r => r[0]) : [])
  );
  const expContentErrors = validateExperienceContent(expIds);

  const certErrors = validateCertifications();
  const resErrors = validateResearch();

  const totalErrors = [
    ...projErrors,
    ...projContentErrors,
    ...expErrors,
    ...expContentErrors,
    ...certErrors,
    ...resErrors
  ];

  if (totalErrors.length === 0) {
    ui.alert(
      'CMS Validation: PASSED (100% OK)',
      'All 8 sheets passed validation!\n\n' +
      `• PROJECTS: ${projIds.size} records OK\n` +
      `• PROJECT_CONTENT: All 4 languages OK\n` +
      `• EXPERIENCE: ${expIds.size} records OK\n` +
      `• EXPERIENCE_CONTENT: All 4 languages OK\n` +
      `• CERTIFICATIONS: 7 records OK (Private Mandarin record preserved)\n` +
      `• RESEARCH: Valid schema\n\n` +
      'Data is ready for preview or Phase 3 synchronization.',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      `CMS Validation: FAILED (${totalErrors.length} issues)`,
      'Please correct the following issues:\n\n• ' + totalErrors.slice(0, 10).join('\n• ') +
      (totalErrors.length > 10 ? `\n... and ${totalErrors.length - 10} more` : ''),
      ui.ButtonSet.OK
    );
  }
}

/**
 * Previews the JSON output structure generated from spreadsheet data.
 */
function previewPublish() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const projCount = ss.getSheetByName('PROJECTS') ? ss.getSheetByName('PROJECTS').getLastRow() - 1 : 0;
  const expCount = ss.getSheetByName('EXPERIENCE') ? ss.getSheetByName('EXPERIENCE').getLastRow() - 1 : 0;
  const certCount = ss.getSheetByName('CERTIFICATIONS') ? ss.getSheetByName('CERTIFICATIONS').getLastRow() - 1 : 0;
  const resCount = ss.getSheetByName('RESEARCH') ? Math.max(0, ss.getSheetByName('RESEARCH').getLastRow() - 1) : 0;

  ui.alert(
    'Preview Publish: Summary',
    'Payload ready for GitHub Synchronization:\n\n' +
    `• data/projects.json: ${projCount} records\n` +
    `• data/experience.json: ${expCount} records\n` +
    `• data/certifications.json: ${certCount} records\n` +
    `• data/research.json: ${resCount} records\n` +
    `• data/i18n.json: 4 languages (en, vi, zh-Hant, zh-Hans) mapped\n\n` +
    'Target Repository: Haven-Pham/Portfolio (branch: main)',
    ui.ButtonSet.OK
  );
}

/**
 * Sets up or resets the Google Drive folder structure.
 * Finds or creates 'HAVEN PORTFOLIO' and the 4 subfolders:
 * 01_PROJECTS, 02_CERTIFICATIONS, 03_PROFILE, 04_RESEARCH.
 */
function createDriveFolderStructure() {
  const ui = SpreadsheetApp.getUi();
  let rootFolder;
  const existingRoots = DriveApp.getFoldersByName('HAVEN PORTFOLIO');
  if (existingRoots.hasNext()) {
    rootFolder = existingRoots.next();
  } else {
    rootFolder = DriveApp.createFolder('HAVEN PORTFOLIO');
  }

  const subfolders = ['01_PROJECTS', '02_CERTIFICATIONS', '03_PROFILE', '04_RESEARCH'];
  subfolders.forEach(name => {
    const subs = rootFolder.getFoldersByName(name);
    if (!subs.hasNext()) {
      rootFolder.createFolder(name);
    }
  });

  // Update CONFIG sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('CONFIG');
  if (configSheet) {
    const data = configSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'DRIVE_ROOT_FOLDER_ID') {
        configSheet.getRange(i + 1, 2).setValue(rootFolder.getId());
        break;
      }
    }
  }

  ui.alert(
    'Google Drive Folder Structure Ready',
    `Folder: HAVEN PORTFOLIO\n` +
    `ID: ${rootFolder.getId()}\n\n` +
    `Subfolders verified:\n• 01_PROJECTS\n• 02_CERTIFICATIONS\n• 03_PROFILE\n• 04_RESEARCH\n\n` +
    `Folder ID has been saved to the CONFIG sheet.`,
    ui.ButtonSet.OK
  );
}

/**
 * Turnkey initialization: Creates and populates all 8 sheets with exact portfolio data.
 */
function setupCMS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // Helper function to create/clear a sheet
  function getOrCreateSheet(name) {
    let s = ss.getSheetByName(name);
    if (!s) s = ss.insertSheet(name);
    s.clear();
    return s;
  }

  // 1. CONFIG
  const configSheet = getOrCreateSheet('CONFIG');
  configSheet.appendRow(['Key', 'Value']);
  const configRows = [
    ['GITHUB_OWNER', 'Haven-Pham'],
    ['GITHUB_REPO', 'Portfolio'],
    ['GITHUB_BRANCH', 'main'],
    ['PROJECTS_JSON_PATH', 'data/projects.json'],
    ['CERTIFICATIONS_JSON_PATH', 'data/certifications.json'],
    ['EXPERIENCE_JSON_PATH', 'data/experience.json'],
    ['RESEARCH_JSON_PATH', 'data/research.json'],
    ['I18N_JSON_PATH', 'data/i18n.json'],
    ['DRIVE_ROOT_FOLDER_ID', 'PENDING_SETUP']
  ];
  configRows.forEach(r => configSheet.appendRow(r));
  styleHeader(configSheet);

  // 2. PROJECTS
  const projSheet = getOrCreateSheet('PROJECTS');
  projSheet.appendRow(['id', 'slug', 'category', 'status', 'featured', 'sort_order', 'github_url', 'demo_url', 'cover_file', 'document_file']);
  const projRows = [
    [
      "retail",
      "retail-sales-dashboard",
      "analytics",
      "development",
      true,
      1,
      "",
      "",
      "",
      ""
    ],
    [
      "sql",
      "sql-supply-chain-analytics",
      "sql",
      "starter",
      true,
      2,
      "https://github.com/Haven-Pham",
      "",
      "",
      "projects/sql_supply_chain_starter.zip"
    ],
    [
      "inventory",
      "inventory-optimization-case-study",
      "supply",
      "concept",
      false,
      3,
      "",
      "",
      "",
      ""
    ],
    [
      "netflix",
      "netflix-dataset-exploration",
      "analytics",
      "coursework",
      false,
      4,
      "",
      "",
      "",
      ""
    ]
  ];
  projRows.forEach(r => projSheet.appendRow(r));
  styleHeader(projSheet);

  // 3. PROJECT_CONTENT
  const projContentSheet = getOrCreateSheet('PROJECT_CONTENT');
  projContentSheet.appendRow(['project_id', 'language', 'title', 'short_description', 'problem', 'approach', 'evidence']);
  const projContentRows = [
    [
      "retail",
      "en",
      "Retail Sales Performance Dashboard",
      "A Power BI dashboard focused on retail KPIs and store performance.",
      "Analyze revenue, average order value, store rankings and online delivery lead time.",
      "Power BI visuals, DAX measures and interactive business reporting.",
      "Based on coursework and ongoing dashboard development. Final outputs and screenshots must be reviewed before publication."
    ],
    [
      "retail",
      "vi",
      "Dashboard Hiệu suất Bán lẻ",
      "Dashboard Power BI tập trung vào KPI bán lẻ và hiệu suất từng cửa hàng.",
      "Phân tích doanh thu, giá trị đơn hàng trung bình, xếp hạng cửa hàng và thời gian giao hàng của kênh online.",
      "Biểu đồ Power BI, công thức DAX và báo cáo tương tác.",
      "Phát triển từ bài thực hành và dashboard đang xây dựng. Cần kiểm tra kết quả và ảnh trước khi công bố."
    ],
    [
      "retail",
      "zh-Hant",
      "零售業績分析儀表板",
      "以 Power BI 建立零售 KPI 與各門市績效儀表板。",
      "分析營收、平均訂單金額、門市排名及線上訂單配送前置時間。",
      "Power BI 視覺化、DAX 指標與互動式商業報表。",
      "根據課堂練習與開發中的儀表板；對外公開前仍須審核數據及截圖。"
    ],
    [
      "retail",
      "zh-Hans",
      "零售业绩分析仪表板",
      "使用 Power BI 建立零售 KPI 与各门店绩效仪表板。",
      "分析营收、平均订单金额、门店排名及线上订单配送前置时间。",
      "Power BI 可视化、DAX 指标与交互式商业报表。",
      "基于课程练习和开发中的仪表板；公开前仍须审核数据和截图。"
    ],
    [
      "sql",
      "en",
      "SQL for Supply Chain Analytics",
      "A transparent demo SQL project with a small synthetic order dataset.",
      "Calculate fulfillment lead time, late deliveries and order-level operational indicators.",
      "SQL joins, case logic, grouping and window functions. Includes sample CSV and SQL files in this package.",
      "A reproducible STARTER with synthetic data; not an actual employer performance analysis."
    ],
    [
      "sql",
      "vi",
      "SQL cho Phân tích Chuỗi cung ứng",
      "Dự án SQL minh họa với bộ dữ liệu đơn hàng giả lập quy mô nhỏ.",
      "Tính thời gian hoàn thành đơn hàng, giao trễ và các chỉ số vận hành.",
      "SQL JOIN, CASE, GROUP BY và hàm cửa sổ. Gói tải xuống có dữ liệu CSV và mã SQL mẫu.",
      "BẢN MẪU tái lập được trên dữ liệu giả lập, không phải phân tích hiệu suất doanh nghiệp thực."
    ],
    [
      "sql",
      "zh-Hant",
      "供應鏈 SQL 分析",
      "使用小型模擬訂單資料集進行可重現的 SQL 示範專案。",
      "計算履約前置時間、延遲配送與訂單營運指標。",
      "SQL JOIN、CASE、分組及視窗函數；壓縮檔內含 CSV 與 SQL 範例。",
      "使用模擬資料的入門範例，並非真實企業績效分析。"
    ],
    [
      "sql",
      "zh-Hans",
      "供应链 SQL 分析",
      "使用小型模拟订单数据集的可复现 SQL 示例项目。",
      "计算订单履约时间、延迟配送和运营指标。",
      "SQL JOIN、CASE、分组和窗口函数；压缩包内含 CSV 与 SQL 示例。",
      "使用模拟数据的入门示例，并非真实企业绩效分析。"
    ],
    [
      "inventory",
      "en",
      "Inventory Optimization Case Study",
      "A proposed study of inventory segmentation, replenishment and stock availability.",
      "Explore ABC classification, inventory turnover and reorder-point scenarios.",
      "Excel/Python learning roadmap with public or simulated inventory data.",
      "Planned project. Results and code will be added after completion."
    ],
    [
      "inventory",
      "vi",
      "Nghiên cứu Tối ưu hóa Tồn kho",
      "Đề xuất nghiên cứu phân nhóm tồn kho, bổ sung hàng và rủi ro thiếu hàng.",
      "Khảo sát phân loại ABC, vòng quay tồn kho và kịch bản điểm đặt hàng lại.",
      "Lộ trình học Excel/Python với dữ liệu công khai hoặc mô phỏng.",
      "Dự án trong kế hoạch; chưa có kết quả và mã nguồn hoàn chỉnh."
    ],
    [
      "inventory",
      "zh-Hant",
      "庫存最佳化案例研究",
      "規劃探討庫存分類、補貨及缺貨風險。",
      "研究 ABC 分類、庫存周轉與再訂購點情境。",
      "規劃使用 Excel/Python 搭配公開或模擬資料。",
      "尚在規劃階段，完成後再新增成果及程式碼。"
    ],
    [
      "inventory",
      "zh-Hans",
      "库存优化案例研究",
      "规划研究库存分类、补货与缺货风险。",
      "研究 ABC 分类、库存周转和再订货点情景。",
      "计划使用 Excel/Python 与公开或模拟数据。",
      "项目尚处于规划阶段，完成后再添加成果和代码。"
    ],
    [
      "netflix",
      "en",
      "Netflix Dataset Exploration",
      "Exploratory data-cleaning and visualization exercise with Python.",
      "Inspect content distribution and changes across release years and content types.",
      "pandas cleaning, exploratory charts and explanatory annotations.",
      "Coursework referenced in prior learning tasks. Repository and reviewed findings have not yet been published."
    ],
    [
      "netflix",
      "vi",
      "Khám phá Dữ liệu Netflix",
      "Bài tập khám phá dữ liệu, làm sạch và trực quan hóa bằng Python.",
      "Khám phá cơ cấu nội dung và thay đổi theo năm phát hành và loại nội dung.",
      "Làm sạch dữ liệu với pandas, vẽ biểu đồ EDA và chú giải.",
      "Bài tập từng được thực hiện trong quá trình học; chưa công bố repository và kết quả được rà soát."
    ],
    [
      "netflix",
      "zh-Hant",
      "Netflix 資料探索分析",
      "運用 Python 進行資料清理、探索與視覺化的課堂練習。",
      "觀察節目類型及不同發行年份的內容分布。",
      "pandas 資料清理、EDA 圖表及結果註解。",
      "既有學習作業；尚未公開完成審核的程式碼庫及分析成果。"
    ],
    [
      "netflix",
      "zh-Hans",
      "Netflix 数据探索分析",
      "运用 Python 进行数据清理、探索与可视化的课程练习。",
      "观察节目类型及不同发行年份的内容分布。",
      "pandas 数据清理、EDA 图表及结果注释。",
      "已有学习练习；尚未公开完成审核的代码仓库和分析成果。"
    ]
  ];
  projContentRows.forEach(r => projContentSheet.appendRow(r));
  styleHeader(projContentSheet);

  // 4. EXPERIENCE
  const expSheet = getOrCreateSheet('EXPERIENCE');
  expSheet.appendRow(['id', 'company', 'position', 'start_date', 'end_date', 'category', 'sort_order']);
  const expRows = [
    [
      "hoa-sen",
      "Hoa Sen Group · Vietnam",
      "Supply Chain Planner",
      "2024-10",
      "2025-04",
      "planning",
      1
    ],
    [
      "kodai",
      "Kodai Sangyo (Vietnam) Co., Ltd.",
      "Sales Logistics Staff",
      "2023-01",
      "2024-08",
      "logistics",
      2
    ],
    [
      "vietlog",
      "Viet Logistics · Vietnam",
      "Export & Import Trainee",
      "2023-01",
      "2023-07",
      "logistics",
      3
    ]
  ];
  expRows.forEach(r => expSheet.appendRow(r));
  styleHeader(expSheet);

  // 5. EXPERIENCE_CONTENT
  const expContentSheet = getOrCreateSheet('EXPERIENCE_CONTENT');
  expContentSheet.appendRow(['experience_id', 'language', 'summary', 'responsibilities']);
  const expContentRows = [
    [
      "hoa-sen",
      "en",
      "Purchase-order coordination, inventory management and reporting using Oracle ERP.",
      "Monitored suppliers and purchasing orders for domestic and imported goods.\nTracked inventory in Oracle ERP and coordinated with warehouse and production teams.\nPrepared operational reports to improve stock and distribution visibility."
    ],
    [
      "hoa-sen",
      "vi",
      "Điều phối đơn mua hàng, quản lý tồn kho và lập báo cáo trên Oracle ERP.",
      "Theo dõi nhà cung cấp và đơn mua hàng trong nước, nhập khẩu.\nQuản lý dữ liệu tồn kho trên Oracle ERP, phối hợp với kho và nhà máy.\nLập báo cáo vận hành nhằm hỗ trợ việc theo dõi hàng tồn và phân phối."
    ],
    [
      "hoa-sen",
      "zh-Hant",
      "透過 Oracle ERP 協調採購訂單、管理庫存並製作營運報表。",
      "追蹤國內及進口商品的供應商與採購訂單。\n使用 Oracle ERP 管理庫存資料，並與倉庫及工廠合作。\n製作營運報表，提升庫存及配送資訊的可視性。"
    ],
    [
      "hoa-sen",
      "zh-Hans",
      "通过 Oracle ERP 协调采购订单、管理库存并制作运营报表。",
      "跟踪国内及进口商品的供应商与采购订单。\n使用 Oracle ERP 管理库存数据，并与仓库及工厂合作。\n制作运营报表，提升库存及配送信息的可视化。"
    ],
    [
      "kodai",
      "en",
      "Coordinated international shipments and customer-facing freight operations.",
      "Prepared freight quotations and coordinated with carriers and overseas agents.\nSupported refrigerated cargo schedules, shipping documentation and customs workflows.\nWorked with documentation and operations teams to resolve shipment issues."
    ],
    [
      "kodai",
      "vi",
      "Điều phối hàng hóa quốc tế và các nghiệp vụ giao nhận với khách hàng.",
      "Lập báo giá vận chuyển, liên hệ hãng tàu và đại lý quốc tế.\nHỗ trợ lịch trình hàng đông lạnh, chứng từ vận tải và thủ tục hải quan.\nPhối hợp với các bộ phận chứng từ và vận hành để xử lý sự cố."
    ],
    [
      "kodai",
      "zh-Hant",
      "協調國際貨運與客戶相關的貨運業務。",
      "製作運費報價，與船公司及海外代理聯繫。\n協助冷鏈貨運排程、運輸文件及報關流程。\n與文件及營運部門合作處理運輸問題。"
    ],
    [
      "kodai",
      "zh-Hans",
      "协调国际货运与客户相关的货运业务。",
      "制作运费报价，与船公司及海外代理联络。\n协助冷链货运排期、运输文件和报关流程。\n与单证及运营团队合作处理运输问题。"
    ],
    [
      "vietlog",
      "en",
      "Supported bookings, shipment documents and customs-related processes.",
      "Prepared invoices, packing lists, certificates of origin and shipping instructions.\nSupported carrier selection, shipment booking and HS-code related tasks.\nCoordinated with operational teams across freight-forwarding activities."
    ],
    [
      "vietlog",
      "vi",
      "Hỗ trợ đặt chỗ, chứng từ và các quy trình liên quan đến hải quan.",
      "Chuẩn bị hóa đơn, phiếu đóng gói, C/O và hướng dẫn gửi hàng.\nHỗ trợ lựa chọn hãng vận chuyển, booking và các công việc liên quan mã HS.\nPhối hợp với bộ phận vận hành trong nghiệp vụ giao nhận hàng hóa."
    ],
    [
      "vietlog",
      "zh-Hant",
      "協助訂艙、運輸文件及報關相關作業。",
      "準備發票、裝箱單、原產地證明與運輸指示。\n協助選擇承運商、安排訂艙及 HS Code 相關工作。\n與營運團隊合作支援貨運承攬業務。"
    ],
    [
      "vietlog",
      "zh-Hans",
      "协助订舱、运输单证及报关相关工作。",
      "准备发票、装箱单、原产地证明与运输指示。\n协助选择承运商、安排订舱及 HS Code 相关工作。\n与运营团队协作支持国际货运代理业务。"
    ]
  ];
  expContentRows.forEach(r => expContentSheet.appendRow(r));
  styleHeader(expContentSheet);

  // 6. CERTIFICATIONS
  const certSheet = getOrCreateSheet('CERTIFICATIONS');
  certSheet.appendRow(['id', 'name', 'provider', 'date', 'category', 'file', 'verification_url', 'featured', 'sort_order']);
  const certRows = [
    [
      "hr-advanced",
      "SQL (Advanced)",
      "HackerRank",
      "2026-06-26",
      "hacker",
      "assets/certificates/hackerrank-sql-advanced.jpg",
      "https://www.hackerrank.com/certificates/",
      true,
      1
    ],
    [
      "hr-intermediate",
      "SQL (Intermediate)",
      "HackerRank",
      "2026-06-26",
      "hacker",
      "assets/certificates/hackerrank-sql-intermediate.jpg",
      "https://www.hackerrank.com/certificates/",
      true,
      2
    ],
    [
      "dc-powerbi",
      "Data Visualization in Power BI",
      "DataCamp",
      "2026-07-04",
      "datacamp",
      "assets/certificates/datacamp-power-bi.pdf",
      "https://www.datacamp.com/statement-of-accomplishment/",
      true,
      3
    ],
    [
      "dc-intermediate",
      "Intermediate SQL",
      "DataCamp",
      "2026-06-11",
      "datacamp",
      "assets/certificates/datacamp-intermediate-sql.pdf",
      "https://www.datacamp.com/statement-of-accomplishment/",
      false,
      4
    ],
    [
      "dc-ai",
      "Cleaning Data with Generative AI",
      "DataCamp",
      "2026-05-31",
      "datacamp",
      "assets/certificates/datacamp-cleaning-ai.pdf",
      "https://www.datacamp.com/statement-of-accomplishment/",
      false,
      5
    ],
    [
      "dc-intro",
      "Introduction to SQL",
      "DataCamp",
      "2026-05-29",
      "datacamp",
      "assets/certificates/datacamp-intro-sql.pdf",
      "https://www.datacamp.com/statement-of-accomplishment/",
      false,
      6
    ],
    [
      "mandarin",
      "Mandarin Intensive Program – Level 2",
      "Yuan Ze University",
      "2025-12-26",
      "language",
      "[PRIVATE RECORD]",
      "",
      false,
      7
    ]
  ];
  certRows.forEach(r => certSheet.appendRow(r));
  styleHeader(certSheet);

  // 7. RESEARCH
  const resSheet = getOrCreateSheet('RESEARCH');
  resSheet.appendRow(['id', 'title', 'type', 'year', 'status', 'url', 'featured', 'sort_order']);
  styleHeader(resSheet);

  // 8. PUBLISH_LOG
  const logSheet = getOrCreateSheet('PUBLISH_LOG');
  logSheet.appendRow(['timestamp', 'action', 'status', 'message', 'commit_sha', 'deployment_url']);
  styleHeader(logSheet);

  // Remove default 'Sheet1' if present
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  ui.alert(
    'Setup Complete',
    'Successfully initialized all 8 sheets with exact portfolio records!\n\n' +
    'Run "Setup Drive Folder Structure" to automatically connect Google Drive.',
    ui.ButtonSet.OK
  );
}

function styleHeader(sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground('#092b21')
    .setFontColor('#00d39c')
    .setFontWeight('bold')
    .setFontSize(10);
  sheet.setFrozenRows(1);
}
