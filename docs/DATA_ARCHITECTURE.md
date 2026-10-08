# Data Architecture & CMS Foundation Specification
**Project:** Pham Hong Hieu (Haven - 范鴻孝) Personal Portfolio  
**Phase:** Phase 1 — Data Layer Foundation  
**Branch:** `portfolio-cms-foundation`

---

## 1. Overview & Objectives

In Phase 1, the portfolio's data layer has been decoupled from the monolithic JavaScript file (`content.js`) into modular, structured JSON files inside the `data/` directory.

The system is designed with a **dual-mode resilient architecture**:
1. **Production & Localhost (`http://`, `https://`):** Dynamically loads normalized JSON files asynchronously from `data/*.json`.
2. **Local Offline Preview (`file:///`):** Seamlessly falls back to `content.js` if browser CORS restrictions block `fetch()` on `file:///` URLs.

---

## 2. Comparison: Old vs. New Architecture

### 2.1 Old Architecture
- **Source of Truth:** A single ~43.6 KB file ([content.js](file:///c:/Users/haven/OneDrive/Documents/GitHub/Portfolio/content.js)) containing JavaScript objects.
- **Data Access:** Synchronously assigned to the global `window` object (`window.PORTFOLIO_CONFIG`, `window.PORTFOLIO_RECORDS`, `window.PORTFOLIO_I18N`).
- **Limitation:** To add a project, experience, or certificate, code had to be manually edited across multiple sections in `content.js`. Automating this with external tools (such as Google Sheets or Google Drive) would require complex JavaScript file rewriting.

```
┌────────────────┐      ┌────────────────┐
│   content.js   │ ──►  │    main.js     │ ──► DOM Rendering
└────────────────┘      └────────────────┘
```

### 2.2 New Architecture
- **Source of Truth:** Modular JSON files under `data/`:
  - `data/profile.json`
  - `data/experience.json`
  - `data/projects.json`
  - `data/certifications.json`
  - `data/research.json`
  - `data/i18n.json`
- **Data Access:** [main.js](file:///c:/Users/haven/OneDrive/Documents/GitHub/Portfolio/main.js) initializes with fallback data, concurrently requests `data/*.json` over HTTP, updates state, and renders the interface.
- **Fallback Guarantee:** If `fetch()` fails (e.g., opened locally via double-clicking `index.html` under `file:///`), [content.js](file:///c:/Users/haven/OneDrive/Documents/GitHub/Portfolio/content.js) ensures the portfolio works immediately with zero breakage.

```
┌─────────────────────────────────┐
│          data/*.json            │
│  (profile, exp, proj, cert,     │
│   research, i18n)               │
└───────────────┬─────────────────┘
                │ (HTTP / HTTPS fetch)
                ▼
┌─────────────────────────────────┐
│            main.js              │ ◄─── Fallback to content.js (if file:///)
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│        Live Portfolio DOM       │
└─────────────────────────────────┘
```

---

## 3. Data Files & Field Definitions

### 3.1 `data/profile.json`
Stores top-level profile links and public identifiers.

```json
{
  "email": "havenpham63729@gmail.com",
  "linkedin": "https://www.linkedin.com/in/havenpham",
  "github": "https://github.com/Haven-Pham",
  "resume": "assets/Pham_Hong_Hieu_CV_DRAFT.pdf",
  "profileImage": "assets/profile.jpg"
}
```

| Field | Type | Description |
|---|---|---|
| `email` | `string` | Primary contact email, used in buttons and clipboard copy. |
| `linkedin` | `string` | Public LinkedIn profile URL. |
| `github` | `string` | Public GitHub profile URL. |
| `resume` | `string` | Relative path or URL to downloadable CV PDF. |
| `profileImage` | `string` | Relative path to profile photograph. |

---

### 3.2 `data/experience.json`
Array of professional roles and operational background records.

```json
[
  {
    "id": "hoa-sen",
    "category": "planning",
    "initials": "HS",
    "period": "Oct 2024 – Apr 2025",
    "className": "hoa"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique alphanumeric identifier matching keys in `i18n.json`. |
| `category` | `string` | Filter category (`planning` or `logistics`). |
| `initials` | `string` | 2-character monogram displayed in the company icon box. |
| `period` | `string` | Default fallback date range string. |
| `className` | `string` | CSS class for custom icon color accents (`hoa`, `kodai`, `vietlog`). |

*Note:* Role titles, organization names, summaries, and bullet points are stored in `data/i18n.json` under `experienceData[id]`.

---

### 3.3 `data/projects.json`
Array of featured portfolio projects and case studies.

```json
[
  {
    "id": "retail",
    "category": "analytics",
    "icon": "▥",
    "chips": ["Power BI", "DAX", "KPIs"],
    "status": "development",
    "number": "01"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique project slug matching keys in `i18n.json`. |
| `category` | `string` | Filter tab category (`analytics`, `sql`, `supply`). |
| `icon` | `string` | Unicode visual icon glyph displayed on the project card. |
| `chips` | `string[]` | List of technology and skill tags. |
| `status` | `string` | Project lifecycle status: `development`, `starter`, `concept`, `coursework`. |
| `number` | `string` | Display index badge (`01`, `02`, etc.). |

*Note:* Titles, problem goals, analytical methods, and current state evidence are stored in `data/i18n.json` under `projectData[id]`.

---

### 3.4 `data/certifications.json`
Array of skill evaluations, certifications, and course credentials.

```json
[
  {
    "id": "hr-advanced",
    "provider": "HackerRank",
    "type": "hacker",
    "when": "Jun 26, 2026",
    "mark": "H",
    "asset": "assets/certificates/hackerrank-sql-advanced.jpg",
    "kind": "assessment"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique credential slug matching keys in `i18n.json`. |
| `provider` | `string` | Issuing organization (`HackerRank`, `DataCamp`, `Yuan Ze University`). |
| `type` | `string` | Filter category: `hacker`, `datacamp`, `language`. |
| `when` | `string` | Date string parseable by `new Date()` (formatted locally per language). |
| `mark` | `string` | Visual badge abbreviation (`H`, `DC`, `YZ`). |
| `asset` | `string \| null` | Path to certificate image/PDF. If `null`, rendered as "PRIVATE RECORD". |
| `kind` | `string` | Credential type: `assessment` (skill test) or `course` (course completion). |

---

### 3.5 `data/research.json`
Schema for future academic publications, patent analyses, and research papers.

```json
[]
```

*Planned schema for future additions:*
```json
[
  {
    "id": "patent-landscape-2026",
    "title": "Patent Analysis & Technology Convergence in Supply Chain Automation",
    "year": "2026",
    "venue": "Global MBA Working Paper",
    "abstract": "...",
    "pdf": "assets/research/paper.pdf",
    "tags": ["Patent Analysis", "ERP", "Supply Chain"]
  }
]
```

---

### 3.6 `data/i18n.json`
Multilingual dictionary containing all strings for the 4 supported locales:
- `en`: English
- `vi`: Tiếng Việt
- `zh-Hant`: 繁體中文
- `zh-Hans`: 简体中文

Each locale dictionary contains:
1. **Static UI Labels:** Navigation links, hero titles, about statements, stat descriptions, button text, dialog labels, footer notes.
2. **`experienceData`:** Keyed by experience ID (`hoa-sen`, `kodai`, `vietlog`), providing `role`, `org`, `summary`, and `bullets`.
3. **`projectData`:** Keyed by project ID (`retail`, `sql`, `inventory`, `netflix`), providing `title`, `description`, `goal`, `methods`, and `evidence`.
4. **`certNames`:** Keyed by certificate ID, providing localized credential titles.
5. **`stages`:** 6-step operational workflow sequence (`number`, `name`, `sub`, `desc`, `tools`).
6. **`skillsGroups`:** 4 categorized skill groups.
7. **`communities`:** Extracurricular and community learning highlights.

---

## 4. Frontend Integration (`main.js`)

[main.js](file:///c:/Users/haven/OneDrive/Documents/GitHub/Portfolio/main.js) interacts with the data layer via the following pattern:

1. **Synchronous Initialization:**
   ```javascript
   let PACKS = window.PORTFOLIO_I18N || {};
   let DATA = window.PORTFOLIO_RECORDS || { experience: [], projects: [], certificates: [] };
   let CONFIG = window.PORTFOLIO_CONFIG || {};
   ```
2. **Immediate First Render:**
   Calls `applyTranslation()` synchronously, ensuring zero layout shift and instant rendering from bundled data.
3. **Asynchronous JSON Hydration:**
   `loadDataFromJSON()` executes via `fetch()` against `data/*.json`. If successful, it updates `CONFIG`, `DATA`, `PACKS` and re-runs `applyTranslation()`.
4. **CORS / Offline Protection:**
   The `fetch()` calls are wrapped in a `try...catch` block. If local browser security prevents `file:///` AJAX requests, the exception is absorbed, and the bundled data continues driving the page.
5. **Null Safety & Resilience:**
   `renderExperience()` and `renderProjects()` use optional chaining (`?.`) to gracefully handle any record missing its corresponding translation entry.
