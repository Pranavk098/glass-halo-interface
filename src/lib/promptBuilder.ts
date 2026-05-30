export function buildUserMessage(jd: string, includeCoverLetter: boolean): string {
  return `JD:\n${jd.trim()}\n\ncover_letter: ${includeCoverLetter}\n\nGenerate the tailored resume JSON now.`;
}

export type JDInputType = "url" | "text";

export function detectInputType(input: string): JDInputType {
  return /^https?:\/\/.+/i.test(input.trim()) ? "url" : "text";
}

/**
 * Pre-flight JD quality check before hitting the API.
 * Returns null if OK, or an error string if the JD looks too thin.
 */
export function validateJD(jd: string): string | null {
  const trimmed = jd.trim();
  if (trimmed.length < 200) return "Job description seems too short (under 200 characters). Paste the full JD for best results.";

  const techTerms = [
    "python", "pytorch", "tensorflow", "ml", "machine learning", "deep learning",
    "llm", "api", "model", "data", "engineer", "experience", "required", "skills",
    "develop", "build", "deploy", "aws", "gcp", "azure", "docker", "kubernetes",
  ];
  const lower = trimmed.toLowerCase();
  const matches = techTerms.filter(t => lower.includes(t));
  if (matches.length < 3) return "Could not detect enough technical requirements. Make sure you pasted the full job description.";

  return null;
}
