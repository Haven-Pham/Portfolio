# Google Sheet CMS & Google Drive Architecture
**Project:** Pham Hong Hieu (Haven - 范鴻孝) Personal Portfolio  
**Phase:** Phase 2 — Google Sheet CMS + Google Drive Foundation  
**Branch:** `portfolio-cms-foundation`

---

## 1. Overview & Objectives

Phase 2 establishes the foundation for managing the portfolio through **Google Sheets** and **Google Drive**, eliminating manual file editing in JavaScript code while strictly preserving the existing design, layout, multilingual integrity, and responsive behavior.

```
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│          Google Drive           │        │       Google Spreadsheet        │
│        (HAVEN PORTFOLIO)        │        │      (Haven Portfolio CMS)      │
│  - 01_PROJECTS                  │        │  1. CONFIG       5. EXP_CONTENT │
│  - 02_CERTIFICATIONS            │        │  2. PROJECTS     6. CERTS       │
│  - 03_PROFILE                   │        │  3. PROJ_CONTENT 7. RESEARCH    │
│  - 04_RESEARCH                  │        │  4. EXPERIENCE   8. PUBLISH_LOG │
└────────────────┬────────────────┘        └────────────────┬────────────────┘
                 │                                          │
                 └────────────────────┬─────────────────────┘
                                      ▼
                      ┌───────────────────────────────┐
                      │      Google Apps Script       │
                      │  - Validate CMS Data          │
                      │  - Serialize to data/*.json   │
                      │  - Sync to GitHub (Phase 3)   │
                      └───────────────┬───────────────┘
                                      ▼
                      ┌───────────────────────────────┐
                      │       GitHub Repository       │
                      │     (Haven-Pham/Portfolio)    │
                      └───────────────┬───────────────┘
                                      ▼
                      ┌───────────────────────────────┐
                      │       Vercel Deployment       │
                      │     (Global Edge Network)     │
                      └───────────────────────────────┘
```

---

## 2. Google Sheet Structure

The spreadsheet **Haven Portfolio CMS** consists of **8 normalized sheets**:

### 2.1 `CONFIG`
Global settings and repository target paths.
* **Columns:** `Key`, `Value`
* **Default Rows:**
  * `GITHUB_OWNER`: `Haven-Pham`
  * `GITHUB_REPO`: `Portfolio`
  * `GITHUB_BRANCH`: `main`
  * `PROJECTS_JSON_PATH`: `data/projects.json`
  * `CERTIFICATIONS_JSON_PATH`: `data/certifications.json`
  * `EXPERIENCE_JSON_PATH`: `data/experience.json`
  * `RESEARCH_JSON_PATH`: `data/research.json`
  * `I18N_JSON_PATH`: `data/i18n.json`
  * `DRIVE_ROOT_FOLDER_ID`: `PENDING_SETUP` (populated when Google Drive folder is connected)

### 2.2 `PROJECTS`
Structural attributes of projects.
* **Columns:** `id`, `slug`, `category`, `status`, `featured`, `sort_order`, `github_url`, `demo_url`, `cover_file`, `document_file`
* **Validation Rules:**
  * `id`: Unique alphanumeric key matching `PROJECT_CONTENT`.
  * `category`: One of `analytics`, `sql`, `supply`.
  * `status`: One of `development`, `starter`, `concept`, `coursework`.
  * `featured`: Boolean (`TRUE` or `FALSE`).
  * `sort_order`: Numeric integer determining display priority.

### 2.3 `PROJECT_CONTENT`
Multilingual titles, descriptions, and case study details.
* **Columns:** `project_id`, `language`, `title`, `short_description`, `problem`, `approach`, `evidence`
* **Validation Rules:**
  * `project_id`: Must reference a valid `id` in `PROJECTS`.
  * `language`: Must be one of `en`, `vi`, `zh-Hant`, `zh-Hans`.
  * `(project_id, language)`: Unique compound key (no duplicates allowed).

### 2.4 `EXPERIENCE`
Career history metadata.
* **Columns:** `id`, `company`, `position`, `start_date`, `end_date`, `category`, `sort_order`
* **Validation Rules:**
  * `id`: Unique key matching `EXPERIENCE_CONTENT` (`hoa-sen`, `kodai`, `vietlog`).
  * `category`: One of `planning`, `logistics`.
  * `sort_order`: Numeric integer.

### 2.5 `EXPERIENCE_CONTENT`
Multilingual role summaries and bulleted achievements.
* **Columns:** `experience_id`, `language`, `summary`, `responsibilities`
* **Validation Rules:**
  * `experience_id`: Must reference a valid `id` in `EXPERIENCE`.
  * `language`: One of `en`, `vi`, `zh-Hant`, `zh-Hans`.
  * `responsibilities`: Newline-separated bullet points (`\n`).

### 2.6 `CERTIFICATIONS`
Professional certifications and course accomplishments.
* **Columns:** `id`, `name`, `provider`, `date`, `category`, `file`, `verification_url`, `featured`, `sort_order`
* **Validation Rules:**
  * `id`: Unique slug (`hr-advanced`, `dc-powerbi`, `mandarin`, etc.).
  * `category`: One of `hacker`, `datacamp`, `language`.
  * `file`: Relative asset path or `[PRIVATE RECORD]` for restricted certificates.
  * **Privacy Guarantee:** If `file` is `[PRIVATE RECORD]`, the frontend renders a non-clickable "PRIVATE RECORD" badge.

### 2.7 `RESEARCH`
Academic papers, patent analyses, and working studies.
* **Columns:** `id`, `title`, `type`, `year`, `status`, `url`, `featured`, `sort_order`
* **Status:** Initialized with headers only.

### 2.8 `PUBLISH_LOG`
Audit trail of synchronization actions.
* **Columns:** `timestamp`, `action`, `status`, `message`, `commit_sha`, `deployment_url`

---

## 3. Google Drive Structure

Drive assets are organized within a dedicated root folder:

```
HAVEN PORTFOLIO/
├── 01_PROJECTS/          (Project cover images, diagrams, starter ZIP archives)
├── 02_CERTIFICATIONS/    (PDF certificates, HackerRank badges, completion scans)
├── 03_PROFILE/           (Profile photos, draft and finalized CV PDFs)
└── 04_RESEARCH/          (Research whitepapers, patent analysis PDFs)
```

The script function `createDriveFolderStructure()` automatically detects or creates this hierarchy and writes the root folder's ID into `CONFIG!B10`.

---

## 4. Four-Language Representation

The CMS maintains strict 100% parity across all four supported languages:
* `en` (English)
* `vi` (Tiếng Việt)
* `zh-Hant` (繁體中文)
* `zh-Hans` (简体中文)

In the database, content is stored in normalized 1:many tables (`PROJECT_CONTENT` and `EXPERIENCE_CONTENT`). The Apps Script serializer groups rows by language when generating `data/i18n.json`, ensuring zero missing translations or broken keys.

---

## 5. Security Model

1. **Zero Hardcoded Secrets:**
   * No API keys, personal access tokens, passwords, or client secrets are stored in Google Sheet cells, formulas, or repository code.
2. **PropertiesService Isolation:**
   * In Phase 3, GitHub Personal Access Tokens (PAT) will be stored exclusively in Apps Script's private key store:
     ```javascript
     PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
     ```
3. **Phase 2 Publishing Safety Guard:**
   * The `publishWebsite()` function is strictly blocked in Phase 2. Attempting to trigger it displays a dialog:
     `"Production publishing is disabled during Phase 2."`

---

## 6. How a User Will Add a Project (Phase 3 Preview)

1. **Upload Asset:** Place project screenshots or downloadable starter packs into `Google Drive / HAVEN PORTFOLIO / 01_PROJECTS`.
2. **Add Record:** In the `PROJECTS` sheet, insert a new row with:
   * `id`: e.g. `patent-nlp`
   * `slug`: `patent-nlp-analysis`
   * `category`: `analytics`
   * `status`: `development`
   * `featured`: `TRUE`
   * `sort_order`: `5`
3. **Add Content:** In `PROJECT_CONTENT`, add 4 rows for `patent-nlp` across `en`, `vi`, `zh-Hant`, and `zh-Hans`.
4. **Validate:** In the spreadsheet menu, click **HAVEN PORTFOLIO > Validate CMS**.
5. **Publish:** Click **HAVEN PORTFOLIO > Publish Website** (enabled in Phase 3). Apps Script updates `data/*.json`, commits to GitHub, and Vercel automatically deploys within 15 seconds.

---

## 7. How a User Will Add a Certification

1. **Upload File:** Place the certificate PDF/JPG in `Google Drive / HAVEN PORTFOLIO / 02_CERTIFICATIONS`.
2. **Add Record:** In `CERTIFICATIONS`, append a row:
   * `id`: `dc-python`
   * `name`: `Intermediate Python for Finance`
   * `provider`: `DataCamp`
   * `date`: `2026-11-01`
   * `category`: `datacamp`
   * `file`: `assets/certificates/datacamp-intermediate-python.pdf`
   * `featured`: `TRUE`
   * `sort_order`: `8`
3. **Validate & Publish:** Run **Validate CMS**, then **Publish Website**.
