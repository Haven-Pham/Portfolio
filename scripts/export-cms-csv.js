#!/usr/bin/env node
/*
 * Exports data/*.json back into the Google Sheet CMS layout
 * (automation/sheets_data/*.csv). Import these CSVs into the
 * "Haven Portfolio CMS" sheet before using Publish, so the CMS
 * does not overwrite newer website content with older sheet rows.
 *
 *   node scripts/export-cms-csv.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'data', `${name}.json`), 'utf8'));
const LANGS = ['en', 'vi', 'zh-Hant', 'zh-Hans'];

const cell = value => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const writeCsv = (name, header, rows) => {
  const body = [header, ...rows].map(row => row.map(cell).join(',')).join('\n') + '\n';
  fs.writeFileSync(path.join(root, 'automation', 'sheets_data', `${name}.csv`), body);
  console.log(`${name}.csv: ${rows.length} rows`);
};
const isoDate = text => {
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? text : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const i18n = read('i18n');
const projects = read('projects');
const certs = read('certifications');
const research = read('research');

writeCsv('PROJECTS',
  ['id', 'slug', 'category', 'status', 'featured', 'sort_order', 'github_url', 'demo_url', 'cover_file', 'document_file'],
  projects.map((p, i) => [p.id, p.id, p.category, p.status, 'TRUE', i + 1, p.githubUrl, p.demoUrl, '', p.documentFile]));

writeCsv('PROJECT_CONTENT',
  ['project_id', 'language', 'title', 'short_description', 'problem', 'approach', 'evidence'],
  projects.flatMap(p => LANGS.map(lang => {
    const c = i18n[lang].projectData[p.id] || {};
    return [p.id, lang, c.title, c.description, c.goal, c.methods, c.evidence];
  })));

writeCsv('CERTIFICATIONS',
  ['id', 'name', 'provider', 'date', 'category', 'file', 'verification_url', 'featured', 'sort_order'],
  certs.map((c, i) => [c.id, i18n.en.certNames[c.id], c.provider, isoDate(c.when), c.type, c.asset || '[PRIVATE RECORD]', c.asset && c.asset.startsWith('http') ? c.asset : '', 'TRUE', i + 1]));

writeCsv('RESEARCH',
  ['id', 'title', 'type', 'year', 'status', 'url', 'featured', 'sort_order'],
  research.map((r, i) => [r.id, i18n.en.researchData[r.id].title, r.type, r.year, 'summary-only', r.url, 'TRUE', i + 1]));
