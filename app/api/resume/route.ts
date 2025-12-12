import { type NextRequest, NextResponse } from 'next/server';
import resumeDataRaw from '@/lib/data/resume.json';
import { logger } from '@/lib/monitoring/logger';
import { getClientIdentifier, resumeRateLimiter } from '@/lib/rate-limit/redis';

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
  languages: Array<{
    name: string;
    level: string;
  }>;
}

interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
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
  languages: Array<{
    name: string;
    level: string;
  }>;
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

    // Decodificar email desde base64 (protección anti-scraping)
    const rawData = resumeDataRaw as ResumeDataRaw;
    const decodedEmail = Buffer.from(rawData.personalInfo.email_encoded, 'base64').toString(
      'utf-8'
    );

    const data: ResumeData = {
      ...rawData,
      personalInfo: {
        ...rawData.personalInfo,
        email: decodedEmail,
      },
    };
    const doc = new jsPDF();

    // Colors (matching LaTeX template)
    const primaryColor: [number, number, number] = [0, 102, 204]; // RGB(0, 102, 204)
    const textColor: [number, number, number] = [51, 51, 51];
    const lightGray: [number, number, number] = [128, 128, 128];

    let yPos = 12;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 12;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace = 20) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = 12;
      }
    };

    // Header
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text(data.personalInfo.name, 12, yPos);
    yPos += 8;

    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.text(data.personalInfo.title, 12, yPos);
    yPos += 10;

    // Contact Info
    doc.setFontSize(9);
    doc.setTextColor(...lightGray);
    const contactLine1 = `${data.personalInfo.email} | ${data.personalInfo.location}`;
    doc.text(contactLine1, 12, yPos);
    yPos += 5;
    const contactLine2 = `${data.personalInfo.website} | ${data.personalInfo.linkedin}`;
    doc.text(contactLine2, 12, yPos);
    yPos += 12;

    // Summary
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('RESUMEN PROFESIONAL', 12, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    const summaryLines = doc.splitTextToSize(data.summary, 185);
    doc.text(summaryLines, 12, yPos);
    yPos += summaryLines.length * 4 + 8;

    // Experience
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('EXPERIENCIA PROFESIONAL', 12, yPos);
    yPos += 7;

    for (const job of data.experience) {
      checkNewPage(40);

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(job.position, 12, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;

      doc.setFontSize(9);
      doc.setTextColor(...lightGray);
      const endDate = job.endDate === 'presente' ? 'Presente' : job.endDate;
      doc.text(`${job.company} | ${job.startDate} - ${endDate}`, 12, yPos);
      yPos += 5;

      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      for (const highlight of job.highlights) {
        checkNewPage(15);
        const highlightLines = doc.splitTextToSize(`• ${highlight}`, 180);
        doc.text(highlightLines, 17, yPos);
        yPos += highlightLines.length * 4;
      }
      yPos += 4;
    }

    // Projects (if available)
    if (data.projects && data.projects.length > 0) {
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('PROYECTOS DESTACADOS', 12, yPos);
      yPos += 7;

      for (const project of data.projects) {
        checkNewPage(40);

        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(project.name, 12, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 5;

        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        const descLines = doc.splitTextToSize(project.description, 185);
        doc.text(descLines, 12, yPos);
        yPos += descLines.length * 4 + 2;

        for (const highlight of project.highlights) {
          checkNewPage(15);
          const highlightLines = doc.splitTextToSize(`• ${highlight}`, 180);
          doc.text(highlightLines, 17, yPos);
          yPos += highlightLines.length * 4;
        }
        yPos += 4;
      }
    }

    // Education
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('EDUCACIÓN Y CERTIFICACIONES', 12, yPos);
    yPos += 7;

    for (const edu of data.education) {
      checkNewPage(30);

      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, 12, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;

      doc.setFontSize(8);
      doc.setTextColor(...lightGray);
      doc.text(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`, 12, yPos);
      yPos += 5;

      // Education details (if available)
      if (edu.details && edu.details.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        for (const detail of edu.details) {
          checkNewPage(10);
          const detailLines = doc.splitTextToSize(`• ${detail}`, 180);
          doc.text(detailLines, 17, yPos);
          yPos += detailLines.length * 4;
        }
      }
      yPos += 4;
    }

    // Skills
    checkNewPage(40);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('HABILIDADES TÉCNICAS', 12, yPos);
    yPos += 7;

    for (const [category, skills] of Object.entries(data.skills)) {
      checkNewPage(10);

      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${category}:`, 12, yPos);
      doc.setFont('helvetica', 'normal');

      doc.setTextColor(...lightGray);
      const skillsText = skills.join(', ');
      const skillsLines = doc.splitTextToSize(skillsText, 150);
      doc.text(skillsLines, 50, yPos);
      yPos += skillsLines.length * 4 + 2;
    }

    // Soft Skills (if available)
    if (data.softSkills && data.softSkills.length > 0) {
      yPos += 3;
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('HABILIDADES BLANDAS', 12, yPos);
      yPos += 7;

      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      for (const skill of data.softSkills) {
        checkNewPage(10);
        const skillLines = doc.splitTextToSize(`• ${skill}`, 180);
        doc.text(skillLines, 17, yPos);
        yPos += skillLines.length * 4;
      }
    }

    // Languages
    yPos += 3;
    checkNewPage(20);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('IDIOMAS', 12, yPos);
    yPos += 7;

    for (const lang of data.languages) {
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${lang.name}:`, 12, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightGray);
      doc.text(lang.level, 50, yPos);
      yPos += 5;
    }

    // Generate PDF
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV-${data.personalInfo.name.replace(/ /g, '-')}.pdf"`,
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
