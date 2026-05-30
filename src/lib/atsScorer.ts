export interface ATSResult {
  score: number;               // 0–100
  matched: string[];           // keywords found in resume text
  missing: string[];           // keywords not found
  totalKeywords: number;
}

/**
 * Score a resume JSON against a list of JD keywords.
 * Takes the full resume text (all bullets + skills + summary) and checks keyword presence.
 */
export function scoreATS(resumeText: string, keywords: string[]): ATSResult {
  if (keywords.length === 0) return { score: 0, matched: [], missing: [], totalKeywords: 0 };

  const lower = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score = Math.round((matched.length / keywords.length) * 100);
  return { score, matched, missing, totalKeywords: keywords.length };
}

/**
 * Flatten a ResumeJSON into a single searchable string for ATS scoring.
 */
export function flattenResumeToText(resume: {
  summary: string;
  skills: Record<string, string[]>;
  experience: { bullets: string[] }[];
  projects: { bullets: string[]; stack: string }[];
}): string {
  const parts: string[] = [resume.summary];

  for (const skills of Object.values(resume.skills)) {
    parts.push(skills.join(" "));
  }
  for (const exp of resume.experience) {
    parts.push(...exp.bullets);
  }
  for (const proj of resume.projects) {
    parts.push(proj.stack, ...proj.bullets);
  }

  return parts.join(" ");
}
