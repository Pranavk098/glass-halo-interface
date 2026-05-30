import type { AppEntry } from "../types/resume";

const STORAGE_KEY = "resumeos_applications";

export function getApplications(): AppEntry[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
}

export function addApplication(entry: Omit<AppEntry, "id">): AppEntry {
  const applications = getApplications();
  const newEntry: AppEntry = { ...entry, id: crypto.randomUUID() };
  applications.unshift(newEntry);  // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  return newEntry;
}

export function updateApplication(id: string, updates: Partial<AppEntry>): void {
  const applications = getApplications().map(a => a.id === id ? { ...a, ...updates } : a);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

export function deleteApplication(id: string): void {
  const applications = getApplications().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

export function exportToCSV(): void {
  const applications = getApplications();
  if (applications.length === 0) return;

  const headers = ["Company", "Role", "Date Applied", "ATS Score", "Status", "Resume File", "Notes"];
  const rows = applications.map(a => [
    `"${a.company}"`,
    `"${a.role}"`,
    `"${new Date(a.dateApplied).toLocaleDateString()}"`,
    a.atsScore.toString(),
    `"${a.status}"`,
    `"${a.resumeFilename}"`,
    `"${a.notes.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ResumeOS_Applications_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
