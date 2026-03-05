/**
 * Resume/CV data types
 * Shared between Sanity data layer and PDF API route
 */

/**
 * Raw resume data shape (from JSON or transformed from Sanity)
 * Skills are stored as Record<string, string[]> (category → skill list)
 */
export interface ResumeDataRaw {
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

/**
 * Resume data with decoded email (used by PDF renderer)
 */
export interface ResumeData extends Omit<ResumeDataRaw, 'personalInfo'> {
  personalInfo: Omit<ResumeDataRaw['personalInfo'], 'email_encoded'> & {
    email: string;
  };
}

/**
 * Sanity response shape for resume document
 * Skills are stored as array of objects in Sanity (no native Record/Map support)
 */
export interface SanityResumeData {
  personalInfo: ResumeDataRaw['personalInfo'];
  summary: string;
  experience: ResumeDataRaw['experience'];
  projects?: ResumeDataRaw['projects'];
  education: ResumeDataRaw['education'];
  skills: Array<{ category: string; items: string[] }>;
  softSkills?: string[];
  languages: ResumeDataRaw['languages'];
}
