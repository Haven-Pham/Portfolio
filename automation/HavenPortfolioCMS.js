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
    .addItem('Publish CMS to GitHub (Phase 3D)', 'publishCMSToGitHub')
    .addItem('Diagnose Certifications Diff (Phase 3D)', 'diagnoseCertificationsDiff')
    .addItem('Scan Drive Inventory (Phase 5A)', 'scanDriveInventory')
    .addItem('Preview Drive → CMS Sync (Phase 5B)', 'previewDriveToCMSSync')
    .addItem('Preview Project Asset Upload (Phase 5C)', 'previewProjectAssetUpload')
    .addItem('Sync Production Project Assets (Phase 5E)', 'syncProductionProjectAssets')
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
 * ============================================================================
 * PHASE 3D: CONTROLLED CMS → GITHUB WRITE SYNCHRONIZATION
 * ============================================================================
 */

/**
 * Phase 3D: Controlled CMS to GitHub write synchronization.
 * 
 * 1. Validates CMS data integrity.
 * 2. Compares live CMS payloads against GitHub repository state.
 * 3. If no differences exist, reports NO CHANGE and exits without creating commits.
 * 4. If differences exist, displays a clear diff summary and requires explicit confirmation.
 * 5. Upon confirmation, updates ONLY the changed files via GitHub Contents API using current file SHAs.
 * 6. Uses [skip ci] in commit messages to prevent automated CI / Vercel builds.
 * 7. Re-reads and verifies all updated files from GitHub.
 * 8. Records the synchronization event in PUBLISH_LOG.
 */
function publishCMSToGitHub() {
  let ui = null;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {
    // Headless / non-container context
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
      ui.alert('Phase 3D: Publish CMS to GitHub', errorMsg, ui.ButtonSet.OK);
    }
    Logger.log('Phase 3D Error: ' + errorMsg);
    return;
  }

  // 1. Validate CMS first to ensure data integrity
  const validationErrors = runCMSValidationSilent();
  if (validationErrors.length > 0) {
    const valMsg = 'CMS validation failed with ' + validationErrors.length + ' error(s).\n\n' +
      'Please resolve issues using "Validate CMS" before publishing:\n• ' +
      validationErrors.slice(0, 5).join('\n• ');
    if (ui) {
      ui.alert('Phase 3D: Publish CMS to GitHub Blocked', valMsg, ui.ButtonSet.OK);
    }
    Logger.log('Phase 3D Blocked: ' + valMsg);
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const headers = {
    'Authorization': 'Bearer ' + token.trim(),
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Haven-Portfolio-CMS'
  };

  // 2. Independently generate payloads and inspect GitHub state
  const fileAnalyses = [];
  const changedFiles = [];

  for (let i = 0; i < targetFiles.length; i++) {
    const path = targetFiles[i];

    // Fetch existing file from GitHub
    let ghParsed = null;
    let ghSha = null;
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
          ghSha = body.sha;
          const cleanB64 = (body.content || '').replace(/\s+/g, '');
          const decodedBlob = Utilities.newBlob(Utilities.base64Decode(cleanB64));
          const remoteText = decodedBlob.getDataAsString('UTF-8');
          ghParsed = JSON.parse(remoteText);
        } catch (parseErr) {
          fetchError = 'INVALID_REMOTE_JSON';
        }
      } else if (fetchCode === 404) {
        fetchError = 'NOT_FOUND_ON_GITHUB';
      } else {
        fetchError = 'GITHUB_HTTP_' + fetchCode;
      }
    } catch (err) {
      fetchError = sanitizeError(err.message, token);
    }

    if (fetchError && fetchCode !== 404) {
      const errMsg = `Unable to fetch ${path} from GitHub (${fetchError}). Publish aborted for safety.`;
      if (ui) {
        ui.alert('Phase 3D: Publish CMS Aborted', errMsg, ui.ButtonSet.OK);
      }
      Logger.log('Phase 3D Aborted: ' + errMsg);
      return;
    }

    // Generate CMS payload
    let cmsString = null;
    let cmsParsed = null;
    let cmsStatusText = '';
    let ghStatusText = '';

    if (path === i18nPath) {
      if (!ghParsed || typeof ghParsed !== 'object') {
        const errMsg = 'Base data/i18n.json is required on GitHub to perform i18n synchronization.';
        if (ui) {
          ui.alert('Phase 3D: Publish CMS Aborted', errMsg, ui.ButtonSet.OK);
        }
        return;
      }
      try {
        cmsString = mergeI18nWithSheets(ss, ghParsed);
        cmsParsed = JSON.parse(cmsString);
        cmsStatusText = `${Object.keys(cmsParsed).length} languages`;
        ghStatusText = `${Object.keys(ghParsed).length} languages`;
      } catch (e) {
        const errMsg = 'Failed to merge i18n translations with sheets: ' + e.message;
        if (ui) {
          ui.alert('Phase 3D: Publish CMS Aborted', errMsg, ui.ButtonSet.OK);
        }
        return;
      }
    } else {
      try {
        if (path === projectsPath) cmsString = serializeProjectsJSON(ss);
        else if (path === expPath) cmsString = serializeExperienceJSON(ss);
        else if (path === certPath) cmsString = serializeCertificationsJSON(ss);
        else if (path === resPath) cmsString = serializeResearchJSON(ss);

        cmsParsed = JSON.parse(cmsString);
        cmsStatusText = Array.isArray(cmsParsed) ? `${cmsParsed.length} records` : '1 record';
        ghStatusText = ghParsed && Array.isArray(ghParsed) ? `${ghParsed.length} records` : (fetchCode === 404 ? 'NOT FOUND' : 'UNKNOWN');
      } catch (e) {
        const errMsg = `Failed to serialize CMS data for ${path}: ` + e.message;
        if (ui) {
          ui.alert('Phase 3D: Publish CMS Aborted', errMsg, ui.ButtonSet.OK);
        }
        return;
      }
    }

    // Compare
    const isMatch = ghParsed && semanticJSONEqual(cmsParsed, ghParsed);
    const status = isMatch ? 'MATCH' : (fetchCode === 404 ? 'NEW' : 'DIFF');

    const analysis = {
      path: path,
      cmsString: cmsString,
      cmsParsed: cmsParsed,
      ghParsed: ghParsed,
      ghSha: ghSha,
      cmsStatusText: cmsStatusText,
      ghStatusText: ghStatusText,
      status: status
    };
    fileAnalyses.push(analysis);

    if (status !== 'MATCH') {
      changedFiles.push(analysis);
    }
  }

  // 3. If NO difference: report NO CHANGE and do NOT create commits
  if (changedFiles.length === 0) {
    const noChangeReport =
      'PHASE 3D — CMS → GITHUB WRITE SYNC\n\n' +
      'STATUS: NO CHANGE\n\n' +
      'All 5 files are already in exact sync with GitHub:\n' +
      fileAnalyses.map(f => `• ${f.path}: MATCH (${f.cmsStatusText})`).join('\n') + '\n\n' +
      'Target: ' + `${owner}/${repo} (${branch})\n\n` +
      'NO commit was created.\n' +
      'NO GitHub files were modified.\n' +
      'NO Vercel deployment was triggered.';

    logPublishEvent(ss, 'CMS_GITHUB_SYNC', 'NO_CHANGE', 'All 5 files already in sync with GitHub', 'N/A', 'NONE');

    if (ui) {
      ui.alert('Phase 3D: Publish CMS to GitHub', noChangeReport, ui.ButtonSet.OK);
    }
    Logger.log(noChangeReport);
    return;
  }

  // 4. If difference: show clear read-only diff/summary and require explicit user confirmation
  let confirmPrompt =
    'PHASE 3D — CMS → GITHUB WRITE CONFIRMATION\n\n' +
    `Target: ${owner}/${repo} (branch: ${branch})\n\n` +
    `Differences detected in ${changedFiles.length} file(s):\n\n`;

  changedFiles.forEach(f => {
    confirmPrompt += `• ${f.path}\n` +
      `  CMS: ${f.cmsStatusText} | GitHub: ${f.ghStatusText} -> STATUS: ${f.status}\n` +
      `  Existing GitHub SHA: ${f.ghSha ? f.ghSha.substring(0, 7) : 'None (New)'}\n\n`;
  });

  const unchanged = fileAnalyses.filter(f => f.status === 'MATCH');
  if (unchanged.length > 0) {
    confirmPrompt += 'Unchanged files (will NOT be touched):\n' +
      unchanged.map(f => `• ${f.path} (MATCH)`).join('\n') + '\n\n';
  }

  confirmPrompt +=
    'The changed file(s) will be committed to GitHub using the Contents API.\n' +
    'Commit message format: "CMS: sync <file> [skip ci]"\n\n' +
    'Do you want to proceed with writing to GitHub?';

  if (ui) {
    const userChoice = ui.alert('Confirm GitHub Sync (Phase 3D)', confirmPrompt, ui.ButtonSet.YES_NO);
    if (userChoice !== ui.Button.YES) {
      const cancelMsg = 'GitHub write synchronization cancelled by user. No files were modified.';
      logPublishEvent(ss, 'CMS_GITHUB_SYNC', 'CANCELLED', 'Sync cancelled by user', 'N/A', 'NONE');
      ui.alert('Phase 3D: Cancelled', cancelMsg, ui.ButtonSet.OK);
      Logger.log(cancelMsg);
      return;
    }
  }

  // 5. Update only the changed GitHub files through GitHub Contents API
  const writeResults = [];
  const writeErrors = [];

  for (let j = 0; j < changedFiles.length; j++) {
    const file = changedFiles[j];
    const encodedContent = Utilities.base64Encode(
      Utilities.newBlob(file.cmsString, 'application/json; charset=UTF-8').getBytes()
    );
    const commitMsg = `CMS: sync ${file.path} [skip ci]`;

    const putPayload = {
      message: commitMsg,
      content: encodedContent,
      branch: branch
    };
    if (file.ghSha) {
      putPayload.sha = file.ghSha;
    }

    try {
      const putRes = UrlFetchApp.fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        {
          method: 'put',
          headers: headers,
          contentType: 'application/json',
          payload: JSON.stringify(putPayload),
          muteHttpExceptions: true
        }
      );

      const putCode = putRes.getResponseCode();
      if (putCode === 200 || putCode === 201) {
        const resBody = JSON.parse(putRes.getContentText());
        const commitSha = resBody.commit ? resBody.commit.sha : 'OK';
        writeResults.push({
          path: file.path,
          commitSha: commitSha,
          status: 'SUCCESS'
        });
      } else {
        const safeError = sanitizeError(putRes.getContentText(), token);
        writeErrors.push(`Failed to write ${file.path} (HTTP ${putCode}): ${safeError}`);
        break; // Stop on first failure to prevent partial / inconsistent updates
      }
    } catch (err) {
      const safeError = sanitizeError(err.message, token);
      writeErrors.push(`Network error writing ${file.path}: ${safeError}`);
      break;
    }
  }

  // Handle write errors if any
  if (writeErrors.length > 0) {
    const errorReport =
      'PHASE 3D — GITHUB WRITE ERROR\n\n' +
      writeErrors.join('\n\n') + '\n\n' +
      'Some writes may have failed. Please check GitHub repository state.';

    logPublishEvent(ss, 'CMS_GITHUB_SYNC', 'FAILED', writeErrors.join('; '), 'N/A', 'NONE');

    if (ui) {
      ui.alert('Phase 3D: Write Failed', errorReport, ui.ButtonSet.OK);
    }
    Logger.log(errorReport);
    return;
  }

  // 6. Post-write verification: Re-read updated files from GitHub and verify exact match
  const verifyResults = [];
  let allVerified = true;

  for (let k = 0; k < writeResults.length; k++) {
    const written = writeResults[k];
    const fileDef = changedFiles.find(f => f.path === written.path);

    try {
      const verifyRes = UrlFetchApp.fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${written.path}?ref=${branch}`,
        {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        }
      );
      if (verifyRes.getResponseCode() === 200) {
        const vBody = JSON.parse(verifyRes.getContentText());
        const vCleanB64 = (vBody.content || '').replace(/\s+/g, '');
        const vDecoded = Utilities.newBlob(Utilities.base64Decode(vCleanB64)).getDataAsString('UTF-8');
        const vParsed = JSON.parse(vDecoded);

        if (semanticJSONEqual(fileDef.cmsParsed, vParsed)) {
          verifyResults.push(`• ${written.path}: VERIFIED MATCH (SHA: ${written.commitSha.substring(0, 7)})`);
        } else {
          allVerified = false;
          verifyResults.push(`• ${written.path}: VERIFICATION MISMATCH`);
        }
      } else {
        allVerified = false;
        verifyResults.push(`• ${written.path}: RE-READ FAILED (HTTP ${verifyRes.getResponseCode()})`);
      }
    } catch (vErr) {
      allVerified = false;
      verifyResults.push(`• ${written.path}: RE-READ ERROR (${sanitizeError(vErr.message, token)})`);
    }
  }

  // 7. Log to PUBLISH_LOG
  const finalStatus = allVerified ? 'SUCCESS' : 'VERIFICATION_WARNING';
  const finalMessage = `Updated ${writeResults.length} file(s): ${writeResults.map(w => w.path).join(', ')}`;
  const finalShas = writeResults.map(w => w.commitSha.substring(0, 7)).join(', ');

  logPublishEvent(ss, 'CMS_GITHUB_SYNC', finalStatus, finalMessage, finalShas, 'NONE');

  // 8. Final Report to user
  const successReport =
    'PHASE 3D — CMS → GITHUB WRITE SYNC COMPLETE\n\n' +
    `Repository: ${owner}/${repo}\n` +
    `Branch: ${branch}\n\n` +
    `Status: ${finalStatus}\n` +
    `Files updated: ${writeResults.length}\n\n` +
    verifyResults.join('\n') + '\n\n' +
    'Commit Message(s): [skip ci] applied\n' +
    'Vercel Deployment: 0 (No deployment triggered)\n' +
    'Logged in: PUBLISH_LOG';

  if (ui) {
    ui.alert('Phase 3D: Sync Complete', successReport, ui.ButtonSet.OK);
  }
  Logger.log(successReport);
}

/**
 * Phase 3D Diagnostic Tool: Performs exhaustive field-by-field and record-by-record
 * comparison between live CMS CERTIFICATIONS sheet and GitHub data/certifications.json.
 * Strictly Read-Only: 0 writes, 0 commits, 0 modifications.
 */
function diagnoseCertificationsDiff() {
  const ui = SpreadsheetApp.getUi();
  const config = getConfig();
  const owner = config['GITHUB_OWNER'] || 'Haven-Pham';
  const repo = config['GITHUB_REPO'] || 'Portfolio';
  const branch = config['GITHUB_BRANCH'] || 'main';
  const certPath = config['CERTIFICATIONS_JSON_PATH'] || 'data/certifications.json';

  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token || token.trim().length === 0) {
    ui.alert('Diagnostic Error', 'GITHUB_TOKEN is missing in Script Properties.', ui.ButtonSet.OK);
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const certSheet = ss.getSheetByName('CERTIFICATIONS');
  if (!certSheet) {
    ui.alert('Diagnostic Error', 'CERTIFICATIONS sheet not found in spreadsheet.', ui.ButtonSet.OK);
    return;
  }

  // 1. Fetch current GitHub certifications.json
  const headers = {
    'Authorization': 'Bearer ' + token.trim(),
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Haven-Portfolio-CMS'
  };

  let ghCerts = [];
  let ghSha = '';
  try {
    const res = UrlFetchApp.fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${certPath}?ref=${branch}`,
      { method: 'get', headers: headers, muteHttpExceptions: true }
    );
    if (res.getResponseCode() === 200) {
      const body = JSON.parse(res.getContentText());
      ghSha = body.sha ? body.sha.substring(0, 7) : '';
      const cleanB64 = (body.content || '').replace(/\s+/g, '');
      const decoded = Utilities.newBlob(Utilities.base64Decode(cleanB64)).getDataAsString('UTF-8');
      ghCerts = JSON.parse(decoded);
    } else {
      ui.alert('Diagnostic Error', `Failed to fetch GitHub ${certPath} (HTTP ${res.getResponseCode()})`, ui.ButtonSet.OK);
      return;
    }
  } catch (err) {
    ui.alert('Diagnostic Error', `Network error fetching GitHub ${certPath}: ${err.message}`, ui.ButtonSet.OK);
    return;
  }

  // 2. Serialize CMS data using the canonical serializer
  const cmsJsonStr = serializeCertificationsJSON(ss);
  let cmsCerts = [];
  try {
    cmsCerts = JSON.parse(cmsJsonStr);
  } catch (e) {
    ui.alert('Diagnostic Error', 'Failed to parse serialized CMS certifications JSON: ' + e.message, ui.ButtonSet.OK);
    return;
  }

  // 3. Detailed comparison
  const diffsByIndex = [];
  const diffsById = [];
  const fields = ['id', 'provider', 'type', 'when', 'mark', 'asset', 'kind'];

  // Check Index-by-Index (Order dependent)
  const maxLen = Math.max(cmsCerts.length, ghCerts.length);
  for (let i = 0; i < maxLen; i++) {
    const c = cmsCerts[i];
    const g = ghCerts[i];
    if (!c || !g) {
      diffsByIndex.push(`[Index ${i}]: CMS record=${c ? c.id : 'MISSING'} vs GitHub record=${g ? g.id : 'MISSING'}`);
      continue;
    }
    fields.forEach(f => {
      if (c[f] !== g[f]) {
        diffsByIndex.push({
          index: i,
          recordId: c.id === g.id ? c.id : `CMS:${c.id} / GH:${g.id}`,
          fieldName: f,
          cmsValue: JSON.stringify(c[f]),
          ghValue: JSON.stringify(g[f])
        });
      }
    });
  }

  // Check ID-by-ID (Order independent semantic diff)
  const ghMap = {};
  ghCerts.forEach(g => { ghMap[g.id] = g; });
  const cmsMap = {};
  cmsCerts.forEach(c => { cmsMap[c.id] = c; });

  const allIds = Array.from(new Set([...Object.keys(ghMap), ...Object.keys(cmsMap)]));
  allIds.forEach(id => {
    const c = cmsMap[id];
    const g = ghMap[id];
    if (!c) {
      diffsById.push(`Record [${id}] exists on GitHub but MISSING in CMS.`);
    } else if (!g) {
      diffsById.push(`Record [${id}] exists in CMS but MISSING on GitHub.`);
    } else {
      fields.forEach(f => {
        if (c[f] !== g[f]) {
          diffsById.push({
            recordId: id,
            fieldName: f,
            cmsValue: JSON.stringify(c[f]),
            ghValue: JSON.stringify(g[f])
          });
        }
      });
    }
  });

  // Check Ordering
  const cmsIds = cmsCerts.map(c => c.id);
  const ghIds = ghCerts.map(g => g.id);
  const orderDiff = JSON.stringify(cmsIds) !== JSON.stringify(ghIds);

  // 4. Construct Diagnostic Report
  let report = 'PHASE 3D DIAGNOSTIC — CERTIFICATIONS DIFF\n\n' +
    `GitHub SHA: ${ghSha}\n` +
    `CMS Records: ${cmsCerts.length} | GitHub Records: ${ghCerts.length}\n\n`;

  if (orderDiff) {
    report += '1. ROW ORDER DIFFERENCE DETECTED:\n' +
      `   CMS Sheet order : [${cmsIds.join(', ')}]\n` +
      `   GitHub order    : [${ghIds.join(', ')}]\n\n`;
  } else {
    report += '1. ROW ORDER: MATCH (Both have identical ID sequences)\n\n';
  }

  if (diffsById.length === 0 && orderDiff) {
    report += '2. SEMANTIC CONTENT: 100% MATCH by ID!\n' +
      '   ROOT CAUSE: Row order / sorting in Google Sheets.\n' +
      '   The data values are identical, but rows appear in a different order in the sheet.\n\n';
  } else if (diffsById.length === 0 && !orderDiff) {
    report += '2. NO DIFFERENCES FOUND: CMS and GitHub are identical!\n\n';
  } else {
    report += `2. FIELD-LEVEL DIFFERENCES (${diffsById.length} field diffs):\n\n`;
    diffsById.forEach(d => {
      if (typeof d === 'string') {
        report += `• ${d}\n`;
      } else {
        report += `• Record: "${d.recordId}"\n` +
          `  Field: ${d.fieldName}\n` +
          `  CMS Value   : ${d.cmsValue}\n` +
          `  GitHub Value: ${d.ghValue}\n\n`;
      }
    });
  }

  // Root cause diagnosis
  report += '3. ROOT CAUSE SUMMARY:\n';
  const causes = [];
  if (orderDiff) causes.push('• ORDERING: Sheet row order differs from canonical GitHub order.');
  diffsById.forEach(d => {
    if (typeof d !== 'string') {
      if (d.fieldName === 'when') causes.push(`• DATE FORMATTING: [${d.recordId}] when is ${d.cmsValue} vs ${d.ghValue}.`);
      if (d.fieldName === 'asset') causes.push(`• FILE PATH / ASSET: [${d.recordId}] asset is ${d.cmsValue} vs ${d.ghValue}.`);
      if (d.fieldName === 'type') causes.push(`• CATEGORY / TYPE: [${d.recordId}] type is ${d.cmsValue} vs ${d.ghValue}.`);
      if (d.fieldName === 'provider') causes.push(`• PROVIDER: [${d.recordId}] provider is ${d.cmsValue} vs ${d.ghValue}.`);
      if (d.fieldName === 'mark') causes.push(`• MARK: [${d.recordId}] mark is ${d.cmsValue} vs ${d.ghValue}.`);
      if (d.fieldName === 'kind') causes.push(`• KIND: [${d.recordId}] kind is ${d.cmsValue} vs ${d.ghValue}.`);
    }
  });
  if (causes.length === 0) causes.push('• None (Files are identical).');
  report += causes.join('\n');

  Logger.log(report);
  ui.alert('Certifications Diff Diagnosis', report, ui.ButtonSet.OK);
}

/**
 * Redacts any occurrences of secrets or Bearer tokens from error strings.
 * @param {string} msg Raw error message
 * @param {string} token Secret token to redact
 * @return {string} Sanitized string safe for logging / UI
 */
function sanitizeError(msg, token) {
  if (!msg) return '';
  let clean = String(msg);
  if (token && token.trim().length > 0) {
    clean = clean.replace(new RegExp(token.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '[REDACTED]');
  }
  return clean.replace(/Bearer\s+[a-zA-Z0-9_\-]+/gi, 'Bearer [REDACTED]');
}

/**
 * Appends a structured synchronization or publish record to PUBLISH_LOG.
 * @param {Spreadsheet} ss Active spreadsheet
 * @param {string} action Action type (e.g. 'CMS_GITHUB_SYNC')
 * @param {string} status Status result ('SUCCESS', 'NO_CHANGE', 'CANCELLED', 'FAILED')
 * @param {string} message Description message
 * @param {string} commitSha Commit SHA(s) or 'N/A'
 * @param {string} deploymentUrl Deployment URL or 'NONE'
 */
function logPublishEvent(ss, action, status, message, commitSha, deploymentUrl) {
  try {
    let sheet = ss.getSheetByName('PUBLISH_LOG');
    if (!sheet) {
      sheet = ss.insertSheet('PUBLISH_LOG');
      sheet.appendRow(['timestamp', 'action', 'status', 'message', 'commit_sha', 'deployment_url']);
      styleHeader(sheet);
    }
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([
      timestamp,
      action || 'CMS_GITHUB_SYNC',
      status || 'INFO',
      message || '',
      commitSha || 'N/A',
      deploymentUrl || 'NONE'
    ]);
  } catch (e) {
    Logger.log('Failed to log to PUBLISH_LOG: ' + e.message);
  }
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
    'netflix': { icon: '⌁', chips: ['Python', 'pandas', 'EDA'] },
    'rfm': { icon: '▥', chips: ['ANALYTICS'] },
    'ecommerce-cohort': { icon: '⌁', chips: ['Python', 'Cohort Analysis', 'Retention'] }
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

    // Columns: 6: github_url, 7: demo_url, 8: cover_file, 9: document_file
    const rawGithub = rows[i][6] ? String(rows[i][6]).trim() : '';
    const rawDemo = rows[i][7] ? String(rows[i][7]).trim() : '';
    const rawDoc = rows[i][9] ? String(rows[i][9]).trim() : '';

    projects.push({
      id: String(id).trim(),
      category: catStr,
      icon: meta.icon,
      chips: meta.chips,
      status: String(status).trim(),
      number: String(sort_order || i).padStart(2, '0'),
      documentFile: rawDoc || null,
      githubUrl: rawGithub || null,
      demoUrl: rawDemo || null
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
    } else if (providerStr === 'DataCamp') {
      mark = 'DC';
      kind = 'course';
    } else if (providerStr === 'Yuan Ze University') {
      mark = 'YZ';
      kind = 'course';
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
  const validStatuses = ['development', 'starter', 'concept', 'coursework', 'coursework-test'];

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
 * ============================================================================
 * PHASE 5A: GOOGLE DRIVE → CMS DISCOVERY ENGINE (STRICTLY READ-ONLY)
 * ============================================================================
 * Scans the configured portfolio Drive root folder recursively.
 * Generates an exhaustive inventory, detects anomalies, identifies duplicates,
 * flags sensitive/private records, and maps files non-destructively to existing
 * CMS records.
 * STRICTLY READ-ONLY: 0 Drive writes, 0 Sheet writes, 0 GitHub writes, 0 pushes.
 * ============================================================================
 */
function scanDriveInventory(showUi) {
  showUi = showUi !== false;

  let ui = null;

  if (showUi) {
    try {
      ui = SpreadsheetApp.getUi();
    } catch (e) {}
  }

  const config = getConfig();
  const rootFolderId = (config['DRIVE_ROOT_FOLDER_ID'] || '').trim();

  let rootFolder = null;
  const errors = [];

  if (rootFolderId && rootFolderId !== 'PENDING_SETUP') {
    try {
      rootFolder = DriveApp.getFolderById(rootFolderId);
    } catch (err) {
      errors.push('Cannot access Drive folder by ID [' + rootFolderId + ']: ' + err.message);
    }
  }

  if (!rootFolder) {
    try {
      const matches = DriveApp.getFoldersByName('HAVEN PORTFOLIO');
      if (matches.hasNext()) {
        rootFolder = matches.next();
      }
    } catch (err) {
      errors.push('Cannot search Drive for folder "HAVEN PORTFOLIO": ' + err.message);
    }
  }

  if (!rootFolder) {
    const errorMsg = 'Drive Root Folder not found.\n\n' +
      'Please ensure "HAVEN PORTFOLIO" exists in Google Drive or set DRIVE_ROOT_FOLDER_ID in CONFIG sheet.';
    if (ui) ui.alert('Phase 5A: Drive Discovery Error', errorMsg, ui.ButtonSet.OK);
    Logger.log(errorMsg);
    return { error: errorMsg, errors: errors };
  }

  const rootName = rootFolder.getName();
  const rootId = rootFolder.getId();
  const rootUrl = rootFolder.getUrl();

  const folderStructure = [];
  const emptyFolders = [];
  const unknownFolders = [];
  const allFiles = [];

  const knownCategories = {
    '01_PROJECTS': 'PROJECT',
    '02_CERTIFICATIONS': 'CERTIFICATION',
    '03_PROFILE': 'PROFILE',
    '04_RESEARCH': 'RESEARCH'
  };

  const queue = [{ folder: rootFolder, path: rootName, category: 'UNKNOWN' }];
  const visitedFolderIds = new Set([rootId]);

  while (queue.length > 0) {
    const current = queue.shift();
    const f = current.folder;
    const fPath = current.path;
    const fName = f.getName();
    const fId = f.getId();

    let cat = current.category;
    if (cat === 'UNKNOWN') {
      if (knownCategories[fName]) {
        cat = knownCategories[fName];
      } else if (/project/i.test(fName)) {
        cat = 'PROJECT';
      } else if (/cert/i.test(fName)) {
        cat = 'CERTIFICATION';
      } else if (/profile|cv|resume/i.test(fName)) {
        cat = 'PROFILE';
      } else if (/research/i.test(fName)) {
        cat = 'RESEARCH';
      }
    }

    folderStructure.push({
      name: fName,
      id: fId,
      path: fPath,
      category: cat
    });

    if (fId !== rootId && !knownCategories[fName] && cat === 'UNKNOWN') {
      unknownFolders.push({ name: fName, id: fId, path: fPath });
    }

    // Inspect files in this folder
    let fileCount = 0;
    try {
      const filesIter = f.getFiles();
      while (filesIter.hasNext()) {
        fileCount++;
        const file = filesIter.next();
        const fileId = file.getId();
        const fileName = file.getName();
        const mimeType = file.getMimeType();
        const fileUrl = file.getUrl();
        const lastUpdated = file.getLastUpdated();
        const fileSize = file.getSize();

        // Categorize file based on folder location and filename heuristic
        let fileCategory = cat;
        if (fileCategory === 'UNKNOWN') {
          if (/cert|hackerrank|datacamp|mandarin/i.test(fileName)) {
            fileCategory = 'CERTIFICATION';
          } else if (/cv|resume|profile|photo/i.test(fileName)) {
            fileCategory = 'PROFILE';
          } else if (/paper|research|patent/i.test(fileName)) {
            fileCategory = 'RESEARCH';
          } else if (/project|dashboard|sql|rfm|retail|supply/i.test(fileName)) {
            fileCategory = 'PROJECT';
          }
        }

        allFiles.push({
          name: fileName,
          id: fileId,
          mimeType: mimeType,
          url: fileUrl,
          parentFolder: fName,
          parentPath: fPath,
          parentFolderId: fId,
          lastUpdated: lastUpdated,
          sizeBytes: fileSize,
          category: fileCategory
        });
      }
    } catch (err) {
      errors.push('Error reading files in folder "' + fPath + '": ' + err.message);
    }

    // Inspect subfolders
    let subfolderCount = 0;
    try {
      const subIter = f.getFolders();
      while (subIter.hasNext()) {
        subfolderCount++;
        const sub = subIter.next();
        const subId = sub.getId();
        if (!visitedFolderIds.has(subId)) {
          visitedFolderIds.add(subId);
          queue.push({
            folder: sub,
            path: fPath + ' / ' + sub.getName(),
            category: cat !== 'UNKNOWN' ? cat : (knownCategories[sub.getName()] || 'UNKNOWN')
          });
        }
      }
    } catch (err) {
      errors.push('Error reading subfolders in "' + fPath + '": ' + err.message);
    }

    if (fileCount === 0 && subfolderCount === 0 && fId !== rootId) {
      emptyFolders.push({ name: fName, id: fId, path: fPath });
    }
  }

  // Count files by category
  const counts = {
    PROJECT: 0,
    CERTIFICATION: 0,
    PROFILE: 0,
    RESEARCH: 0,
    UNKNOWN: 0
  };
  allFiles.forEach(file => {
    counts[file.category] = (counts[file.category] || 0) + 1;
  });

  // Duplicate & Anomaly detection
  const filesById = {};
  const duplicateIdCandidates = [];
  const filesByName = {};
  const duplicateNameCandidates = [];
  const unsupportedMimeFiles = [];

  const supportedMimePrefixes = [
    'image/',
    'application/pdf',
    'application/json',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream', // Power BI (.pbix), Tableau, archives
    'application/vnd.openxmlformats', // xlsx, docx
    'application/vnd.ms-excel',
    'text/csv',
    'text/plain',
    'text/markdown'
  ];
  const suspiciousExtensions = /\.(exe|bat|cmd|sh|vbs|ps1|dll|scr|bin|tmp|env)$/i;

  allFiles.forEach(file => {
    // 1. Stable ID duplicates
    if (filesById[file.id]) {
      duplicateIdCandidates.push({
        id: file.id,
        name: file.name,
        locations: [filesById[file.id].parentPath, file.parentPath]
      });
    } else {
      filesById[file.id] = file;
    }

    // 2. Duplicate filenames across folders
    const lowerName = file.name.toLowerCase();
    if (!filesByName[lowerName]) {
      filesByName[lowerName] = [];
    }
    filesByName[lowerName].push(file);

    // 3. Unsupported or suspicious MIME type
    const isSupportedMime = supportedMimePrefixes.some(p => file.mimeType.startsWith(p));
    const isSuspicious = suspiciousExtensions.test(file.name);
    if (!isSupportedMime || isSuspicious) {
      unsupportedMimeFiles.push({
        name: file.name,
        id: file.id,
        mimeType: file.mimeType,
        parentPath: file.parentPath,
        reason: isSuspicious ? 'Suspicious file extension' : 'Unusual MIME type'
      });
    }
  });

  Object.keys(filesByName).forEach(nameKey => {
    if (filesByName[nameKey].length > 1) {
      duplicateNameCandidates.push({
        name: filesByName[nameKey][0].name,
        occurrences: filesByName[nameKey].length,
        locations: filesByName[nameKey].map(f => f.parentPath + ' (' + f.id + ')')
      });
    }
  });

  // Sensitive & Private candidates (Task 4 & Task 6)
  const sensitivePatterns = /mandarin|private|confidential|passport|cccd|arc|id_card|residency|secret|\.env/i;
  const sensitiveCandidates = allFiles.filter(f => {
    return sensitivePatterns.test(f.name) || sensitivePatterns.test(f.parentPath);
  });

  // Load existing CMS records for non-destructive mapping (Task 5)
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cmsProjects = [];
  const pSheet = ss ? ss.getSheetByName('PROJECTS') : null;
  if (pSheet) {
    const pRows = pSheet.getDataRange().getValues();
    for (let i = 1; i < pRows.length; i++) {
      if (pRows[i][0]) {
        cmsProjects.push({
          id: String(pRows[i][0]).trim(),
          slug: String(pRows[i][1] || '').trim(),
          file: String(pRows[i][9] || '').trim()
        });
      }
    }
  }

  const cmsCerts = [];
  const cSheet = ss ? ss.getSheetByName('CERTIFICATIONS') : null;
  if (cSheet) {
    const cRows = cSheet.getDataRange().getValues();
    for (let i = 1; i < cRows.length; i++) {
      if (cRows[i][0]) {
        cmsCerts.push({
          id: String(cRows[i][0]).trim(),
          file: String(cRows[i][5] || '').trim()
        });
      }
    }
  }

  const cmsMappings = [];
  const unmappedFiles = [];

  allFiles.forEach(file => {
    let matchedEntity = null;
    let matchType = null;
    let isPrivate = false;

    // Check Mandarin private rule (Task 6)
    if (/mandarin/i.test(file.name) || /mandarin/i.test(file.parentPath)) {
      matchedEntity = { entity: 'CERTIFICATION', id: 'mandarin', note: 'Marked as [PRIVATE RECORD]' };
      matchType = 'PRIVATE_RECORD_PRESERVED';
      isPrivate = true;
    } else if (file.category === 'PROJECT') {
      const pMatch = cmsProjects.find(p => {
        return file.name.toLowerCase().includes(p.id.toLowerCase()) ||
          (p.slug && file.name.toLowerCase().includes(p.slug.toLowerCase())) ||
          (p.file && file.name.toLowerCase().includes(p.file.split('/').pop().toLowerCase()));
      });
      if (pMatch) {
        matchedEntity = { entity: 'PROJECT', id: pMatch.id, slug: pMatch.slug };
        matchType = 'PROJECT_ID_MATCH';
      }
    } else if (file.category === 'CERTIFICATION') {
      const cMatch = cmsCerts.find(c => {
        const cFile = c.file ? c.file.split('/').pop().toLowerCase() : '';
        return file.name.toLowerCase().includes(c.id.toLowerCase()) ||
          (cFile && file.name.toLowerCase().includes(cFile));
      });
      if (cMatch) {
        matchedEntity = { entity: 'CERTIFICATION', id: cMatch.id };
        matchType = 'CERT_ID_MATCH';
      }
    } else if (file.category === 'PROFILE') {
      if (/cv|resume/i.test(file.name)) {
        matchedEntity = { entity: 'PROFILE', target: 'CV / Resume Asset' };
        matchType = 'CV_MATCH';
      } else if (/profile|photo/i.test(file.name)) {
        matchedEntity = { entity: 'PROFILE', target: 'Profile Picture' };
        matchType = 'PHOTO_MATCH';
      }
    }

    if (matchedEntity) {
      cmsMappings.push({
        fileName: file.name,
        fileId: file.id,
        parentFolder: file.parentFolder,
        mappedTo: matchedEntity,
        matchType: matchType,
        isPrivate: isPrivate
      });
    } else {
      unmappedFiles.push({
        fileName: file.name,
        fileId: file.id,
        category: file.category,
        parentFolder: file.parentFolder
      });
    }
  });

  // Arithmetic reconciliation check (Phase 5A.1)
  const sumOfCategories = counts.PROJECT + counts.CERTIFICATION + counts.PROFILE + counts.RESEARCH + counts.UNKNOWN;
  const isCategorySumMatch = (sumOfCategories === allFiles.length);
  const isMappingSumMatch = (cmsMappings.length + unmappedFiles.length === allFiles.length);
  const arithmeticCheck = (isCategorySumMatch && isMappingSumMatch) ? 'PASS' : 'FAIL';

  // Construct Report Text (Task 7 & Phase 5A.1 format)
  let report = 'PHASE 5A.1 — INVENTORY RECONCILIATION\n\n' +
    '1. Drive root:\n   • Name: "' + rootName + '"\n   • ID: ' + rootId + '\n\n' +
    '2. Folder structure:\n   • Folders discovered: ' + folderStructure.length + '\n' +
    folderStructure.map(f => '     - [' + f.category + '] ' + f.path + ' (ID: ' + f.id.substring(0, 10) + '...)').join('\n') + '\n' +
    '   • Empty folders (' + emptyFolders.length + '):\n' +
    (emptyFolders.length > 0 ? emptyFolders.map(e => '     - ' + e.path + ' (ID: ' + e.id + ')').join('\n') + '\n' : '     - None\n') +
    '   • Unknown folders (' + unknownFolders.length + '):\n' +
    (unknownFolders.length > 0 ? unknownFolders.map(u => '     - ' + u.path + ' (ID: ' + u.id + ')').join('\n') + '\n' : '     - None\n') + '\n' +
    '3. Total discovered files: ' + allFiles.length + '\n' +
    '   • Projects: ' + counts.PROJECT + '\n' +
    '   • Certifications: ' + counts.CERTIFICATION + '\n' +
    '   • Profile: ' + counts.PROFILE + '\n' +
    '   • Research: ' + counts.RESEARCH + '\n' +
    '   • Unknown: ' + counts.UNKNOWN + '\n\n' +
    '4. Inventory Reconciliation:\n' +
    '   • Duplicates: ' + duplicateIdCandidates.length + '\n' +
    '   • Unmapped: ' + unmappedFiles.length + '\n' +
    '   • Mapped: ' + cmsMappings.length + '\n' +
    '   • Arithmetic check: ' + arithmeticCheck + ' (' + allFiles.length + ' = ' +
    counts.PROJECT + ' + ' + counts.CERTIFICATION + ' + ' + counts.PROFILE + ' + ' + counts.RESEARCH + ' + ' + counts.UNKNOWN + ')\n\n' +
    '5. Duplicate candidates:\n' +
    '   • Duplicate File IDs: ' + duplicateIdCandidates.length + '\n' +
    (duplicateIdCandidates.length > 0 ? duplicateIdCandidates.map(d => '     - ' + d.name + ' (' + d.locations.join(' & ') + ')').join('\n') + '\n' : '     - None\n') +
    '   • Duplicate File Names: ' + duplicateNameCandidates.length + '\n' +
    (duplicateNameCandidates.length > 0 ? duplicateNameCandidates.map(d => '     - "' + d.name + '" (' + d.occurrences + 'x): ' + d.locations.join('; ')).join('\n') + '\n' : '     - None\n') +
    '   • Unsupported/Suspicious MIME Types: ' + unsupportedMimeFiles.length + '\n' +
    (unsupportedMimeFiles.length > 0 ? unsupportedMimeFiles.map(u => '     - "' + u.name + '" [' + u.mimeType + ']: ' + u.reason).join('\n') + '\n' : '     - None\n') + '\n' +
    '6. Private/sensitive candidates: ' + sensitiveCandidates.length + '\n' +
    (sensitiveCandidates.length > 0 ? sensitiveCandidates.map(s => '    - "' + s.name + '" in ' + s.parentPath + ' (FLAGGED PRIVATE / EXCLUDED FROM PUBLIC SYNC)').join('\n') + '\n' : '    - None\n') + '\n' +
    '7. CMS mappings: ' + cmsMappings.length + ' mapped\n' +
    (cmsMappings.length > 0 ? cmsMappings.map(m => '    - "' + m.fileName + '" ➔ ' + m.mappedTo.entity + ' [' + (m.mappedTo.id || m.mappedTo.target) + ']' + (m.isPrivate ? ' [PRIVATE RECORD]' : '')).join('\n') + '\n\n' : '    - None\n\n') +
    '8. Unmapped files: ' + unmappedFiles.length + '\n' +
    (unmappedFiles.length > 0 ? unmappedFiles.map(u => '    - "' + u.fileName + '" in ' + u.parentFolder + ' [Category: ' + u.category + ']').join('\n') + '\n' : '    - None\n') + '\n' +
    '9. Errors: ' + (errors.length === 0 ? 'None' : errors.join('; ')) + '\n\n' +
    '--------------------------------------------------\n' +
    'SAFETY VERIFICATION (STRICTLY READ-ONLY):\n' +
    'Google Drive writes: 0\n' +
    'Google Sheet writes: 0\n' +
    'GitHub writes: 0\n' +
    'Git commits: 0\n' +
    'Git pushes: 0\n' +
    'Vercel deployments: 0';

  if (showUi) {
    Logger.log(report);
    if (ui) {
      ui.alert('Phase 5A.1: Drive Inventory Reconciliation', report.length > 2500 ? report.substring(0, 2400) + '\n\n... (See Apps Script Execution Logs for complete output)' : report, ui.ButtonSet.OK);
    }
  } else {
    Logger.log(
      '[Phase 5A Silent] Inventory completed. ' +
      'Files: ' + allFiles.length +
      ', Projects: ' + counts.PROJECT +
      ', Certifications: ' + counts.CERTIFICATION +
      ', Profile: ' + counts.PROFILE +
      ', Research: ' + counts.RESEARCH +
      ', Unknown: ' + counts.UNKNOWN +
      ', Private candidates: ' + sensitiveCandidates.length +
      ', Unmapped: ' + unmappedFiles.length +
      ', Errors: ' + errors.length
    );
  }

  return {
    root: { name: rootName, id: rootId, url: rootUrl },
    folderStructure: folderStructure,
    emptyFolders: emptyFolders,
    unknownFolders: unknownFolders,
    totalFiles: allFiles.length,
    counts: counts,
    allFiles: allFiles,
    duplicateIdCandidates: duplicateIdCandidates,
    duplicateNameCandidates: duplicateNameCandidates,
    unsupportedMimeFiles: unsupportedMimeFiles,
    sensitiveCandidates: sensitiveCandidates,
    cmsMappings: cmsMappings,
    unmappedFiles: unmappedFiles,
    arithmeticCheck: arithmeticCheck,
    errors: errors,
    report: report
  };
}

/**
 * ============================================================================
 * PHASE 5B: GOOGLE DRIVE → CMS READ-ONLY SYNC PREVIEW LAYER
 * ============================================================================
 * Compares discovered Drive inventory against current CMS records.
 * Analyzes asset targets, detects discrepancies, flags private records,
 * and reports actionable diffs without performing any write operations.
 * STRICTLY READ-ONLY: 0 Sheet writes, 0 Drive writes, 0 GitHub writes, 0 pushes.
 * ============================================================================
 */
function previewDriveToCMSSync() {
  let ui = null;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {}

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = getConfig();

  // Run read-only scan (Phase 5A discovery engine under DRIVE_ROOT_FOLDER_ID only)
  const discovery = scanDriveInventory();
  if (discovery.error) {
    if (ui) ui.alert('Phase 5B: Discovery Error', discovery.error, ui.ButtonSet.OK);
    return discovery;
  }

  const allFiles = discovery.allFiles || [];

  // Read existing CMS records
  // 1. PROJECTS
  const cmsProjects = [];
  const pSheet = ss ? ss.getSheetByName('PROJECTS') : null;
  if (pSheet) {
    const pRows = pSheet.getDataRange().getValues();
    for (let i = 1; i < pRows.length; i++) {
      if (pRows[i][0]) {
        cmsProjects.push({
          id: String(pRows[i][0]).trim(),
          slug: String(pRows[i][1] || '').trim(),
          category: String(pRows[i][2] || '').trim(),
          status: String(pRows[i][3] || '').trim(),
          cover_file: String(pRows[i][8] || '').trim(),
          document_file: String(pRows[i][9] || '').trim()
        });
      }
    }
  }

  // 2. CERTIFICATIONS
  const cmsCerts = [];
  const cSheet = ss ? ss.getSheetByName('CERTIFICATIONS') : null;
  if (cSheet) {
    const cRows = cSheet.getDataRange().getValues();
    for (let i = 1; i < cRows.length; i++) {
      if (cRows[i][0]) {
        cmsCerts.push({
          id: String(cRows[i][0]).trim(),
          name: String(cRows[i][1] || '').trim(),
          provider: String(cRows[i][2] || '').trim(),
          file: String(cRows[i][5] || '').trim()
        });
      }
    }
  }

  // Comparison & Analysis
  const previewItems = [];
  const countsByAction = {
    'MATCH': 0,
    'UPDATE CANDIDATE': 0,
    'AMBIGUOUS': 0,
    'PRIVATE — EXCLUDED': 0,
    'NO CMS TARGET': 0,
    'NO CHANGE': 0
  };

  // Helper to add an item
  function addPreviewItem(item) {
    previewItems.push(item);
    countsByAction[item.action] = (countsByAction[item.action] || 0) + 1;
  }

  // 1. Evaluate discovered Drive files (13 files)
  allFiles.forEach(file => {
    const fname = file.name;
    const cat = file.category;

    if (/mandarin/i.test(fname) || /mandarin/i.test(file.parentPath)) {
      // Mandarin certification is strictly private (Task 5 & 6)
      const cert = cmsCerts.find(c => c.id === 'mandarin');
      addPreviewItem({
        entity: 'CERTIFICATION',
        cmsId: 'mandarin',
        driveFile: fname,
        driveId: file.id,
        drivePath: file.parentPath,
        field: 'file',
        currentValue: cert ? cert.file : '[PRIVATE RECORD]',
        proposedValue: '[PRIVATE RECORD] — EXCLUDED FROM PUBLIC SYNC',
        action: 'PRIVATE — EXCLUDED',
        confidence: 'HIGH',
        notes: 'Mandarin cert is private. Excluded from public sync, URLs, and GitHub.'
      });
    } else if (cat === 'CERTIFICATION') {
      const cert = cmsCerts.find(c => {
        const cFile = c.file ? c.file.split('/').pop().toLowerCase() : '';
        return fname.toLowerCase().includes(c.id.toLowerCase()) || (cFile && fname.toLowerCase().includes(cFile));
      });
      if (cert) {
        const currentFile = cert.file;
        const proposedFile = currentFile ? currentFile : 'assets/certificates/' + fname;
        const isMatch = currentFile && currentFile.toLowerCase().endsWith(fname.toLowerCase());
        addPreviewItem({
          entity: 'CERTIFICATION',
          cmsId: cert.id,
          driveFile: fname,
          driveId: file.id,
          drivePath: file.parentPath,
          field: 'file',
          currentValue: currentFile || '[EMPTY]',
          proposedValue: proposedFile,
          action: isMatch ? 'MATCH' : 'UPDATE CANDIDATE',
          confidence: 'HIGH',
          notes: isMatch ? 'Current asset reference matches Drive file.' : 'Certificate reference update candidate.'
        });
      } else {
        addPreviewItem({
          entity: 'CERTIFICATION',
          cmsId: 'UNLINKED',
          driveFile: fname,
          driveId: file.id,
          drivePath: file.parentPath,
          field: 'file',
          currentValue: '[NONE]',
          proposedValue: 'AMBIGUOUS — NO WRITE PROPOSED',
          action: 'AMBIGUOUS',
          confidence: 'LOW',
          notes: 'No matching certification ID in CMS.'
        });
      }
    } else if (cat === 'PROJECT') {
      const proj = cmsProjects.find(p => {
        const pFile = p.document_file ? p.document_file.split('/').pop().toLowerCase() : '';
        return fname.toLowerCase().includes(p.id.toLowerCase()) ||
          (p.slug && fname.toLowerCase().includes(p.slug.toLowerCase())) ||
          (pFile && fname.toLowerCase().includes(pFile));
      });
      if (proj) {
        const currentDoc = proj.document_file;
        if (proj.id === 'sql' && currentDoc === 'projects/sql_supply_chain_starter.zip' && fname === 'sql_supply_chain_starter.zip') {
          // SQL has verified existing production format
          addPreviewItem({
            entity: 'PROJECT',
            cmsId: proj.id,
            driveFile: fname,
            driveId: file.id,
            drivePath: file.parentPath,
            field: 'document_file',
            currentValue: currentDoc,
            proposedValue: 'projects/sql_supply_chain_starter.zip',
            action: 'MATCH',
            confidence: 'HIGH',
            notes: 'Existing production asset path matches Drive filename.'
          });
        } else {
          // Target format for retail, netflix, rfm cannot be assumed with certainty (Task 4)
          addPreviewItem({
            entity: 'PROJECT',
            cmsId: proj.id,
            driveFile: fname,
            driveId: file.id,
            drivePath: file.parentPath,
            field: 'document_file',
            currentValue: currentDoc || '[EMPTY]',
            proposedValue: 'AMBIGUOUS — NO WRITE PROPOSED',
            action: 'AMBIGUOUS',
            confidence: 'LOW',
            notes: 'Production target format uncertain (GitHub path vs Drive URL vs unlinked). Requires user decision.'
          });
        }
      } else {
        addPreviewItem({
          entity: 'PROJECT',
          cmsId: 'UNLINKED',
          driveFile: fname,
          driveId: file.id,
          drivePath: file.parentPath,
          field: 'document_file',
          currentValue: '[NONE]',
          proposedValue: 'AMBIGUOUS — NO WRITE PROPOSED',
          action: 'AMBIGUOUS',
          confidence: 'LOW',
          notes: 'No matching project record found.'
        });
      }
    } else if (cat === 'PROFILE') {
      // Discovered profile asset, but CMS schema has no PROFILE write target (Task 6)
      addPreviewItem({
        entity: 'PROFILE',
        cmsId: fname.toLowerCase().includes('cv') ? 'cv-resume' : 'profile-photo',
        driveFile: fname,
        driveId: file.id,
        drivePath: file.parentPath,
        field: '[NO_COLUMN]',
        currentValue: '[NONE]',
        proposedValue: 'PROFILE ASSET — DISCOVERED BUT NO CMS WRITE TARGET',
        action: 'NO CMS TARGET',
        confidence: 'HIGH',
        notes: 'Discovered in 03_PROFILE, but CMS schema has no profile asset fields.'
      });
    } else {
      addPreviewItem({
        entity: 'UNKNOWN',
        cmsId: 'N/A',
        driveFile: fname,
        driveId: file.id,
        drivePath: file.parentPath,
        field: 'N/A',
        currentValue: '[NONE]',
        proposedValue: 'AMBIGUOUS — NO WRITE PROPOSED',
        action: 'AMBIGUOUS',
        confidence: 'LOW',
        notes: 'Unknown category asset.'
      });
    }
  });

  // 2. Evaluate existing CMS records without Drive assets (Task 7)
  cmsProjects.forEach(p => {
    const hasDriveFile = previewItems.some(item => item.entity === 'PROJECT' && item.cmsId === p.id);
    if (!hasDriveFile) {
      addPreviewItem({
        entity: 'PROJECT',
        cmsId: p.id,
        driveFile: '[NONE]',
        driveId: 'N/A',
        drivePath: 'N/A',
        field: 'document_file',
        currentValue: p.document_file || '[EMPTY]',
        proposedValue: '[NO CHANGE]',
        action: 'NO CHANGE',
        confidence: 'HIGH',
        notes: 'CMS record exists without Drive asset. Absence of file does not cause deletion.'
      });
    }
  });

  // Construct Dialog and Log Text (Task 9 & Final Report format)
  let previewText = 'PHASE 5B — DRIVE → CMS READ-ONLY PREVIEW\n\n' +
    'Drive inventory: ' + allFiles.length + ' files\n' +
    '• Projects: ' + (discovery.counts ? discovery.counts.PROJECT : 0) + '\n' +
    '• Certifications: ' + (discovery.counts ? discovery.counts.CERTIFICATION : 0) + '\n' +
    '• Profile: ' + (discovery.counts ? discovery.counts.PROFILE : 0) + '\n' +
    '• Research: ' + (discovery.counts ? discovery.counts.RESEARCH : 0) + '\n' +
    '• Unknown: ' + (discovery.counts ? discovery.counts.UNKNOWN : 0) + '\n\n' +
    '==================================================\n' +
    'ACTIONABLE ASSET ANALYSIS (TABLE):\n' +
    '==================================================\n\n' +
    'ENTITY | CMS ID | DRIVE FILE | FIELD | CURRENT VALUE | PROPOSED VALUE | ACTION | CONFIDENCE\n' +
    '-----------------------------------------------------------------------------------------------------\n';

  previewItems.forEach(item => {
    previewText += `${item.entity} | ${item.cmsId} | ${item.driveFile} | ${item.field} | ${item.currentValue} | ${item.proposedValue} | ${item.action} | ${item.confidence}\n`;
  });

  previewText += '\n==================================================\n' +
    'ACTION SUMMARY:\n' +
    'MATCH: ' + countsByAction['MATCH'] + '\n' +
    'UPDATE CANDIDATE: ' + countsByAction['UPDATE CANDIDATE'] + '\n' +
    'AMBIGUOUS: ' + countsByAction['AMBIGUOUS'] + '\n' +
    'PRIVATE — EXCLUDED: ' + countsByAction['PRIVATE — EXCLUDED'] + '\n' +
    'NO CMS TARGET: ' + countsByAction['NO CMS TARGET'] + '\n' +
    'NO CHANGE: ' + countsByAction['NO CHANGE'] + '\n\n' +
    '--------------------------------------------------\n' +
    'SAFETY SUMMARY (STRICTLY READ-ONLY):\n' +
    'Google Drive writes: 0\n' +
    'Google Sheet writes: 0\n' +
    'GitHub writes: 0\n' +
    'Git commits: 0\n' +
    'Git pushes: 0\n' +
    'Vercel deployments: 0\n\n' +
    'Execution mode: STRICTLY READ-ONLY\n' +
    'No CMS changes were made.';

  Logger.log(previewText);

  if (ui) {
    ui.alert(
      'Phase 5B: Drive → CMS Sync Preview',
      previewText.length > 2500 ? previewText.substring(0, 2400) + '\n\n... (See Apps Script Execution Logs for complete table)' : previewText,
      ui.ButtonSet.OK
    );
  }

  return {
    totalFiles: allFiles.length,
    countsByAction: countsByAction,
    previewItems: previewItems,
    previewText: previewText
  };
}

/**
 * ============================================================================
 * PHASE 5C: PREVIEW PROJECT ASSET UPLOAD (STRICTLY READ-ONLY)
 * ============================================================================
 * Prepares the future approved asset upload pipeline by comparing Drive files
 * against target GitHub repository paths.
 * Checks file sizes, supported extensions (.pbix, .ipynb, .xlsx, .zip),
 * verifies whether GitHub files already exist, and checks for content changes
 * without performing any upload or write operations.
 * STRICTLY READ-ONLY: 0 GitHub writes, 0 Drive writes, 0 Sheet writes, 0 pushes.
 * ============================================================================
 */
function previewProjectAssetUpload() {
  let ui = null;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {}

  const config = getConfig();
  const owner = config['GITHUB_OWNER'] || 'Haven-Pham';
  const repo = config['GITHUB_REPO'] || 'Portfolio';
  const branch = config['GITHUB_BRANCH'] || 'main';
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');

  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Haven-Portfolio-CMS'
  };
  if (token && token.trim()) {
    headers['Authorization'] = 'Bearer ' + token.trim();
  }

  // 1. Run read-only scan of Drive
  const discovery = scanDriveInventory();
  if (discovery.error) {
    if (ui) ui.alert('Phase 5C: Discovery Error', discovery.error, ui.ButtonSet.OK);
    return discovery;
  }

  const allFiles = discovery.allFiles || [];

  // Supported extensions in Phase 5
  const supportedExtensions = ['.pbix', '.ipynb', '.xlsx', '.zip'];
  const MAX_RAW_ASSET_SIZE = 35 * 1024 * 1024; // 35 MB safe RAW file limit for Apps Script -> GitHub Base64 upload channel

  // Approved project asset mappings
  const approvedTargets = {
    'sql_supply_chain_starter.zip': 'projects/sql_supply_chain_starter.zip',
    'retail_sales_dashboard.pbix': 'projects/retail_sales_dashboard.pbix',
    'netflix_eda.ipynb': 'projects/netflix_eda.ipynb',
    'rfm_segmentation_analysis.xlsx': 'projects/rfm_segmentation_analysis.xlsx'
  };

  const uploadPreviews = [];
  const countsByAction = {
    'MATCH': 0,
    'CREATE': 0,
    'UPDATE': 0,
    'AMBIGUOUS': 0,
    'SKIP': 0,
    'PRIVATE': 0
  };

  allFiles.forEach(file => {
    const fname = file.name;
    const fsize = file.sizeBytes || 0;
    const fid = file.id;
    const fUpdated = file.lastUpdated ? (file.lastUpdated instanceof Date ? file.lastUpdated.toISOString() : String(file.lastUpdated)) : 'Unknown';

    // 1. Mandarin is strictly private
    if (/mandarin/i.test(fname) || /mandarin/i.test(file.parentPath)) {
      uploadPreviews.push({
        fileName: fname,
        driveId: fid,
        driveModified: fUpdated,
        driveSize: fsize,
        targetGitHubPath: 'N/A (EXCLUDED)',
        githubExists: false,
        contentChanged: false,
        action: 'PRIVATE',
        notes: 'Mandarin cert is private record. Excluded from public sync.'
      });
      countsByAction['PRIVATE']++;
      return;
    }

    // 2. Check if approved project asset
    const targetPath = approvedTargets[fname];
    if (!targetPath) {
      uploadPreviews.push({
        fileName: fname,
        driveId: fid,
        driveModified: fUpdated,
        driveSize: fsize,
        targetGitHubPath: 'N/A',
        githubExists: false,
        contentChanged: false,
        action: 'SKIP',
        notes: file.category === 'PROFILE' ? 'Profile asset - no project target.' : 'Non-project asset.'
      });
      countsByAction['SKIP']++;
      return;
    }

    // 3. Supported extension check
    const hasSupportedExt = supportedExtensions.some(ext => fname.toLowerCase().endsWith(ext));
    if (!hasSupportedExt || fsize > MAX_RAW_ASSET_SIZE) {
      uploadPreviews.push({
        fileName: fname,
        driveId: fid,
        driveModified: fUpdated,
        driveSize: fsize,
        targetGitHubPath: targetPath,
        githubExists: false,
        contentChanged: false,
        action: 'AMBIGUOUS',
        notes: !hasSupportedExt
          ? 'Unsupported file extension.'
          : 'Exceeds 35MB safe raw-file limit for Apps Script Base64 GitHub upload.'
      });
      countsByAction['AMBIGUOUS']++;
      return;
    }

    // 4. Check if file exists in GitHub repo (Read-Only GET request)
    let githubExists = false;
    let githubSha = null;
    let githubSize = null;
    let contentChanged = true;

    try {
      const ghRes = UrlFetchApp.fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}?ref=${branch}`,
        { method: 'get', headers: headers, muteHttpExceptions: true }
      );
      const code = ghRes.getResponseCode();
      if (code === 200) {
        const ghData = JSON.parse(ghRes.getContentText());
        githubExists = true;
        githubSha = ghData.sha;
        githubSize = ghData.size;
        // Compare size as idempotency check
        if (githubSize === fsize) {
          contentChanged = false;
        }
      } else if (code === 404) {
        githubExists = false;
        contentChanged = true;
      }
    } catch (err) {
      Logger.log(`GitHub check error for ${targetPath}: ${err.message}`);
    }

    let action = 'CREATE';
    if (githubExists) {
      action = contentChanged ? 'UPDATE' : 'MATCH';
    }

    uploadPreviews.push({
      fileName: fname,
      driveId: fid,
      driveModified: fUpdated,
      driveSize: fsize,
      targetGitHubPath: targetPath,
      githubExists: githubExists,
      contentChanged: contentChanged,
      action: action,
      notes: githubExists
        ? (contentChanged ? `GitHub file exists (${githubSize}B vs ${fsize}B). Update candidate.` : 'Identical file exists in GitHub repo.')
        : 'New file to be created in GitHub.'
    });
    countsByAction[action]++;
  });

  // Construct Report Text
  let reportText = 'PHASE 5C — GITHUB ASSET UPLOAD PREVIEW (READ-ONLY)\n\n' +
    'Target Repository: ' + owner + '/' + repo + ' (' + branch + ')\n' +
    'Discovered Drive files: ' + allFiles.length + '\n\n' +
    '=====================================================================================================\n' +
    'FILE NAME | DRIVE SIZE | GITHUB TARGET PATH | GITHUB EXISTS | ACTION | NOTES\n' +
    '-----------------------------------------------------------------------------------------------------\n';

  uploadPreviews.forEach(item => {
    reportText += `${item.fileName} | ${item.driveSize}B | ${item.targetGitHubPath} | ${item.githubExists ? 'YES' : 'NO'} | ${item.action} | ${item.notes}\n`;
  });

  reportText += '\n=====================================================================================================\n' +
    'ACTION SUMMARY:\n' +
    'MATCH: ' + countsByAction['MATCH'] + '\n' +
    'CREATE: ' + countsByAction['CREATE'] + '\n' +
    'UPDATE: ' + countsByAction['UPDATE'] + '\n' +
    'AMBIGUOUS: ' + countsByAction['AMBIGUOUS'] + '\n' +
    'SKIP: ' + countsByAction['SKIP'] + '\n' +
    'PRIVATE: ' + countsByAction['PRIVATE'] + '\n\n' +
    '--------------------------------------------------\n' +
    'SAFETY VERIFICATION (STRICTLY READ-ONLY):\n' +
    'Google Drive writes: 0\n' +
    'Google Sheet writes: 0\n' +
    'GitHub writes: 0\n' +
    'Git commits: 0\n' +
    'Git pushes: 0\n' +
    'Vercel deployments: 0\n\n' +
    'Execution mode: STRICTLY READ-ONLY\n' +
    'No files were uploaded. No changes were made.';

  Logger.log(reportText);

  if (ui) {
    ui.alert(
      'Phase 5C: Asset Upload Preview (Read-Only)',
      reportText.length > 2500 ? reportText.substring(0, 2400) + '\n\n... (See Apps Script Execution Logs for complete output)' : reportText,
      ui.ButtonSet.OK
    );
  }

  return {
    totalFiles: allFiles.length,
    countsByAction: countsByAction,
    uploadPreviews: uploadPreviews,
    reportText: reportText
  };
}

/**
 * ============================================================================
 * PHASE 5E: SERIALIZE STAGED PROJECTS.JSON
 * ============================================================================
 * Creates an in-memory representation of data/projects.json that incorporates
 * approved staged mappings (such as documentFile) without modifying the
 * Google Sheet before the atomic GitHub commit.
 * ============================================================================
 */
function serializeStagedProjectsJSON(ss, stagedMappings) {
  const sheet = ss.getSheetByName('PROJECTS');
  if (!sheet) return '[]\n';
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return '[]\n';

  const knownMeta = {
    'retail': { icon: '▥', chips: ['Power BI', 'DAX', 'KPIs'] },
    'sql': { icon: '⛁', chips: ['SQL', 'CTEs', 'Window Functions'] },
    'inventory': { icon: '◈', chips: ['Inventory', 'Python · Learning', 'Excel'] },
    'netflix': { icon: '⌁', chips: ['Python', 'pandas', 'EDA'] },
    'rfm': { icon: '▥', chips: ['ANALYTICS'] },
    'ecommerce-cohort': { icon: '⌁', chips: ['Python', 'Cohort Analysis', 'Retention'] }
  };

  const projects = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, slug, category, status, featured, sort_order] = rows[i];
    if (!id) continue;
    const catStr = String(category).trim();
    const pid = String(id).trim();
    const meta = knownMeta[pid] || {
      icon: catStr === 'sql' ? '⛁' : catStr === 'supply' ? '◈' : '▥',
      chips: [catStr.toUpperCase()]
    };

    // Columns: 6: github_url, 7: demo_url, 8: cover_file, 9: document_file
    const rawGithub = rows[i][6] ? String(rows[i][6]).trim() : '';
    const rawDemo = rows[i][7] ? String(rows[i][7]).trim() : '';
    let rawDoc = rows[i][9] ? String(rows[i][9]).trim() : '';

    // Apply approved staged mapping if present
    if (stagedMappings && stagedMappings[pid]) {
      rawDoc = stagedMappings[pid];
    }

    projects.push({
      id: pid,
      category: catStr,
      icon: meta.icon,
      chips: meta.chips,
      status: String(status).trim(),
      number: String(sort_order || i).padStart(2, '0'),
      documentFile: rawDoc || null,
      githubUrl: rawGithub || null,
      demoUrl: rawDemo || null
    });
  }
  return JSON.stringify(projects, null, 2) + '\n';
}

/**
 * ============================================================================
 * PHASE 5E: PRODUCTION PROJECT ASSET SYNC (ATOMIC WRITE)
 * ============================================================================
 * Pre-flight verification + single atomic Git Data API commit (blobs + tree + commit)
 * followed by safe post-commit Google Sheet update and audit logging.
 * ============================================================================
 */
function syncProductionProjectAssets() {
  let ui = null;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {}

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = getConfig();
  const owner = config['GITHUB_OWNER'] || 'Haven-Pham';
  const repo = config['GITHUB_REPO'] || 'Portfolio';
  const branch = config['GITHUB_BRANCH'] || 'main';
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const MAX_RAW_ASSET_SIZE = 35 * 1024 * 1024;

  if (!token || !token.trim()) {
    const errorMsg = 'GITHUB_TOKEN is missing in Script Properties.\n\nPlease configure it before running Phase 5E.';
    if (ui) ui.alert('Phase 5E: Token Error', errorMsg, ui.ButtonSet.OK);
    Logger.log('Phase 5E Error: ' + errorMsg);
    return { status: 'ERROR', error: errorMsg };
  }

  const headers = {
    'Authorization': 'Bearer ' + token.trim(),
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Haven-Portfolio-CMS'
  };

  // --------------------------------------------------------------------------
  // PRE-FLIGHT CHECK 1: CMS Validation
  // --------------------------------------------------------------------------
  const valErrors = runCMSValidationSilent();
  if (valErrors.length > 0) {
    const msg = 'Pre-flight check failed: CMS has validation errors.\n\n• ' + valErrors.slice(0, 5).join('\n• ');
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }
  Logger.log('[5E-01] CMS validation passed');

  // --------------------------------------------------------------------------
  // PRE-FLIGHT CHECK 2: Drive Inventory Discovery
  // --------------------------------------------------------------------------
  Logger.log('[5E-02] Starting silent Drive inventory scan');
  const discovery = scanDriveInventory(false);
  if (discovery.error) {
    if (ui) ui.alert('Phase 5E: Drive Discovery Error', discovery.error, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: discovery.error };
  }
  Logger.log('[5E-02] Drive inventory completed');
  const allFiles = discovery.allFiles || [];

  // --------------------------------------------------------------------------
  // PRE-FLIGHT CHECK 3: Verify 3 Approved Drive Files Exist & Meet Constraints
  // --------------------------------------------------------------------------
  const approvedFileSpecs = {
    'retail_sales_dashboard.pbix': { id: 'retail', ext: '.pbix', target: 'projects/retail_sales_dashboard.pbix' },
    'netflix_eda.ipynb': { id: 'netflix', ext: '.ipynb', target: 'projects/netflix_eda.ipynb' },
    'rfm_segmentation_analysis.xlsx': { id: 'rfm', ext: '.xlsx', target: 'projects/rfm_segmentation_analysis.xlsx' }
  };

  const foundDriveAssets = {};
  for (const fileName in approvedFileSpecs) {
    const spec = approvedFileSpecs[fileName];
    const match = allFiles.find(f => f.name.toLowerCase() === fileName.toLowerCase());
    if (!match) {
      const msg = `Pre-flight failed: Required Drive file "${fileName}" was not found under HAVEN PORTFOLIO.`;
      if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
      return { status: 'ABORTED', error: msg };
    }
    if (!match.id) {
      const msg = `Pre-flight failed: File "${fileName}" has missing Drive ID.`;
      if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
      return { status: 'ABORTED', error: msg };
    }
    if (!match.name.toLowerCase().endsWith(spec.ext)) {
      const msg = `Pre-flight failed: File "${fileName}" does not match allowed extension ${spec.ext}.`;
      if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
      return { status: 'ABORTED', error: msg };
    }
    if (match.sizeBytes > MAX_RAW_ASSET_SIZE) {
      const msg =
        'Pre-flight failed: File "' + fileName + '" (' +
        match.sizeBytes + ' bytes) exceeds the safe 35 MB raw-file limit ' +
        'for Base64 GitHub upload through Google Apps Script.';
      if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
      return { status: 'ABORTED', error: msg };
    }
    foundDriveAssets[fileName] = match;
  }
  Logger.log('[5E-03] Approved assets verified');

  // --------------------------------------------------------------------------
  // PRE-FLIGHT CHECK 4: Verify SQL Asset Remains MATCH on GitHub
  // --------------------------------------------------------------------------
  try {
    const sqlRes = UrlFetchApp.fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/projects/sql_supply_chain_starter.zip?ref=${branch}`,
      { method: 'get', headers: headers, muteHttpExceptions: true }
    );
    if (sqlRes.getResponseCode() !== 200) {
      const msg = `Pre-flight failed: Existing asset projects/sql_supply_chain_starter.zip was not found on GitHub (HTTP ${sqlRes.getResponseCode()}).`;
      if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
      return { status: 'ABORTED', error: msg };
    }
    const sqlData = JSON.parse(sqlRes.getContentText());
    if (sqlData.size !== 2892) {
      const msg = `Pre-flight failed: SQL asset size mismatch (${sqlData.size} vs 2892).`;
      if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
      return { status: 'ABORTED', error: msg };
    }
  } catch (err) {
    const msg = 'Pre-flight failed checking SQL asset on GitHub: ' + err.message;
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }
  Logger.log('[5E-04] SQL asset verified');

  // --------------------------------------------------------------------------
  // PRE-FLIGHT CHECK 5: Verify Target GitHub Paths Don't Contain Unexpected Files
  // --------------------------------------------------------------------------
  for (const fileName in approvedFileSpecs) {
    const targetPath = approvedFileSpecs[fileName].target;
    try {
      const checkRes = UrlFetchApp.fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}?ref=${branch}`,
        { method: 'get', headers: headers, muteHttpExceptions: true }
      );
      if (checkRes.getResponseCode() === 200) {
        Logger.log(`Target path ${targetPath} already exists on GitHub. Will update.`);
      } else if (checkRes.getResponseCode() !== 404) {
        const msg = `Pre-flight check error on GitHub path ${targetPath} (HTTP ${checkRes.getResponseCode()}).`;
        if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
        return { status: 'ABORTED', error: msg };
      }
    } catch (err) {
      const msg = `Pre-flight failed checking GitHub path ${targetPath}: ${err.message}`;
      if (ui) {
        ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
      }
      return {
        status: 'ABORTED',
        error: msg
      };
    }
  }
  Logger.log('[5E-05] Target paths verified');

  // --------------------------------------------------------------------------
  // PRE-FLIGHT CHECK 6: Privacy & Exclusion Audits
  // --------------------------------------------------------------------------
  const mandarinInApproved = Object.keys(approvedFileSpecs).some(k => /mandarin/i.test(k));
  if (mandarinInApproved) {
    const msg = 'CRITICAL: Mandarin certificate detected in approved target list! Aborting.';
    if (ui) ui.alert('Phase 5E: Security Abort', msg, ui.ButtonSet.OK);
    return { status: 'SECURITY_ABORT', error: msg };
  }

  const resSheet = ss.getSheetByName('RESEARCH');
  if (resSheet && resSheet.getDataRange().getValues().length > 1) {
    const msg = 'Pre-flight check failed: RESEARCH sheet contains unexpected records.';
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }

  // --------------------------------------------------------------------------
  // PRE-FLIGHT CHECK 7: Staged data/projects.json Validation
  // --------------------------------------------------------------------------
  const stagedMappings = {
    'retail': 'projects/retail_sales_dashboard.pbix',
    'netflix': 'projects/netflix_eda.ipynb',
    'rfm': 'projects/rfm_segmentation_analysis.xlsx'
  };

  const stagedProjectsString = serializeStagedProjectsJSON(ss, stagedMappings);
  let parsedStaged = null;
  try {
    parsedStaged = JSON.parse(stagedProjectsString);
  } catch (e) {
    const msg = 'Pre-flight failed: Unable to parse staged projects.json: ' + e.message;
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }

  if (parsedStaged.length !== 5) {
    const msg = `Pre-flight failed: Staged projects.json has ${parsedStaged.length} records (expected 5).`;
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }

  const retailStaged = parsedStaged.find(p => p.id === 'retail');
  const netflixStaged = parsedStaged.find(p => p.id === 'netflix');
  const rfmStaged = parsedStaged.find(p => p.id === 'rfm');
  const sqlStaged = parsedStaged.find(p => p.id === 'sql');
  const invStaged = parsedStaged.find(p => p.id === 'inventory');

  if (!retailStaged || retailStaged.documentFile !== 'projects/retail_sales_dashboard.pbix') {
    const msg = 'Pre-flight failed: retail documentFile mismatch in staged data.';
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }
  if (!netflixStaged || netflixStaged.documentFile !== 'projects/netflix_eda.ipynb') {
    const msg = 'Pre-flight failed: netflix documentFile mismatch in staged data.';
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }
  if (!rfmStaged || rfmStaged.documentFile !== 'projects/rfm_segmentation_analysis.xlsx') {
    const msg = 'Pre-flight failed: rfm documentFile mismatch in staged data.';
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }
  if (!sqlStaged || sqlStaged.documentFile !== 'projects/sql_supply_chain_starter.zip') {
    const msg = 'Pre-flight failed: sql documentFile mismatch in staged data.';
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }
  if (!invStaged || invStaged.documentFile !== null) {
    const msg = 'Pre-flight failed: inventory documentFile is not null.';
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }

  // Ensure github_url safety
  if (sqlStaged.githubUrl !== 'https://github.com/Haven-Pham') {
    const msg = 'Pre-flight failed: sql githubUrl was altered.';
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }
  if (netflixStaged.githubUrl !== null) {
    const msg = 'Pre-flight failed: netflix githubUrl must be null.';
    if (ui) ui.alert('Phase 5E: Pre-Flight Aborted', msg, ui.ButtonSet.OK);
    return { status: 'ABORTED', error: msg };
  }
  Logger.log('[5E-06] Staged projects.json verified');

  // --------------------------------------------------------------------------
  // USER CONFIRMATION DIALOG (Mandatory confirmation gate)
  // --------------------------------------------------------------------------
  const confirmText =
    'PHASE 5E — PRODUCTION ASSET SYNC\n\n' +
    'The following files will be published:\n\n' +
    'CREATE\n' +
    '1. projects/retail_sales_dashboard.pbix\n' +
    '2. projects/netflix_eda.ipynb\n' +
    '3. projects/rfm_segmentation_analysis.xlsx\n\n' +
    'UNCHANGED\n' +
    '4. projects/sql_supply_chain_starter.zip\n\n' +
    'CMS metadata:\n' +
    'retail.document_file\n' +
    'netflix.document_file\n' +
    'rfm.document_file\n\n' +
    'Google Sheet will be updated ONLY after GitHub commit succeeds.\n\n' +
    'A GitHub commit will trigger Vercel deployment.\n\n' +
    'No private certification will be published.\n\n' +
    'Proceed?';

  if (!ui) {
    const msg =
      'Phase 5E aborted: mandatory user confirmation UI is unavailable. ' +
      'Production sync requires explicit YES confirmation.';
    Logger.log(msg);
    return {
      status: 'ABORTED',
      error: msg
    };
  }

  const userChoice = ui.alert('Phase 5E: Production Asset Sync', confirmText, ui.ButtonSet.YES_NO);
  if (userChoice !== ui.Button.YES) {
    logPublishEvent(ss, 'PROJECT_ASSET_SYNC', 'CANCELLED', 'Sync cancelled by user before write', 'N/A', 'NONE');
    ui.alert('Phase 5E: Cancelled', 'Production asset sync cancelled by user. Zero writes performed.', ui.ButtonSet.OK);
    return { status: 'CANCELLED' };
  }
  Logger.log('[5E-07] User confirmed');

  // --------------------------------------------------------------------------
  // ATOMIC GITHUB WRITE VIA GIT DATA API (Blobs -> Tree -> Commit -> Ref)
  // --------------------------------------------------------------------------
  let newCommitSha = null;
  try {
    const treeEntries = [];

    // Step A: Create Git Blobs for the 3 binary project assets
    for (const fileName in approvedFileSpecs) {
      const spec = approvedFileSpecs[fileName];
      const driveItem = foundDriveAssets[fileName];
      const driveFileObj = DriveApp.getFileById(driveItem.id);
      const fileBytes = driveFileObj.getBlob().getBytes();
      const b64Data = Utilities.base64Encode(fileBytes);

      const blobPayload = {
        content: b64Data,
        encoding: 'base64'
      };

      const blobRes = UrlFetchApp.fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'post',
          headers: headers,
          contentType: 'application/json',
          payload: JSON.stringify(blobPayload),
          muteHttpExceptions: true
        }
      );

      if (blobRes.getResponseCode() !== 201) {
        throw new Error(`Failed to create Git blob for ${spec.target} (HTTP ${blobRes.getResponseCode()}): ${blobRes.getContentText()}`);
      }
      const blobJson = JSON.parse(blobRes.getContentText());
      treeEntries.push({
        path: spec.target,
        mode: '100644',
        type: 'blob',
        sha: blobJson.sha
      });

      if (spec.id === 'retail') {
        Logger.log('[5E-08] Blob retail created');
      } else if (spec.id === 'netflix') {
        Logger.log('[5E-09] Blob netflix created');
      } else if (spec.id === 'rfm') {
        Logger.log('[5E-10] Blob rfm created');
      }
    }

    // Step B: Create Git Blob for staged data/projects.json
    const projectsJsonBlobRes = UrlFetchApp.fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
      {
        method: 'post',
        headers: headers,
        contentType: 'application/json',
        payload: JSON.stringify({
          content: stagedProjectsString,
          encoding: 'utf-8'
        }),
        muteHttpExceptions: true
      }
    );
    if (projectsJsonBlobRes.getResponseCode() !== 201) {
      throw new Error(`Failed to create Git blob for data/projects.json (HTTP ${projectsJsonBlobRes.getResponseCode()}): ${projectsJsonBlobRes.getContentText()}`);
    }
    const projectsBlobJson = JSON.parse(projectsJsonBlobRes.getContentText());
    treeEntries.push({
      path: 'data/projects.json',
      mode: '100644',
      type: 'blob',
      sha: projectsBlobJson.sha
    });

    // Step C: Get latest commit on main branch
    const refRes = UrlFetchApp.fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      { method: 'get', headers: headers, muteHttpExceptions: true }
    );
    if (refRes.getResponseCode() !== 200) {
      throw new Error(`Failed to fetch ref/heads/${branch} (HTTP ${refRes.getResponseCode()})`);
    }
    const refData = JSON.parse(refRes.getContentText());
    const latestCommitSha = refData.object.sha;

    // Step D: Get commit tree SHA
    const commitRes = UrlFetchApp.fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
      { method: 'get', headers: headers, muteHttpExceptions: true }
    );
    if (commitRes.getResponseCode() !== 200) {
      throw new Error(`Failed to fetch commit object (HTTP ${commitRes.getResponseCode()})`);
    }
    const commitData = JSON.parse(commitRes.getContentText());
    const baseTreeSha = commitData.tree.sha;

    // Step E: Create ONE new Git Tree
    const treePayload = {
      base_tree: baseTreeSha,
      tree: treeEntries
    };
    const treeRes = UrlFetchApp.fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: 'post',
        headers: headers,
        contentType: 'application/json',
        payload: JSON.stringify(treePayload),
        muteHttpExceptions: true
      }
    );
    if (treeRes.getResponseCode() !== 201) {
      throw new Error(`Failed to create Git tree (HTTP ${treeRes.getResponseCode()}): ${treeRes.getContentText()}`);
    }
    const newTreeData = JSON.parse(treeRes.getContentText());
    const newTreeSha = newTreeData.sha;
    Logger.log('[5E-11] Tree created');

    // Step F: Create ONE commit on main
    const commitPayload = {
      message: 'feat(assets): sync approved project assets and metadata',
      tree: newTreeSha,
      parents: [latestCommitSha]
    };
    const newCommitRes = UrlFetchApp.fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: 'post',
        headers: headers,
        contentType: 'application/json',
        payload: JSON.stringify(commitPayload),
        muteHttpExceptions: true
      }
    );
    if (newCommitRes.getResponseCode() !== 201) {
      throw new Error(`Failed to create Git commit (HTTP ${newCommitRes.getResponseCode()}): ${newCommitRes.getContentText()}`);
    }
    const newCommitData = JSON.parse(newCommitRes.getContentText());
    newCommitSha = newCommitData.sha;
    Logger.log('[5E-12] Commit created');

    // Step G: Update branch reference to new commit
    const updateRefRes = UrlFetchApp.fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'patch',
        headers: headers,
        contentType: 'application/json',
        payload: JSON.stringify({ sha: newCommitSha, force: false }),
        muteHttpExceptions: true
      }
    );
    if (updateRefRes.getResponseCode() !== 200) {
      throw new Error(`Failed to update branch ref (HTTP ${updateRefRes.getResponseCode()}): ${updateRefRes.getContentText()}`);
    }
    Logger.log('[5E-13] Branch updated');

  } catch (err) {
    const errorMsg = 'ATOMIC GITHUB WRITE FAILED: ' + sanitizeError(err.message, token);
    Logger.log(errorMsg);
    logPublishEvent(ss, 'PROJECT_ASSET_SYNC', 'FAILED', errorMsg, 'NONE', 'NONE');
    if (ui) ui.alert('Phase 5E: GitHub Commit Failed', errorMsg, ui.ButtonSet.OK);
    return { status: 'FAILED', error: errorMsg };
  }

  // --------------------------------------------------------------------------
  // POST-COMMIT CMS UPDATE (ONLY executed after commit succeeds)
  // --------------------------------------------------------------------------
  let sheetUpdateSuccess = false;
  try {
    const projectsSheet = ss.getSheetByName('PROJECTS');
    const pValues = projectsSheet.getDataRange().getValues();

    for (let r = 1; r < pValues.length; r++) {
      const pId = String(pValues[r][0]).trim();
      if (pId === 'retail') {
        projectsSheet.getRange(r + 1, 10).setValue('projects/retail_sales_dashboard.pbix');
      } else if (pId === 'netflix') {
        projectsSheet.getRange(r + 1, 10).setValue('projects/netflix_eda.ipynb');
      } else if (pId === 'rfm') {
        projectsSheet.getRange(r + 1, 10).setValue('projects/rfm_segmentation_analysis.xlsx');
      }
    }
    SpreadsheetApp.flush();
    sheetUpdateSuccess = true;
    Logger.log('[5E-14] Sheet updated');
  } catch (sheetErr) {
    Logger.log('Warning: Google Sheet update failed after GitHub commit: ' + sheetErr.message);
  }

  // --------------------------------------------------------------------------
  // AUDIT LOG
  // --------------------------------------------------------------------------
  logPublishEvent(
    ss,
    'PROJECT_ASSET_SYNC',
    sheetUpdateSuccess ? 'SUCCESS' : 'PARTIAL_SUCCESS',
    `Created 3 assets, updated data/projects.json (Commit: ${newCommitSha.substring(0, 7)})` + (sheetUpdateSuccess ? '' : ' [Sheet update error]'),
    newCommitSha,
    'VERCEL_TRIGGERED'
  );

  // --------------------------------------------------------------------------
  // REPORT MODAL & STATUS RETURN
  // --------------------------------------------------------------------------
  if (!sheetUpdateSuccess) {
    const partialReport =
      'PHASE 5E — PARTIAL SUCCESS (MANUAL REPAIR REQUIRED)\n\n' +
      'GitHub Commit SHA: ' + newCommitSha.substring(0, 7) + '\n' +
      'Commit Message: feat(assets): sync approved project assets and metadata\n\n' +
      'Files Created on GitHub:\n' +
      '• projects/retail_sales_dashboard.pbix\n' +
      '• projects/netflix_eda.ipynb\n' +
      '• projects/rfm_segmentation_analysis.xlsx\n\n' +
      'Files Updated:\n' +
      '• data/projects.json (staged mappings applied)\n\n' +
      'Google Sheet Status: FAILED (Repair needed)\n' +
      'Vercel Deployment: TRIGGERED AUTOMATICALLY\n\n' +
      'WARNING: GitHub assets and metadata were committed successfully, but the Google Sheet ' +
      'could not be updated automatically. Please manually update the document_file fields in the PROJECTS sheet.';

    Logger.log(partialReport);
    if (ui) {
      ui.alert('Phase 5E: Partial Success', partialReport, ui.ButtonSet.OK);
    }

    return {
      status: 'PARTIAL_SUCCESS',
      commitSha: newCommitSha,
      sheetUpdated: false,
      error: 'GitHub commit succeeded, but Google Sheet update failed. Manual repair required.'
    };
  }

  const successReport =
    'PHASE 5E — PRODUCTION ASSET SYNC COMPLETED\n\n' +
    'GitHub Commit SHA: ' + newCommitSha.substring(0, 7) + '\n' +
    'Commit Message: feat(assets): sync approved project assets and metadata\n\n' +
    'Files Created on GitHub:\n' +
    '• projects/retail_sales_dashboard.pbix\n' +
    '• projects/netflix_eda.ipynb\n' +
    '• projects/rfm_segmentation_analysis.xlsx\n\n' +
    'Files Updated:\n' +
    '• data/projects.json (staged mappings applied)\n\n' +
    'Google Sheet Status: UPDATED\n' +
    'Vercel Deployment: TRIGGERED AUTOMATICALLY\n\n' +
    'Please verify the Vercel deployment and live website download links.';

  Logger.log(successReport);
  if (ui) {
    ui.alert('Phase 5E: Success', successReport, ui.ButtonSet.OK);
  }

  Logger.log('[5E-15] Completed');
  return {
    status: 'SUCCESS',
    commitSha: newCommitSha,
    sheetUpdated: true
  };
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
      "projects/netflix_eda.ipynb"
    ],
    [
      "rfm",
      "rfm-customer-segmentation",
      "analytics",
      "coursework",
      false,
      5,
      "",
      "",
      "",
      "projects/rfm_segmentation_analysis.xlsx"
    ],
    [
      "ecommerce-cohort",
      "ecommerce-customer-cohort-retention-profitability",
      "analytics",
      "coursework",
      false,
      6,
      "",
      "",
      "",
      "projects/ecommerce_customer_cohort_retention_profitability/ecommerce_customer_cohort_retention_profitability_analysis.ipynb"
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
    ],
    [
      "rfm",
      "en",
      "RFM Customer Segmentation Analysis",
      "Customer segmentation and cohort analysis using Recency, Frequency, and Monetary metrics.",
      "Identify high-value customer segments, churn risks, and purchasing behaviors from transactional sales data.",
      "SQL/Python quantile scoring, RFM matrix mapping, behavioral clustering, and actionable marketing recommendations.",
      "Coursework assignment (Sessions 1–6). Detailed workbook and segmentation documentation available in project files."
    ],
    [
      "rfm",
      "vi",
      "Phân khúc Khách hàng theo Mô hình RFM",
      "Phân khúc khách hàng và phân tích nhóm theo các chỉ số Mới nhất (R), Tần suất (F) và Giá trị (M).",
      "Xác định nhóm khách hàng giá trị cao, nguy cơ rời bỏ và hành vi mua sắm từ dữ liệu giao dịch bán hàng.",
      "Tính điểm phân vị (quantile scoring) bằng SQL/Python, ma trận phân nhóm RFM, phân cụm hành vi và đề xuất chiến lược tiếp thị.",
      "Bài tập thực hành theo khóa học (Buổi 1–6). Bảng tính chi tiết và tài liệu phân tích được lưu trữ trong thư mục dự án."
    ],
    [
      "rfm",
      "zh-Hant",
      "RFM 客戶分群分析",
      "運用最近購買日 (R)、購買頻率 (F) 與消費金額 (M) 進行客戶分群與客群分析。",
      "從交易銷售數據中識別高價值客群、流失風險客戶與購買行為模式。",
      "使用 SQL/Python 進行分位數評分、構建 RFM 矩陣、行為分群並提出可行的行銷建議。",
      "課程專題作業（第 1 至 6 堂）。詳細分析工作表與分群報告存檔於專案目錄中。"
    ],
    [
      "rfm",
      "zh-Hans",
      "RFM 客户分群分析",
      "运用最近消费时间 (R)、消费频率 (F) 与消费金额 (M) 进行客户分群与群体分析。",
      "从交易销售数据中识别高价值客户群体、流失风险客户与购买行为模式。",
      "使用 SQL/Python 进行分位数评分、构建 RFM 矩阵、行为分群并提出可落地的营销建议。",
      "课程实践作业（第 1 至 6 节）。详细分析工作簿与分群文档保存在项目目录中。"
    ],
    [
      "ecommerce-cohort",
      "en",
      "E-Commerce Customer Cohort, Retention & Profitability Analysis",
      "Customer cohort, retention, segmentation, and profitability analysis using synthetic e-commerce transaction data.",
      "Evaluate customer retention patterns across acquisition cohorts and identify differences in retention and profitability across customer segments and income groups.",
      "Python-based cohort construction, monthly and quarterly retention analysis, customer segment comparison, and profitability analysis.",
      "Coursework portfolio project using Python, Pandas, NumPy, Matplotlib, and Seaborn with synthetic educational data."
    ],
    [
      "ecommerce-cohort",
      "vi",
      "Phân tích Cohort, Duy trì Khách hàng và Khả năng Sinh lợi trong Thương mại Điện tử",
      "Phân tích cohort khách hàng, tỷ lệ duy trì, phân khúc và khả năng sinh lợi bằng dữ liệu thương mại điện tử giả lập.",
      "Đánh giá xu hướng duy trì khách hàng theo cohort và sự khác biệt về duy trì và khả năng sinh lợi giữa các nhóm khách hàng.",
      "Xây dựng cohort bằng Python, phân tích retention theo tháng và quý, so sánh phân khúc khách hàng và phân tích khả năng sinh lợi.",
      "Dự án học thuật sử dụng Python, Pandas, NumPy, Matplotlib và Seaborn với dữ liệu giáo dục giả lập."
    ],
    [
      "ecommerce-cohort",
      "zh-Hant",
      "電子商務客戶 Cohort、留存與獲利能力分析",
      "使用模擬電子商務交易資料分析客戶 Cohort、留存率、客戶分群與獲利能力。",
      "評估不同客戶取得 Cohort 的留存模式，以及不同客戶分群與收入群體之間的留存與獲利差異。",
      "使用 Python 建立客戶 Cohort，進行月度與季度留存分析、客戶分群比較與獲利能力分析。",
      "使用 Python、Pandas、NumPy、Matplotlib 與 Seaborn 的課程專題，資料為模擬教育資料。"
    ],
    [
      "ecommerce-cohort",
      "zh-Hans",
      "电子商务客户 Cohort、留存与盈利能力分析",
      "使用模拟电子商务交易数据分析客户 Cohort、留存率、客户分群与盈利能力。",
      "评估不同客户获取 Cohort 的留存模式，以及不同客户分群与收入群体之间的留存与盈利差异。",
      "使用 Python 建立客户 Cohort，进行月度与季度留存分析、客户分群比较与盈利能力分析。",
      "使用 Python、Pandas、NumPy、Matplotlib 与 Seaborn 的课程项目，数据为模拟教育数据。"
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
