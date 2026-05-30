import {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink,
  AlignmentType, BorderStyle,
} from "docx";
import type { ResumeJSON } from "../types/resume";

// Typography constants (half-points — multiply pt by 2)
const BODY_FONT = "Times New Roman";
const NAME_SIZE = 32;      // 16pt
const ROLE_SIZE = 22;      // 11pt
const SECTION_SIZE = 26;   // 13pt
const BODY_SIZE = 20;      // 10pt

// Page margins (DXA: 1 inch = 1440)
const MARGIN = { top: 720, bottom: 720, left: 1080, right: 1080 };

// Line spacing: single
const SINGLE = { line: 240, lineRule: "auto" as const };

function sectionDivider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
    spacing: { before: 0, after: 100 },
  });
}

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, font: BODY_FONT, size: SECTION_SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60, ...SINGLE },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: BODY_FONT, size: BODY_SIZE })],
    bullet: { level: 0 },
    indent: { left: 360, hanging: 180 },
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 40, ...SINGLE },
  });
}

function bodyPara(text: string, justified = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: BODY_FONT, size: BODY_SIZE })],
    alignment: justified ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
    spacing: { before: 0, after: 60, ...SINGLE },
  });
}

function boldInline(label: string, value: string): TextRun[] {
  return [
    new TextRun({ text: `${label}: `, bold: true, font: BODY_FONT, size: BODY_SIZE }),
    new TextRun({ text: value, font: BODY_FONT, size: BODY_SIZE }),
  ];
}

export async function buildAndDownloadDocx(resume: ResumeJSON): Promise<string> {
  const { header, summary, skills, experience, projects, education, certifications } = resume;

  const children: Paragraph[] = [];

  // ── HEADER ──────────────────────────────────────────────
  children.push(new Paragraph({
    children: [new TextRun({ text: header.name, bold: true, font: BODY_FONT, size: NAME_SIZE })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40, ...SINGLE },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: header.role_title, font: BODY_FONT, size: ROLE_SIZE })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60, ...SINGLE },
  }));

  // Contact line: phone · email · location · LinkedIn · GitHub
  children.push(new Paragraph({
    children: [
      new TextRun({ text: `${header.phone}  ·  ${header.email}  ·  ${header.location}  ·  `, font: BODY_FONT, size: BODY_SIZE }),
      new ExternalHyperlink({
        link: header.linkedin,
        children: [new TextRun({ text: "LinkedIn", style: "Hyperlink", font: BODY_FONT, size: BODY_SIZE })],
      }),
      new TextRun({ text: "  ·  ", font: BODY_FONT, size: BODY_SIZE }),
      new ExternalHyperlink({
        link: header.github,
        children: [new TextRun({ text: "GitHub", style: "Hyperlink", font: BODY_FONT, size: BODY_SIZE })],
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80, ...SINGLE },
  }));

  children.push(sectionDivider());

  // ── SUMMARY ─────────────────────────────────────────────
  children.push(sectionHeader("Summary"));
  children.push(bodyPara(summary, true));  // justified for summary
  children.push(sectionDivider());

  // ── SKILLS ──────────────────────────────────────────────
  children.push(sectionHeader("Skills"));
  for (const [label, items] of Object.entries(skills)) {
    children.push(new Paragraph({
      children: boldInline(label, items.join(", ")),
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 40, ...SINGLE },
    }));
  }
  children.push(sectionDivider());

  // ── EXPERIENCE ───────────────────────────────────────────
  children.push(sectionHeader("Experience"));
  for (const exp of experience) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${exp.company}`, bold: true, font: BODY_FONT, size: BODY_SIZE }),
        new TextRun({ text: `  —  ${exp.title}`, font: BODY_FONT, size: BODY_SIZE }),
        new TextRun({ text: `\t${exp.dates}`, font: BODY_FONT, size: BODY_SIZE }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { before: 80, after: 20, ...SINGLE },
      tabStops: [{ type: "right", position: 9360 }],
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: exp.location, italics: true, font: BODY_FONT, size: BODY_SIZE })],
      spacing: { before: 0, after: 40, ...SINGLE },
    }));
    for (const b of exp.bullets) children.push(bullet(b));
  }
  children.push(sectionDivider());

  // ── PROJECTS ─────────────────────────────────────────────
  children.push(sectionHeader("Projects"));
  for (const proj of projects) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: proj.name, bold: true, font: BODY_FONT, size: BODY_SIZE }),
        new TextRun({ text: `  |  ${proj.stack}`, font: BODY_FONT, size: BODY_SIZE }),
      ],
      spacing: { before: 80, after: 20, ...SINGLE },
    }));
    for (const b of proj.bullets) children.push(bullet(b));
  }
  children.push(sectionDivider());

  // ── EDUCATION ────────────────────────────────────────────
  children.push(sectionHeader("Education"));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: education.institution, bold: true, font: BODY_FONT, size: BODY_SIZE }),
      new TextRun({ text: `\t${education.dates}`, font: BODY_FONT, size: BODY_SIZE }),
    ],
    spacing: { before: 40, after: 20, ...SINGLE },
    tabStops: [{ type: "right", position: 9360 }],
  }));
  children.push(bodyPara(`${education.degree}  ·  GPA: ${education.gpa}  ·  ${education.location}`));
  children.push(new Paragraph({
    children: boldInline("Coursework", education.coursework),
    spacing: { before: 0, after: 40, ...SINGLE },
  }));
  children.push(sectionDivider());

  // ── CERTIFICATIONS ───────────────────────────────────────
  if (certifications.length > 0) {
    children.push(sectionHeader("Certifications"));
    children.push(bodyPara(certifications.join("  ·  ")));
  }

  // ── BUILD & DOWNLOAD ─────────────────────────────────────
  const doc = new Document({
    sections: [{ properties: { page: { margin: MARGIN, size: { width: 12240, height: 15840 } } }, children }],
  });

  const blob = await Packer.toBlob(doc);
  const company = resume.meta.company.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `Pranav_Resume_${company}_${date}.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return filename;
}
