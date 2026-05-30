export interface ResumeHeader {
  name: string;
  role_title: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface ResumeExperience {
  company: string;
  title: string;
  dates: string;
  location: string;
  bullets: string[];
}

export interface ResumeProject {
  name: string;
  stack: string;
  bullets: string[];
  is_new: boolean;
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  dates: string;
  location: string;
  gpa: string;
  coursework: string;
}

export interface ResumeMeta {
  target_role: string;
  company: string;
  jd_keywords_extracted: string[];
  keywords_covered: string[];
  keywords_missing: string[];
  new_project_added: boolean;
}

export interface ResumeJSON {
  meta: ResumeMeta;
  header: ResumeHeader;
  summary: string;
  skills: Record<string, string[]>;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation;
  certifications: string[];
  cover_letter: string | null;
}

// Application tracker entry
export interface AppEntry {
  id: string;               // uuid via crypto.randomUUID()
  company: string;
  role: string;
  dateApplied: string;      // ISO string
  atsScore: number;
  status: "Applied" | "Phone Screen" | "Technical" | "Offer" | "Rejected" | "No Response";
  jdSnippet: string;        // first 200 chars of JD
  notes: string;
  resumeFilename: string;   // e.g. "Pranav_Resume_Anthropic_2026-05-29.docx"
}
