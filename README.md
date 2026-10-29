# Pham Hong Hieu (Haven - 范鴻孝) | Portfolio (EN / VI / 繁體 / 简体)

**Live:** https://haven-portfolio02.vercel.app · **GitHub:** https://github.com/Haven-Pham

**Static website. No build step, npm install or framework required.**

Open `index.html` in Chrome or Edge, or serve the folder (`python -m http.server`). Switch language in the header and toggle dark/light theme.

## Technology

HTML5, CSS3 and vanilla JavaScript. `data/*.json` is the source of truth; `main.js` loads it over HTTP and falls back to `content.js` when opened from `file:///`. `motion.js` handles the hero entrance and scroll animations.

## What's inside?

- Sections: About, Education, Experience, Certifications, Projects (with a live GitHub feed), Research, Workflow & Stack, Community, Contact.
- Four complete content sets: English, Vietnamese, Traditional Chinese, Simplified Chinese.
- Projects link to their own repositories:
  [fnb-supply-chain-analytics](https://github.com/Haven-Pham/fnb-supply-chain-analytics) ·
  [transport-logistics-otif-analytics](https://github.com/Haven-Pham/transport-logistics-otif-analytics) ·
  [ProtoSetFit](https://github.com/Haven-Pham/ProtoSetFit) ·
  [ecommerce-cohort-retention-analysis](https://github.com/Haven-Pham/ecommerce-cohort-retention-analysis) ·
  [product-funnel-conversion-analysis](https://github.com/Haven-Pham/product-funnel-conversion-analysis) ·
  [customer-journey-sankey-analysis](https://github.com/Haven-Pham/customer-journey-sankey-analysis) ·
  [marketing-channel-pareto-analysis](https://github.com/Haven-Pham/marketing-channel-pareto-analysis) ·
  [abc-customer-profit-analysis](https://github.com/Haven-Pham/abc-customer-profit-analysis) ·
  [rfm-customer-segmentation](https://github.com/Haven-Pham/rfm-customer-segmentation) ·
  [market-basket-analysis](https://github.com/Haven-Pham/market-basket-analysis) ·
  [netflix-content-eda](https://github.com/Haven-Pham/netflix-content-eda) ·
  [otd-decline-issue-tree](https://github.com/Haven-Pham/otd-decline-issue-tree)
- The "Live from GitHub" panel calls the public GitHub API in the browser, so new repositories appear on the site without editing it.
- Research is summary-only while manuscripts are under review.

## Security, privacy and web standards

| Area | What is in place |
|---|---|
| Transport | HTTPS only, with HSTS preload |
| Security headers (`vercel.json`) | Content-Security-Policy (scripts only from this site; fonts from Google Fonts; API calls only to GitHub), `X-Frame-Options: DENY` and `frame-ancestors 'none'` against clickjacking, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera, microphone, location and payment disabled), `Cross-Origin-Opener-Policy` |
| What gets published (`.vercelignore`) | Only the page, its scripts and styles, `data/`, `assets/` and `projects/`. CMS scripts, docs, resume sources and build scripts stay in the repository but are not served |
| Privacy | No cookies, analytics or third-party trackers; language and theme preferences stay in the visitor's browser. Certificates are published with ID numbers and dates of birth redacted |
| Secrets | The CMS GitHub token lives in Google Apps Script properties, never in this repository |
| Accessibility | WCAG 2.2 AA: skip link, visible focus, contrast, keyboard-operable menus, reduced-motion support |
| Discoverability | Canonical URL, `hreflang` for the four languages, `sitemap.xml`, `robots.txt`, Open Graph and JSON-LD |
| Housekeeping | Custom `404.html`; `/.well-known/security.txt` (RFC 9116) with a contact address |

When adding a new external service (for example an analytics tool or embedded video), add its domain to the
Content-Security-Policy in `vercel.json`, or the browser will block it.

## Updating content

| Task | How |
|---|---|
| Edit text, projects, certificates | Change `data/*.json` (keep the four locales in sync), then run `node scripts/build-content.js` |
| Check the offline fallback is current | `node scripts/build-content.js --check` |
| Refresh the Google Sheet CMS from the JSON | `node scripts/export-cms-csv.js`, then import `automation/sheets_data/*.csv` into the sheet |

`.github/workflows/sync-content.yml` regenerates `content.js` automatically whenever `data/**` changes on `main` (for example after a Google Sheet CMS publish).

> The CMS publish rebuilds `projects`, `experience`, `certifications` and `research` JSON from the sheet. Import the exported CSVs first, or a publish will roll the site back to older sheet rows.

## Publish

Vercel deploys `main` automatically (Framework = Other, no build command).

## Truth and privacy

- Case studies use fictional or public course datasets, never employer data.
- Scans containing residency numbers, blood group or other personal identifiers are not published; `reference_docs/` is git-ignored.
- Research/patent works belonging to other people are never attributed to Pham Hong Hieu.
- No invented award, accepted publication or employer performance metric is shown.
