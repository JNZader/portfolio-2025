import type { jsPDF } from 'jspdf';
import type { ResumeData } from '@/lib/types/resume';

type RGB = [number, number, number];

// Page geometry (A4 in mm)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 10; // ~0.39 inch -- tighter margins, equal on both sides
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Colors mirrored from the LaTeX template
const COLORS = {
  primary: [0, 102, 204] as RGB, // accent blue (titles, project names)
  secondary: [64, 64, 64] as RGB, // dark gray (subtitle, subsection title)
  text: [40, 40, 40] as RGB, // body text
  lightGray: [110, 110, 110] as RGB, // dates, contact line, institution
};

// Font sizes (pt). Tuned to fit the full CV in two A4 pages.
const SIZES = {
  name: 19,
  subtitle: 11,
  contact: 8,
  section: 13,
  subsection: 10.5,
  projectName: 9.5,
  body: 9,
  bullet: 8.5,
  small: 8,
};

interface PDFContext {
  doc: jsPDF;
  yPos: number;
}

// Section headers and error strings per locale. The PDF can't use next-intl's
// React helpers, so the copy lives here keyed by locale.
type PdfLocale = 'es' | 'en';

interface PdfLabels {
  summary: string;
  experience: string;
  skills: string;
  softSkills: string;
  education: string;
  languages: string;
  rateLimit: string;
  error: string;
}

const PDF_LABELS: Record<PdfLocale, PdfLabels> = {
  es: {
    summary: 'Resumen Profesional',
    experience: 'Experiencia Profesional',
    skills: 'Habilidades Técnicas',
    softSkills: 'Habilidades Blandas',
    education: 'Educación y Certificaciones',
    languages: 'Idiomas',
    rateLimit: 'Demasiadas solicitudes. Intenta de nuevo en 1 hora.',
    error: 'Error generando PDF',
  },
  en: {
    summary: 'Professional Summary',
    experience: 'Professional Experience',
    skills: 'Technical Skills',
    softSkills: 'Soft Skills',
    education: 'Education & Certifications',
    languages: 'Languages',
    rateLimit: 'Too many requests. Please try again in 1 hour.',
    error: 'Error generating PDF',
  },
};

// ----- Layout primitives -----

function checkNewPage(ctx: PDFContext, requiredSpace = 20): void {
  if (ctx.yPos + requiredSpace > PAGE_HEIGHT - MARGIN) {
    ctx.doc.addPage();
    ctx.yPos = MARGIN;
  }
}

function setText(
  ctx: PDFContext,
  size: number,
  color: RGB,
  weight: 'normal' | 'bold' = 'normal',
  style: 'normal' | 'italic' = 'normal'
): void {
  ctx.doc.setFontSize(size);
  ctx.doc.setTextColor(...color);
  // jsPDF font setter accepts: normal | bold | italic | bolditalic
  const fontStyle =
    weight === 'bold'
      ? style === 'italic'
        ? 'bolditalic'
        : 'bold'
      : style === 'italic'
        ? 'italic'
        : 'normal';
  ctx.doc.setFont('helvetica', fontStyle);
}

// Renders text and advances yPos by lineHeight per wrapped line. The 3.5 mm
// offset matches the convention used by every other doc.text call in this
// module so wrapped text aligns vertically with the rest of the layout.
// Without it, descriptions printed right after a project name would overlap
// the project name (the visual baseline ends up only ~1.5 mm below the prior
// text instead of the ~5 mm needed for 9.5 pt body type).
function renderWrappedText(
  ctx: PDFContext,
  text: string,
  x: number,
  maxWidth: number,
  lineHeight: number
): void {
  const lines = ctx.doc.splitTextToSize(text, maxWidth);
  for (const line of lines as string[]) {
    checkNewPage(ctx, lineHeight);
    ctx.doc.text(line, x, ctx.yPos + 3.5);
    ctx.yPos += lineHeight;
  }
}

// ----- Sections -----

function renderHeader(ctx: PDFContext, data: ResumeData): void {
  // Name -- centered, large, bold, primary
  setText(ctx, SIZES.name, COLORS.primary, 'bold');
  const nameWidth = ctx.doc.getTextWidth(data.personalInfo.name);
  ctx.doc.text(data.personalInfo.name, (PAGE_WIDTH - nameWidth) / 2, ctx.yPos + 7);
  ctx.yPos += 9;

  // Subtitle ("Backend Developer") intentionally skipped here -- it was
  // duplicating the position rendered in the Experience section just below.
  // Kept in personalInfo.title so other surfaces (SEO metadata) still have it.

  // Contact line -- centered with separators. The email goes in the PDF:
  // the anti-scraping obfuscation only matters on the web, and a recruiter
  // holding the downloaded CV needs a way to reply.
  setText(ctx, SIZES.contact, COLORS.lightGray, 'normal');
  const linkedinShort = data.personalInfo.linkedin.replace(/^https?:\/\//, '');
  const githubShort = data.personalInfo.github.replace(/^https?:\/\//, '');
  const sep = '  ·  '; // " · " with extra spacing
  const email = data.personalInfo.email;
  const contactText = `${data.personalInfo.location}${sep}${email}${sep}${linkedinShort}${sep}${githubShort}`;
  const contactWidth = ctx.doc.getTextWidth(contactText);
  const contactX = (PAGE_WIDTH - contactWidth) / 2;
  ctx.doc.text(contactText, contactX, ctx.yPos + 3.5);

  // Add hyperlinks for email, LinkedIn and GitHub portions
  const locationWidth = ctx.doc.getTextWidth(data.personalInfo.location);
  const sepWidth = ctx.doc.getTextWidth(sep);
  const emailX = contactX + locationWidth + sepWidth;
  const emailWidth = ctx.doc.getTextWidth(email);
  const linkedinX = emailX + emailWidth + sepWidth;
  const linkedinWidth = ctx.doc.getTextWidth(linkedinShort);
  const githubX = linkedinX + linkedinWidth + sepWidth;
  ctx.doc.link(emailX, ctx.yPos + 0.8, emailWidth, 3.5, { url: `mailto:${email}` });
  ctx.doc.link(linkedinX, ctx.yPos + 0.8, linkedinWidth, 3.5, { url: data.personalInfo.linkedin });
  ctx.doc.link(githubX, ctx.yPos + 0.8, ctx.doc.getTextWidth(githubShort), 3.5, {
    url: data.personalInfo.github,
  });

  ctx.yPos += 6;
}

function renderSectionHeader(ctx: PDFContext, title: string): void {
  checkNewPage(ctx, 14);
  ctx.yPos += 1.2; // top spacing before section
  setText(ctx, SIZES.section, COLORS.primary, 'bold');
  ctx.doc.text(title, MARGIN, ctx.yPos + 4);
  ctx.yPos += 5;
  // Underline rule
  ctx.doc.setDrawColor(...COLORS.primary);
  ctx.doc.setLineWidth(0.3);
  ctx.doc.line(MARGIN, ctx.yPos, PAGE_WIDTH - MARGIN, ctx.yPos);
  ctx.yPos += 2;
}

function renderSubsectionWithDate(ctx: PDFContext, title: string, dateText: string): void {
  checkNewPage(ctx, 10);
  setText(ctx, SIZES.subsection, COLORS.secondary, 'bold');
  ctx.doc.text(title, MARGIN, ctx.yPos + 3.5);

  setText(ctx, SIZES.small, COLORS.lightGray, 'normal', 'italic');
  ctx.doc.text(dateText, PAGE_WIDTH - MARGIN, ctx.yPos + 3.5, { align: 'right' });

  ctx.yPos += 5;
}

function renderInstitutionLine(ctx: PDFContext, line: string): void {
  setText(ctx, SIZES.body, COLORS.lightGray, 'normal');
  ctx.doc.text(line, MARGIN, ctx.yPos + 3.5);
  ctx.yPos += 4;
}

// Top-level bullets (•) at the leftmost column
function renderBullets(ctx: PDFContext, items: string[], indent = 0): void {
  setText(ctx, SIZES.bullet, COLORS.text, 'normal');
  const bulletX = MARGIN + indent;
  const textX = bulletX + 3;
  const maxWidth = CONTENT_WIDTH - indent - 3;
  for (const item of items) {
    checkNewPage(ctx, 5);
    ctx.doc.text('•', bulletX, ctx.yPos + 3.2);
    const lines = ctx.doc.splitTextToSize(item, maxWidth) as string[];
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) checkNewPage(ctx, 4);
      ctx.doc.text(lines[i], textX, ctx.yPos + 3.2);
      ctx.yPos += 4;
    }
    ctx.yPos += 0.3;
  }
}

// Render summary block
function renderSummary(ctx: PDFContext, summary: string, labels: PdfLabels): void {
  renderSectionHeader(ctx, labels.summary);
  setText(ctx, SIZES.body, COLORS.text, 'normal');
  renderWrappedText(ctx, summary, MARGIN, CONTENT_WIDTH, 4.2);
  ctx.yPos += 0.5;
}

// Render the experience section -- nests projects inside the single experience entry,
// matching the LaTeX layout where projects are second-level bullets under the role.
function renderExperienceWithProjects(
  ctx: PDFContext,
  experience: ResumeData['experience'],
  projects: NonNullable<ResumeData['projects']>,
  labels: PdfLabels
): void {
  renderSectionHeader(ctx, labels.experience);

  for (const job of experience) {
    const dateLine = `${job.startDate} – ${job.endDate}`;
    renderSubsectionWithDate(ctx, job.position, dateLine);
    renderInstitutionLine(ctx, `${job.company} · ${job.location}`);
    ctx.yPos += 0.5;

    // Top-level highlights of the role
    if (job.highlights.length > 0) {
      renderBullets(ctx, job.highlights);
      ctx.yPos += 0.8;
    }
  }

  // Projects rendered as second-level bullets after the role highlights
  for (const project of projects) {
    checkNewPage(ctx, 14);
    // Project name in bold + primary color. Use "•" (in the Helvetica WinAnsi
    // set) rather than "▪" because the latter renders as a tofu glyph in jsPDF.
    setText(ctx, SIZES.projectName, COLORS.primary, 'bold');
    ctx.doc.text('•', MARGIN + 1, ctx.yPos + 3.3);
    ctx.doc.text(project.name, MARGIN + 5, ctx.yPos + 3.3);
    ctx.yPos += 4.2;

    // Description
    setText(ctx, SIZES.body, COLORS.text, 'normal');
    renderWrappedText(ctx, project.description, MARGIN + 5, CONTENT_WIDTH - 5, 4);
    ctx.yPos += 0.3;

    // Indented bullets
    renderBullets(ctx, project.highlights, 5);
    ctx.yPos += 0.4;
  }
}

// Render skills as a 2-column table (category in bold, items wrapped on the right)
function renderSkillsTable(ctx: PDFContext, skills: ResumeData['skills'], labels: PdfLabels): void {
  renderSectionHeader(ctx, labels.skills);

  // Narrower category column (24% instead of 28%) so the items list starts
  // further left and has more horizontal room before wrapping. The widest
  // category label ("Industrial / IoT / Edge:") still fits at this ratio.
  const categoryColWidth = CONTENT_WIDTH * 0.24;
  const itemsX = MARGIN + categoryColWidth;
  const itemsWidth = CONTENT_WIDTH - categoryColWidth;

  // Skills table uses a tighter type size (SIZES.bullet) and tighter row
  // spacing than the rest of the body so eleven categories fit cleanly on
  // one page without forcing a third page.
  for (const [category, items] of Object.entries(skills)) {
    if (items.length === 0) continue;
    checkNewPage(ctx, 5);
    setText(ctx, SIZES.bullet, COLORS.secondary, 'bold');
    ctx.doc.text(`${category}:`, MARGIN, ctx.yPos + 3);

    setText(ctx, SIZES.bullet, COLORS.text, 'normal');
    const itemsText = items.join(', ');
    const lines = ctx.doc.splitTextToSize(itemsText, itemsWidth) as string[];
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) checkNewPage(ctx, 3.5);
      ctx.doc.text(lines[i], itemsX, ctx.yPos + 3);
      // Always advance yPos so that wrapped categories (Frontend, ML/IA,
      // Industrial/IoT) do not overlap with the next row.
      ctx.yPos += 3.5;
    }
    ctx.yPos += 0.3;
  }
}

function renderSoftSkills(ctx: PDFContext, items: string[], labels: PdfLabels): void {
  if (items.length === 0) return;
  renderSectionHeader(ctx, labels.softSkills);
  renderBullets(ctx, items);
}

// Render education with title (bold + primary), date (right + italic gray),
// and optional institution + bullets underneath.
function renderEducation(
  ctx: PDFContext,
  education: ResumeData['education'],
  labels: PdfLabels
): void {
  renderSectionHeader(ctx, labels.education);

  for (const edu of education) {
    checkNewPage(ctx, 10);

    // Title bold primary
    setText(ctx, SIZES.body, COLORS.primary, 'bold');
    ctx.doc.text(edu.degree, MARGIN, ctx.yPos + 3.2);

    // Right-aligned date range. The institution renders as its own gray line
    // below (when present), so it is never interpolated into the date text —
    // this avoids rendering a stray "undefined, <date>" when institution is empty.
    const dateText = `${edu.startDate} – ${edu.endDate}`;
    setText(ctx, SIZES.small, COLORS.lightGray, 'normal', 'italic');
    ctx.doc.text(dateText, PAGE_WIDTH - MARGIN, ctx.yPos + 3.2, { align: 'right' });

    ctx.yPos += 4;

    // Institution as a separate gray line
    if (edu.institution) {
      setText(ctx, SIZES.body, COLORS.lightGray, 'normal');
      ctx.doc.text(edu.institution, MARGIN, ctx.yPos + 3.2);
      ctx.yPos += 3.8;
    }

    if (edu.details && edu.details.length > 0) {
      renderBullets(ctx, edu.details);
    }

    ctx.yPos += 1;
  }
}

function renderLanguages(
  ctx: PDFContext,
  languages: ResumeData['languages'],
  labels: PdfLabels
): void {
  if (languages.length === 0) return;
  renderSectionHeader(ctx, labels.languages);

  for (const lang of languages) {
    checkNewPage(ctx, 5);
    setText(ctx, SIZES.body, COLORS.secondary, 'bold');
    ctx.doc.text(`${lang.name}:`, MARGIN, ctx.yPos + 3.2);

    setText(ctx, SIZES.body, COLORS.text, 'normal');
    ctx.doc.text(lang.level, MARGIN + 28, ctx.yPos + 3.2);
    ctx.yPos += 4;
  }
}

function renderProjects(ctx: PDFContext, projects: NonNullable<ResumeData['projects']>): void {
  // Reserved for future structural changes; currently projects are rendered
  // inline within renderExperienceWithProjects to mirror the LaTeX layout.
  void ctx;
  void projects;
}

/**
 * Build the CV PDF from resume data and locale-specific labels.
 * Returns the raw PDF bytes as an ArrayBuffer. jsPDF is imported dynamically
 * so it stays out of the route module's synchronous import graph.
 */
export async function buildResumePdf(data: ResumeData, labels: PdfLabels): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ctx: PDFContext = {
    doc,
    yPos: MARGIN,
  };

  renderHeader(ctx, data);
  renderSummary(ctx, data.summary, labels);

  if (data.projects && data.projects.length > 0) {
    renderExperienceWithProjects(ctx, data.experience, data.projects, labels);
  } else {
    // Fallback: render experience alone if no projects defined
    renderExperienceWithProjects(ctx, data.experience, [], labels);
  }

  renderSkillsTable(ctx, data.skills, labels);

  if (data.softSkills && data.softSkills.length > 0) {
    renderSoftSkills(ctx, data.softSkills, labels);
  }

  renderEducation(ctx, data.education, labels);
  renderLanguages(ctx, data.languages, labels);

  // Reserved hook (currently a no-op so the helper does not get tree-shaken away
  // before the structural change to flatten experience/projects ships)
  renderProjects(ctx, data.projects ?? []);

  return doc.output('arraybuffer');
}

export type { PdfLabels, PdfLocale };
export { PDF_LABELS };
