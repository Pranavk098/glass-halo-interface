import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";
import { ResumePreview } from "../components/ResumePreview";
import { HistoryPanel } from "../components/HistoryPanel";
import { generateResume } from "../lib/api/resumeApi";
import { fetchJDFromUrl } from "../lib/api/urlFetcher";
import { buildAndDownloadDocx } from "../lib/docxBuilder";
import { scoreATS, flattenResumeToText } from "../lib/atsScorer";
import { checkAndIncrementRate, getTodayCount } from "../lib/rateLimit";
import { addApplication, getApplications, updateApplication } from "../lib/appTracker";
import { detectInputType, validateJD } from "../lib/promptBuilder";
import { DAILY_REQUEST_LIMIT } from "../lib/config";
import type { ResumeJSON } from "../types/resume";

// Base resume bullets for diff comparison
import { BASE_RESUME } from "../data/baseResume";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeOS — Tailor resumes in under 60 seconds" },
      { name: "description", content: "AI-powered resume tailoring. Paste a job description, get an ATS-optimized resume in seconds." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" },
    ],
  }),
  component: Index,
});

type Tab = "resume" | "cover" | "diff" | "history";
type GenStatus = "idle" | "fetching-url" | "generating" | "done" | "error";

// Extract bullet strings from base resume text for diff detection
function extractBaseBullets(): Set<string> {
  const lines = BASE_RESUME.split("\n");
  const bullets = new Set<string>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") && trimmed.length > 10) {
      // Only include actual bullets (not section headers like "- Name: ...")
      if (!trimmed.includes(": ") || trimmed.split(": ")[0].length > 30) {
        bullets.add(trimmed.slice(2));
      }
    }
  }
  return bullets;
}

const BASE_BULLETS = extractBaseBullets();

function Index() {
  const [jd, setJd] = useState("");
  const [coverLetter, setCoverLetter] = useState(false);
  const [status, setStatus] = useState<GenStatus>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [resume, setResume] = useState<ResumeJSON | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [jdWarning, setJdWarning] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const todayCount = getTodayCount();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const atsResult = resume
    ? scoreATS(flattenResumeToText(resume), resume.meta.jd_keywords_extracted)
    : null;

  const handleJDChange = useCallback((value: string) => {
    setJd(value);
    setJdWarning("");
    if (value.trim().length > 50) {
      const warning = validateJD(value);
      if (warning) setJdWarning(warning);
    }
  }, []);

  const handleClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleJDChange(text);
      textareaRef.current?.focus();
    } catch {
      setError("Clipboard access denied. Please paste manually.");
    }
  };

  const handleGenerate = useCallback(async () => {
    setError("");
    setShowDiff(false);
    const trimmedJD = jd.trim();
    if (!trimmedJD) return;

    let finalJD = trimmedJD;

    // URL fetch if needed
    if (detectInputType(trimmedJD) === "url") {
      setStatus("fetching-url");
      setStatusMsg("Fetching job description from URL…");
      try {
        const result = await fetchJDFromUrl({ data: { url: trimmedJD } });
        finalJD = result.jdText;
        setJd(finalJD);
      } catch (e) {
        setStatus("error");
        setError((e as Error).message);
        return;
      }
    }

    // Pre-flight validation
    const warning = validateJD(finalJD);
    if (warning) setJdWarning(warning);

    setStatus("generating");
    setStatusMsg("Tailoring resume with GPT-4o…");

    try {
      const result = await generateResume({ data: { jd: finalJD, includeCoverLetter: coverLetter } });
      setResume(result.resume);
      setStatus("done");
      setActiveTab("resume");

      // Rate check (only on success)
      try { checkAndIncrementRate(); } catch (e) {
        setStatus("error");
        setError((e as Error).message);
        return;
      }

      // Log to application tracker
      const ats = scoreATS(flattenResumeToText(result.resume), result.resume.meta.jd_keywords_extracted);
      addApplication({
        company: result.resume.meta.company || "Unknown",
        role: result.resume.meta.target_role || "Unknown",
        dateApplied: new Date().toISOString(),
        atsScore: ats.score,
        status: "Applied",
        jdSnippet: finalJD.slice(0, 200),
        notes: "",
        resumeFilename: "",
      });
      setHistoryRefresh(n => n + 1);
    } catch (e) {
      setStatus("error");
      setError((e as Error).message);
    }
  }, [jd, coverLetter]);

  const handleDownload = async () => {
    if (!resume) return;
    try {
      const filename = await buildAndDownloadDocx(resume);
      // Update the latest tracker entry with filename
      const apps = getApplications();
      if (apps.length > 0 && !apps[0].resumeFilename) {
        updateApplication(apps[0].id, { resumeFilename: filename });
      }
    } catch (e) {
      setError(`Download failed: ${(e as Error).message}`);
    }
  };

  const handleRegenSection = async (section: "summary" | "skills" | "experience" | "projects") => {
    if (!resume || !jd) return;
    setStatusMsg(`Regenerating ${section}…`);
    setStatus("generating");
    try {
      const sectionPrompt = `Regenerate ONLY the "${section}" field in the JSON. Keep all other fields exactly as they are. The JD is:\n${jd.trim()}`;
      const result = await generateResume({ data: { jd: sectionPrompt, includeCoverLetter: false } });
      setResume(prev => prev ? { ...prev, [section]: result.resume[section] } : result.resume);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setStatusMsg("");
      setError((e as Error).message);
    }
  };

  const isGenerating = status === "fetching-url" || status === "generating";
  const canGenerate = jd.trim().length > 0 && !isGenerating;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // ⌘↵ or Ctrl+↵ → Generate
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (canGenerate) handleGenerate();
      }
      // H → History tab (when not typing)
      if (e.key === "h" && document.activeElement?.tagName !== "TEXTAREA") {
        setActiveTab("history");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canGenerate, handleGenerate]);

  return (
    <div className="min-h-screen bg-ambient flex flex-col items-center p-6 selection:bg-accent/20">
      {/* Nav */}
      <nav className="w-full max-w-6xl glass-panel rounded-2xl px-5 py-3 flex items-center justify-between mb-6 animate-[float-in_0.8s_var(--ease-out-expo)_both]">
        <div className="flex items-center gap-4">
          <div className="size-8 rounded-lg bg-foreground flex items-center justify-center">
            <div className="size-2.5 bg-background rounded-full animate-pulse" />
          </div>
          <span className="font-semibold tracking-tight text-sm">ResumeOS</span>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-foreground/50 font-medium">v1.1 · Pranav Koduru</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-foreground/40">
            {todayCount}/{DAILY_REQUEST_LIMIT} today
          </span>
          <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 px-2 py-1 border border-border rounded-md">
            GPT-4o
          </div>
        </div>
      </nav>

      <main className="w-full max-w-6xl grid grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
        {/* ── LEFT: Input ── */}
        <div className="col-span-5 flex flex-col gap-6 animate-[float-in_1s_var(--ease-out-expo)_both]">
          <section className="glass-panel rounded-3xl p-6 flex-1 flex flex-col min-h-[420px]">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/40">Job Description</h2>
              <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                Auto-detect active
              </span>
            </header>

            {/* JD Warning */}
            {jdWarning && (
              <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-[11px] text-yellow-800">
                {jdWarning}
              </div>
            )}

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={jd}
                onChange={e => handleJDChange(e.target.value)}
                placeholder="Paste job description or drop a LinkedIn / Indeed URL…"
                className="w-full h-full min-h-[260px] bg-transparent resize-none outline-none text-[15px] leading-relaxed placeholder:text-foreground/30 font-mono"
              />
              {jd.length > 0 && (
                <span className="absolute bottom-1 right-1 text-[9px] font-mono text-foreground/30">
                  {jd.length} chars
                </span>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/30 to-transparent" />
            </div>

            <footer className="mt-4 pt-4 border-t border-border flex gap-2">
              <button
                onClick={handleClipboard}
                className="flex-1 py-2.5 glass-panel rounded-xl text-sm font-medium hover:bg-white/70 transition-all"
              >
                From clipboard
              </button>
              <button
                onClick={() => { setJd(""); setError(""); setJdWarning(""); }}
                className="px-4 py-2.5 glass-panel rounded-xl text-sm font-medium hover:bg-white/70 transition-all text-foreground/50"
              >
                Clear
              </button>
            </footer>
          </section>

          {/* Cover letter toggle */}
          <label className="glass-panel rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium">Generate cover letter</div>
              <div className="text-xs text-foreground/50 mt-0.5">+30s · matched tone & keywords</div>
            </div>
            <button
              type="button"
              onClick={() => setCoverLetter(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${coverLetter ? "bg-foreground" : "bg-foreground/15"}`}
            >
              <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${coverLetter ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>

          {/* Error */}
          {error && (
            <div className="glass-panel rounded-2xl px-5 py-4 bg-red-50/50 border-red-200 text-red-700 text-sm">
              {error}
              <button onClick={() => setError("")} className="ml-2 text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-5 bg-foreground text-background rounded-2xl font-semibold tracking-tight shadow-xl shadow-foreground/10 hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.99] group disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-3 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                {statusMsg}
              </span>
            ) : (
              <>Tailor Resume <span className="opacity-50 font-normal ml-1.5 group-hover:translate-x-1 transition-transform inline-block">→</span></>
            )}
          </button>
        </div>

        {/* ── RIGHT: Output ── */}
        <div className="col-span-7 flex flex-col gap-6 animate-[float-in_1.2s_var(--ease-out-expo)_both]">
          {/* ATS Ring */}
          <div className="glass-panel rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative size-20 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="5" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="oklch(0.55 0.21 260)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34 * (atsResult ? atsResult.score / 100 : 0)} ${2 * Math.PI * 34}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="font-mono text-xl font-bold tracking-tighter">
                  {atsResult ? atsResult.score : "—"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg tracking-tight">ATS Match</h3>
                <p className="text-xs text-foreground/50 mt-0.5">
                  {resume ? `${resume.meta.target_role} at ${resume.meta.company}` : "Waiting for JD…"}
                </p>
                {atsResult && (
                  <p className="text-[10px] text-foreground/40 mt-0.5">
                    {atsResult.matched.length}/{atsResult.totalKeywords} keywords covered
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 max-w-[300px] justify-end">
              {(atsResult?.matched ?? []).slice(0, 7).map(k => (
                <span key={k} className="px-2 py-1 rounded-md bg-white/50 border border-white/70 text-[10px] font-medium text-green-700">{k}</span>
              ))}
              {(atsResult?.missing ?? []).slice(0, 3).map(k => (
                <span key={k} className="px-2 py-1 rounded-md bg-red-50/50 border border-red-200/50 text-[10px] font-medium text-red-500">{k}</span>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="glass-panel rounded-3xl overflow-hidden relative flex-1 min-h-[520px]">
            {/* Tab Bar */}
            <div className="absolute top-0 inset-x-0 h-14 bg-white/50 backdrop-blur-md border-b border-white/30 z-10 px-6 flex items-center justify-between">
              <div className="flex gap-5 h-full items-end">
                {(["resume", "cover", "diff", "history"] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs pb-3.5 transition capitalize ${activeTab === tab ? "font-semibold text-accent border-b-2 border-accent" : "font-medium text-foreground/40 hover:text-foreground/60"}`}
                  >
                    {tab === "cover" ? "Cover Letter" : tab}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {activeTab === "diff" && resume && (
                  <button
                    onClick={() => setShowDiff(v => !v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${showDiff ? "bg-yellow-100 text-yellow-700" : "bg-foreground/5 text-foreground/50"}`}
                  >
                    {showDiff ? "Diff on" : "Diff off"}
                  </button>
                )}
                {resume && (
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium hover:opacity-90 transition shadow-sm"
                  >
                    Download .docx
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="pt-20 px-8 pb-8 h-full overflow-y-auto bg-white/30">
              {/* Empty state */}
              {!resume && activeTab !== "history" && (
                <div className="flex flex-col items-center justify-center h-60 text-foreground/30 text-sm gap-2">
                  <span className="text-3xl">↑</span>
                  Paste a JD and hit Tailor Resume
                </div>
              )}

              {/* Resume tab */}
              {activeTab === "resume" && resume && (
                <>
                  {/* Per-section regenerate buttons */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {(["summary", "skills", "experience", "projects"] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => handleRegenSection(s)}
                        disabled={isGenerating}
                        className="text-[10px] px-2.5 py-1 glass-panel rounded-lg hover:bg-white/70 transition-all disabled:opacity-40 capitalize"
                      >
                        ↻ {s}
                      </button>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ResumePreview resume={resume} originalBullets={BASE_BULLETS} showDiff={false} />
                  </div>
                </>
              )}

              {/* Diff tab */}
              {activeTab === "diff" && resume && (
                <>
                  <div className="flex items-center gap-3 mb-4 text-xs text-foreground/50">
                    <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-yellow-100/60 border border-yellow-300" /> Rewritten bullet</span>
                    <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-white border border-gray-200" /> Unchanged</span>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ResumePreview resume={resume} originalBullets={BASE_BULLETS} showDiff={true} />
                  </div>
                </>
              )}

              {/* Cover letter tab */}
              {activeTab === "cover" && (
                <div className="max-w-2xl mx-auto">
                  {resume?.cover_letter ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <pre className="whitespace-pre-wrap font-['Times_New_Roman'] text-[12.5px] leading-relaxed text-black">
                        {resume.cover_letter}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-foreground/30 text-sm">
                      {resume ? "Enable cover letter toggle and regenerate." : "Generate a resume first."}
                    </div>
                  )}
                </div>
              )}

              {/* History tab */}
              {activeTab === "history" && (
                <HistoryPanel refreshTrigger={historyRefresh} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating command bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-panel px-5 py-2.5 rounded-full flex items-center gap-5 animate-[float-in_1.4s_var(--ease-out-expo)_both]">
        <Kbd k="⌘K" label="Command" />
        <div className="h-3.5 w-px bg-border" />
        <Kbd k="⌘↵" label="Generate" />
        <div className="h-3.5 w-px bg-border" />
        <Kbd k="H" label="History" />
      </div>
    </div>
  );
}

function Kbd({ k, label }: { k: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="px-1.5 py-0.5 bg-foreground/5 rounded text-[10px] font-mono">{k}</kbd>
      <span className="text-xs font-medium text-foreground/60">{label}</span>
    </div>
  );
}
