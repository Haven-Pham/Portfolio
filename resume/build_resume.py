"""
Builds the resume in four languages from resume/content.json on top of the
Jake's Resume (Calibri, A4) Word template, then exports each one to PDF with
Microsoft Word.

    python resume/build_resume.py            build .docx + .pdf for every language
    python resume/build_resume.py --no-pdf   build .docx only

Outputs
    resume/out/*.docx, resume/out/*.pdf      working copies (git-ignored)
    assets/resume/*.pdf                      the files the website links to

Project links come from data/projects.json: a project with a githubUrl links to
its repository, otherwise to the projects section of the website.
Requires python-docx; PDF export requires Microsoft Word (Windows).
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.shared import Inches, Pt, Twips, RGBColor

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT.parent / "Resume mẫu" / "Jakes Resume Original" / "Jakes Resume Calibri" / "A4" / "1.TECH-Jakes-Resume-Template-Calibri-A4.docx"
OUT = ROOT / "resume" / "out"
SITE_OUT = ROOT / "assets" / "resume"

LINK_COLOR = RGBColor(0x1F, 0x4E, 0x79)
RIGHT_TAB = Twips(10466)  # A4 text width with the template's 0.5" margins
BODY_PT = 10
GAP = 5  # points above each degree, role and project
EAST_ASIA = {"zh-Hant": ("Microsoft JhengHei", "zh-TW"), "zh-Hans": ("Microsoft YaHei", "zh-CN")}


def load(name):
    return json.loads((ROOT / "data" / f"{name}.json").read_text(encoding="utf-8"))


def set_east_asian_font(doc, lang):
    """Point the document defaults at a CJK font so Chinese text renders cleanly."""
    if lang not in EAST_ASIA:
        return
    font, locale = EAST_ASIA[lang]
    rpr_default = doc.styles.element.find(qn("w:docDefaults")).find(qn("w:rPrDefault")).find(qn("w:rPr"))
    fonts = rpr_default.find(qn("w:rFonts"))
    if fonts is None:
        fonts = OxmlElement("w:rFonts")
        rpr_default.insert(0, fonts)
    for attr in ("w:eastAsiaTheme",):
        if fonts.get(qn(attr)) is not None:
            del fonts.attrib[qn(attr)]
    fonts.set(qn("w:eastAsia"), font)
    lang_el = rpr_default.find(qn("w:lang"))
    if lang_el is None:
        lang_el = OxmlElement("w:lang")
        rpr_default.append(lang_el)
    lang_el.set(qn("w:eastAsia"), locale)


def clear_body(doc):
    body = doc.element.body
    for child in list(body):
        if child.tag != qn("w:sectPr"):
            body.remove(child)
    # The template repeats a placeholder name/contact block in the page header.
    for section in doc.sections:
        for part in (section.header, section.first_page_header, section.even_page_header):
            for p in part.paragraphs:
                p._p.getparent().remove(p._p)
            part.add_paragraph()


def tighten(doc, lang):
    """Two A4 pages: 10.5 pt body text, exact line heights (CJK fonts carry
    tall default leading) and slimmer page margins."""
    body_line = 13.5 if lang in EAST_ASIA else 12.5
    styles = doc.styles
    styles["Normal"].font.size = Pt(BODY_PT)
    for name in ("Normal", "6. Bullet Points"):
        styles[name].paragraph_format.line_spacing = Pt(body_line)
    for name, line in (("1. Applicant Name", 28), ("2. Job Title / Headline", 16), ("4. Section Headers", 17)):
        styles[name].paragraph_format.line_spacing = Pt(line)
    styles["6. Bullet Points"].paragraph_format.space_after = Pt(0)
    for section in doc.sections:
        section.top_margin = section.bottom_margin = Inches(0.45)
        section.header_distance = section.footer_distance = Inches(0.2)


def para(doc, style, text=None, *, after=None, before=None, right=None, bold=None, size=None):
    p = doc.add_paragraph(style=style)
    if after is not None:
        p.paragraph_format.space_after = Pt(after)
    if before is not None:
        p.paragraph_format.space_before = Pt(before)
    if text:
        run = p.add_run(text)
        if bold is not None:
            run.bold = bold
        if size:
            run.font.size = Pt(size)
    if right is not None:
        p.paragraph_format.tab_stops.add_tab_stop(RIGHT_TAB, WD_TAB_ALIGNMENT.RIGHT)
        p.add_run("\t")
        if isinstance(right, tuple):
            hyperlink(p, *right)
        else:
            p.add_run(right)
    return p


def hyperlink(paragraph, text, url, size=None, bold=False):
    r_id = paragraph.part.relate_to(url, RT.HYPERLINK, is_external=True)
    link = OxmlElement("w:hyperlink")
    link.set(qn("r:id"), r_id)
    run = paragraph.add_run(text)
    run.font.color.rgb = LINK_COLOR
    run.font.underline = True
    run.bold = bold
    if size:
        run.font.size = Pt(size)
    link.append(run._r)
    paragraph._p.append(link)
    return link


def build(lang, c, profile, projects):
    doc = Document(str(TEMPLATE))
    clear_body(doc)
    set_east_asian_font(doc, lang)
    tighten(doc, lang)
    labels = c["labels"]
    site = f"{profile['website']}/?lang={lang}"

    # Header: name, headline, contact line
    p = para(doc, "1. Applicant Name", c["name"], size=22)
    p.paragraph_format.alignment = 0
    para(doc, "2. Job Title / Headline", c["headline"], size=12, after=4)
    contact = para(doc, "5. Summary Text", after=2)
    shading = OxmlElement("w:shd")
    shading.set(qn("w:val"), "clear"); shading.set(qn("w:color"), "auto"); shading.set(qn("w:fill"), "F1F1F5")
    contact._p.get_or_add_pPr().append(shading)
    contact.add_run(f"{c['location']}  |  ")
    items = [
        (profile["email"], f"mailto:{profile['email']}"),
        ("LinkedIn", profile["linkedin"]),
        ("GitHub", profile["github"]),
        (labels["website"], site),
    ]
    for i, (text, url) in enumerate(items):
        if i:
            contact.add_run("  |  ")
        hyperlink(contact, text, url)

    colon = "：" if lang in EAST_ASIA else ": "

    def section(title):
        para(doc, "4. Section Headers", title, before=6, after=2)

    def heading(style, left, right, *, after=0):
        """Entry heading: bold left text, right-aligned date/place/link, kept with its body."""
        p = para(doc, style, left, right=right, before=GAP, after=after)
        p.paragraph_format.keep_with_next = True
        return p

    def labelled(label, text, after=1):
        p = para(doc, "6b. Training", after=after)
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        lab = p.add_run(label + colon); lab.bold = True
        p.add_run(text)
        return p

    def bullets(items):
        for b in items:
            para(doc, "6. Bullet Points", b)

    section(labels["summary"])
    para(doc, "5. Summary Text", c["summary"], after=0)

    section(labels["education"])
    for e in c["education"]:
        heading("7. Degree Name/Job Title", e["degree"], e["dates"])
        heading("8. Institution", e["school"], e["place"], after=1).paragraph_format.space_before = Pt(0)
        bullets(e["bullets"])

    section(labels["skills"])
    for s in c["skills"]:
        labelled(s["label"], s["items"])

    section(labels["experience"])
    for e in c["experience"]:
        heading("7. Degree Name/Job Title", e["role"], e["dates"])
        heading("9. Employer Name", e["org"], e["place"], after=1).paragraph_format.space_before = Pt(0)
        bullets(e["bullets"])

    erp = c["erp"]
    section(labels["erp"])
    heading("7. Degree Name/Job Title", erp["title"], erp["note"], after=1)
    bullets(erp["bullets"])

    section(labels["projects"])
    by_id = {p["id"]: p for p in projects}
    for pr in c["projects"]:
        repo = by_id.get(pr["id"], {}).get("githubUrl")
        link = (labels["github"], repo) if repo else (labels["portfolio"], f"{site}#projects")
        p = heading("7a. Project", None, link, after=1)
        tab = p.runs[0]._r  # the tab run; insert the title before it
        t = p.add_run(pr["title"]); t.bold = True
        sep = p.add_run(f"  |  {pr['tools']}"); sep.bold = False; sep.italic = True
        tab.addprevious(t._r); tab.addprevious(sep._r)
        bullets(pr["bullets"])

    section(labels["research"])
    for r in c["research"]:
        heading("7. Degree Name/Job Title", r["title"], None)
        p = para(doc, "9. Employer Name", after=1)
        p.paragraph_format.keep_with_next = True
        status = p.add_run(f"{r['status']}  ·  "); status.bold = True
        p.add_run(r["venue"])
        bullets(r["bullets"])

    section(labels["certifications"])
    for cert in c["certifications"]:
        labelled(cert["label"], cert["items"])
    p = para(doc, "5. Summary Text", after=0)
    hyperlink(p, labels["certsLink"], f"{site}#certifications")

    section(labels["activities"])
    for a in c["activities"]:
        labelled(a["lead"], a["text"])

    docx_path = OUT / f"{c['file']}.docx"
    doc.core_properties.author = "Pham Hong Hieu (Haven)"
    doc.core_properties.title = f"{c['name']} – Resume"
    doc.save(str(docx_path))
    return docx_path


def export_pdfs(docx_paths):
    """Export with Word so fonts, tabs and links match what the user sees in Word."""
    pairs = ";".join(f"'{p}'" for p in docx_paths)
    script = (
        "$w = New-Object -ComObject Word.Application; $w.Visible = $false;"
        f"foreach ($f in @({pairs})) {{ $d = $w.Documents.Open($f, $false, $true);"
        "$d.ExportAsFixedFormat(($f -replace '\\.docx$', '.pdf'), 17, $false, 0, 0, 0, 0, 0, $true, $true, 1);"
        "Write-Output (\"{0}: {1} page(s)\" -f (Split-Path $f -Leaf), $d.ComputeStatistics(2)); $d.Close($false) }; $w.Quit()"
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", script], check=True)


def main():
    content = json.loads((ROOT / "resume" / "content.json").read_text(encoding="utf-8"))
    profile, projects = load("profile"), load("projects")
    OUT.mkdir(parents=True, exist_ok=True)
    paths = [build(lang, c, profile, projects) for lang, c in content.items()]
    print("\n".join(f"built {p.name}" for p in paths))
    if "--no-pdf" in sys.argv:
        return
    export_pdfs(paths)
    SITE_OUT.mkdir(parents=True, exist_ok=True)
    for p in paths:
        shutil.copy2(p.with_suffix(".pdf"), SITE_OUT / p.with_suffix(".pdf").name)
    print(f"copied PDFs to {SITE_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
