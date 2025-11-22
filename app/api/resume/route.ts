import { jsPDF } from 'jspdf';
import { NextResponse } from 'next/server';
import resumeData from '@/public/resume.json';

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
  education: Array<{
    institution: string;
    degree: string;
    location: string;
    startDate: string;
    endDate: string;
  }>;
  skills: Record<string, string[]>;
  languages: Array<{
    name: string;
    level: string;
  }>;
}

/**
 * API Route para generar CV en PDF
 * Endpoint: /api/resume
 */
export async function GET() {
  try {
    const data = resumeData as ResumeData;
    const doc = new jsPDF();

    // Colors
    const primaryColor: [number, number, number] = [30, 64, 175]; // Blue
    const textColor: [number, number, number] = [51, 51, 51];
    const lightGray: [number, number, number] = [128, 128, 128];

    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace = 20) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Header
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text(data.personalInfo.name, 20, yPos);
    yPos += 8;

    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.text(data.personalInfo.title, 20, yPos);
    yPos += 10;

    // Contact Info
    doc.setFontSize(9);
    doc.setTextColor(...lightGray);
    const contactLine1 = `${data.personalInfo.email} | ${data.personalInfo.location}`;
    doc.text(contactLine1, 20, yPos);
    yPos += 5;
    const contactLine2 = `${data.personalInfo.website} | ${data.personalInfo.linkedin}`;
    doc.text(contactLine2, 20, yPos);
    yPos += 15;

    // Summary
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('RESUMEN PROFESIONAL', 20, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    const summaryLines = doc.splitTextToSize(data.summary, 170);
    doc.text(summaryLines, 20, yPos);
    yPos += summaryLines.length * 4 + 10;

    // Experience
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('EXPERIENCIA PROFESIONAL', 20, yPos);
    yPos += 7;

    for (const job of data.experience) {
      checkNewPage(40);

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(job.position, 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;

      doc.setFontSize(9);
      doc.setTextColor(...lightGray);
      const endDate = job.endDate === 'presente' ? 'Presente' : job.endDate;
      doc.text(`${job.company} | ${job.startDate} - ${endDate}`, 20, yPos);
      yPos += 5;

      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      for (const highlight of job.highlights) {
        checkNewPage(15);
        const highlightLines = doc.splitTextToSize(`• ${highlight}`, 165);
        doc.text(highlightLines, 25, yPos);
        yPos += highlightLines.length * 4;
      }
      yPos += 5;
    }

    // Education
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('EDUCACIÓN', 20, yPos);
    yPos += 7;

    for (const edu of data.education) {
      checkNewPage(20);

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;

      doc.setFontSize(8);
      doc.setTextColor(...lightGray);
      doc.text(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`, 20, yPos);
      yPos += 7;
    }

    // Skills
    checkNewPage(40);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('HABILIDADES TÉCNICAS', 20, yPos);
    yPos += 7;

    for (const [category, skills] of Object.entries(data.skills)) {
      checkNewPage(10);

      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${category}:`, 20, yPos);
      doc.setFont('helvetica', 'normal');

      doc.setTextColor(...lightGray);
      const skillsText = skills.join(', ');
      const skillsLines = doc.splitTextToSize(skillsText, 140);
      doc.text(skillsLines, 55, yPos);
      yPos += skillsLines.length * 4 + 2;
    }

    // Languages
    yPos += 5;
    checkNewPage(20);
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('IDIOMAS', 20, yPos);
    yPos += 7;

    for (const lang of data.languages) {
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${lang.name}:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightGray);
      doc.text(lang.level, 55, yPos);
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
    console.error('Error generando PDF:', error);
    return new NextResponse('Error generando PDF', { status: 500 });
  }
}
