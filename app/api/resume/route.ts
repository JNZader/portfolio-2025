import type { jsPDF } from 'jspdf';
import { type NextRequest, NextResponse } from 'next/server';
import resumeDataRaw from '@/lib/data/resume.json';
import { logger } from '@/lib/monitoring/logger';
import { getClientIdentifier, resumeRateLimiter } from '@/lib/rate-limit/redis';

// Type definitions
interface ResumeDataRaw {
  personalInfo: {
    name: string;
    title: string;
    email_encoded: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    location: string;
    startDate: string;
    endDate: string;
    details?: string[];
  }>;
  skills: Record<string, string[]>;
  softSkills?: string[];
  languages: Array<{ name: string; level: string }>;
}

interface ResumeData extends Omit<ResumeDataRaw, 'personalInfo'> {
  personalInfo: Omit<ResumeDataRaw['personalInfo'], 'email_encoded'> & { email: string };
}

// PDF Colors
const COLORS = {
  primary: [0, 102, 204] as [number, number, number],
  text: [51, 51, 51] as [number, number, number],
  lightGray: [128, 128, 128] as [number, number, number],
};

// PDF Context for rendering
interface PDFContext {
  doc: jsPDF;
  yPos: number;
  margin: number;
  pageHeight: number;
}

// Helper: Check and add new page if needed
function checkNewPage(ctx: PDFContext, requiredSpace = 20): void {
  if (ctx.yPos + requiredSpace > ctx.pageHeight - ctx.margin) {
    ctx.doc.addPage();
    ctx.yPos = 12;
  }
}

// Helper: Render section header
function renderSectionHeader(ctx: PDFContext, title: string): void {
  checkNewPage(ctx, 30);
  ctx.doc.setFontSize(12);
  ctx.doc.setTextColor(...COLORS.primary);
  ctx.doc.text(title, 12, ctx.yPos);
  ctx.yPos += 7;
}

// Helper: Render bullet points
function renderBulletPoints(ctx: PDFContext, items: string[], indent = 17): void {
  ctx.doc.setFontSize(8);
  ctx.doc.setTextColor(...COLORS.text);
  for (const item of items) {
    checkNewPage(ctx, 15);
    const lines = ctx.doc.splitTextToSize(`• ${item}`, 180);
    ctx.doc.text(lines, indent, ctx.yPos);
    ctx.yPos += lines.length * 4;
  }
}

// Helper: Render header section
function renderHeader(ctx: PDFContext, data: ResumeData): void {
  ctx.doc.setFontSize(24);
  ctx.doc.setTextColor(...COLORS.primary);
  ctx.doc.text(data.personalInfo.name, 12, ctx.yPos);
  ctx.yPos += 8;

  ctx.doc.setFontSize(14);
  ctx.doc.setTextColor(...COLORS.text);
  ctx.doc.text(data.personalInfo.title, 12, ctx.yPos);
  ctx.yPos += 10;

  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(...COLORS.lightGray);
  ctx.doc.text(`${data.personalInfo.email} | ${data.personalInfo.location}`, 12, ctx.yPos);
  ctx.yPos += 5;
  ctx.doc.text(`${data.personalInfo.website} | ${data.personalInfo.linkedin}`, 12, ctx.yPos);
  ctx.yPos += 12;
}

// Helper: Render summary section
function renderSummary(ctx: PDFContext, summary: string): void {
  renderSectionHeader(ctx, 'RESUMEN PROFESIONAL');
  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(...COLORS.text);
  const lines = ctx.doc.splitTextToSize(summary, 185);
  ctx.doc.text(lines, 12, ctx.yPos);
  ctx.yPos += lines.length * 4 + 8;
}

// Helper: Render experience section
function renderExperience(ctx: PDFContext, experience: ResumeData['experience']): void {
  renderSectionHeader(ctx, 'EXPERIENCIA PROFESIONAL');

  for (const job of experience) {
    checkNewPage(ctx, 40);
    ctx.doc.setFontSize(10);
    ctx.doc.setTextColor(...COLORS.text);
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.text(job.position, 12, ctx.yPos);
    ctx.doc.setFont('helvetica', 'normal');
    ctx.yPos += 5;

    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...COLORS.lightGray);
    const endDate = job.endDate === 'presente' ? 'Presente' : job.endDate;
    ctx.doc.text(`${job.company} | ${job.startDate} - ${endDate}`, 12, ctx.yPos);
    ctx.yPos += 5;

    renderBulletPoints(ctx, job.highlights);
    ctx.yPos += 4;
  }
}

// Helper: Render projects section
function renderProjects(ctx: PDFContext, projects: NonNullable<ResumeData['projects']>): void {
  renderSectionHeader(ctx, 'PROYECTOS DESTACADOS');

  for (const project of projects) {
    checkNewPage(ctx, 40);
    ctx.doc.setFontSize(10);
    ctx.doc.setTextColor(...COLORS.primary);
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.text(project.name, 12, ctx.yPos);
    ctx.doc.setFont('helvetica', 'normal');
    ctx.yPos += 5;

    ctx.doc.setFontSize(8);
    ctx.doc.setTextColor(...COLORS.text);
    const descLines = ctx.doc.splitTextToSize(project.description, 185);
    ctx.doc.text(descLines, 12, ctx.yPos);
    ctx.yPos += descLines.length * 4 + 2;

    renderBulletPoints(ctx, project.highlights);
    ctx.yPos += 4;
  }
}

// Helper: Render education section
function renderEducation(ctx: PDFContext, education: ResumeData['education']): void {
  renderSectionHeader(ctx, 'EDUCACIÓN Y CERTIFICACIONES');

  for (const edu of education) {
    checkNewPage(ctx, 30);
    ctx.doc.setFontSize(10);
    ctx.doc.setTextColor(...COLORS.primary);
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.text(edu.degree, 12, ctx.yPos);
    ctx.doc.setFont('helvetica', 'normal');
    ctx.yPos += 5;

    ctx.doc.setFontSize(8);
    ctx.doc.setTextColor(...COLORS.lightGray);
    ctx.doc.text(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`, 12, ctx.yPos);
    ctx.yPos += 5;

    if (edu.details && edu.details.length > 0) {
      renderBulletPoints(ctx, edu.details);
    }
    ctx.yPos += 4;
  }
}

// Helper: Render skills section
function renderSkills(ctx: PDFContext, skills: ResumeData['skills']): void {
  renderSectionHeader(ctx, 'HABILIDADES TÉCNICAS');

  for (const [category, skillList] of Object.entries(skills)) {
    checkNewPage(ctx, 10);
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...COLORS.text);
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.text(`${category}:`, 12, ctx.yPos);
    ctx.doc.setFont('helvetica', 'normal');

    ctx.doc.setTextColor(...COLORS.lightGray);
    const skillsText = skillList.join(', ');
    const skillsLines = ctx.doc.splitTextToSize(skillsText, 150);
    ctx.doc.text(skillsLines, 50, ctx.yPos);
    ctx.yPos += skillsLines.length * 4 + 2;
  }
}

// Helper: Render soft skills section
function renderSoftSkills(ctx: PDFContext, softSkills: string[]): void {
  ctx.yPos += 3;
  renderSectionHeader(ctx, 'HABILIDADES BLANDAS');
  renderBulletPoints(ctx, softSkills);
}

// Helper: Render languages section
function renderLanguages(ctx: PDFContext, languages: ResumeData['languages']): void {
  ctx.yPos += 3;
  checkNewPage(ctx, 20);
  ctx.doc.setFontSize(12);
  ctx.doc.setTextColor(...COLORS.primary);
  ctx.doc.text('IDIOMAS', 12, ctx.yPos);
  ctx.yPos += 7;

  for (const lang of languages) {
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...COLORS.text);
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.text(`${lang.name}:`, 12, ctx.yPos);
    ctx.doc.setFont('helvetica', 'normal');
    ctx.doc.setTextColor(...COLORS.lightGray);
    ctx.doc.text(lang.level, 50, ctx.yPos);
    ctx.yPos += 5;
  }
}

/**
 * API Route para generar CV en PDF
 * Endpoint: /api/resume
 * Rate limited: 10 requests por hora por IP
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting para prevenir DoS
    const clientId = getClientIdentifier(request);
    const { success } = await resumeRateLimiter.limit(clientId);

    if (!success) {
      logger.warn('Resume rate limit exceeded', { ip: clientId });
      return new NextResponse('Demasiadas solicitudes. Intenta de nuevo en 1 hora.', {
        status: 429,
        headers: { 'Retry-After': '3600' },
      });
    }

    // Lazy load jsPDF para reducir bundle inicial
    const { jsPDF } = await import('jspdf');

    // Prepare resume data (decode email from base64)
    const rawData = resumeDataRaw as ResumeDataRaw;
    const data: ResumeData = {
      ...rawData,
      personalInfo: {
        ...rawData.personalInfo,
        email: Buffer.from(rawData.personalInfo.email_encoded, 'base64').toString('utf-8'),
      },
    };

    // Initialize PDF and context
    const doc = new jsPDF();
    const ctx: PDFContext = {
      doc,
      yPos: 12,
      margin: 12,
      pageHeight: doc.internal.pageSize.height,
    };

    // Render all sections
    renderHeader(ctx, data);
    renderSummary(ctx, data.summary);
    renderExperience(ctx, data.experience);

    if (data.projects && data.projects.length > 0) {
      renderProjects(ctx, data.projects);
    }

    renderEducation(ctx, data.education);
    renderSkills(ctx, data.skills);

    if (data.softSkills && data.softSkills.length > 0) {
      renderSoftSkills(ctx, data.softSkills);
    }

    renderLanguages(ctx, data.languages);

    // Generate and return PDF
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV-${data.personalInfo.name.replaceAll(' ', '-')}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    logger.error('Error generating PDF resume', error as Error, {
      path: '/api/resume',
      method: 'GET',
    });
    return new NextResponse('Error generando PDF', { status: 500 });
  }
}
