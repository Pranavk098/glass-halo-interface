import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeOS — Tailor resumes in under 60 seconds" },
      { name: "description", content: "AI-powered resume tailoring. Paste a job description, get an ATS-optimized, recruiter-ready resume in seconds." },
      { property: "og:title", content: "ResumeOS" },
      { property: "og:description", content: "AI-powered resume tailoring for serious applicants." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" },
    ],
  }),
  component: Index,
});

const KEYWORDS = ["LLM Inference", "PyTorch", "Agentic AI", "Distributed Systems", "vLLM", "RAG", "CUDA"];

function Index() {
  const [jd, setJd] = useState("");
  const [coverLetter, setCoverLetter] = useState(false);

  return (
    <div className="min-h-screen bg-ambient flex flex-col items-center p-6 selection:bg-accent/20">
      {/* Top Nav */}
      <nav className="w-full max-w-6xl glass-panel rounded-2xl px-5 py-3 flex items-center justify-between mb-6 animate-[float-in_0.8s_var(--ease-out-expo)_both]">
        <div className="flex items-center gap-4">
          <div className="size-8 rounded-lg bg-foreground flex items-center justify-center">
            <div className="size-2.5 bg-background rounded-full animate-pulse" />
          </div>
          <span className="font-semibold tracking-tight text-sm">ResumeOS</span>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-foreground/50 font-medium">Base · Pranav_Resume_v4.docx</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/40 px-2 py-1 border border-border rounded-md">
            Locked
          </div>
          <button className="size-8 rounded-full hover:bg-foreground/5 transition-colors flex items-center justify-center text-xs font-mono text-foreground/60">
            PK
          </button>
        </div>
      </nav>

      {/* Workspace */}
      <main className="w-full max-w-6xl grid grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
        {/* Left — Input */}
        <div className="col-span-5 flex flex-col gap-6 animate-[float-in_1s_var(--ease-out-expo)_both]">
          <section className="glass-panel rounded-3xl p-6 flex-1 flex flex-col min-h-[420px]">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/40">Job Description</h2>
              <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                Auto-detect active
              </span>
            </header>
            <div className="flex-1 relative">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste job description or drop a LinkedIn / Indeed URL…"
                className="w-full h-full min-h-[260px] bg-transparent resize-none outline-none text-[15px] leading-relaxed placeholder:text-foreground/30"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/30 to-transparent" />
            </div>
            <footer className="mt-4 pt-4 border-t border-border flex gap-2">
              <button className="flex-1 py-2.5 glass-panel rounded-xl text-sm font-medium hover:bg-white/70 transition-all">
                Paste URL
              </button>
              <button className="flex-1 py-2.5 glass-panel rounded-xl text-sm font-medium hover:bg-white/70 transition-all">
                From clipboard
              </button>
            </footer>
          </section>

          <label className="glass-panel rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium">Generate cover letter</div>
              <div className="text-xs text-foreground/50 mt-0.5">+30s · matched tone & keywords</div>
            </div>
            <button
              type="button"
              onClick={() => setCoverLetter((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${coverLetter ? "bg-foreground" : "bg-foreground/15"}`}
              aria-pressed={coverLetter}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  coverLetter ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>

          <button className="w-full py-5 bg-foreground text-background rounded-2xl font-semibold tracking-tight shadow-xl shadow-foreground/10 hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.99] group">
            Tailor Resume
            <span className="opacity-50 font-normal ml-1.5 group-hover:translate-x-1 transition-transform inline-block">→</span>
          </button>
        </div>

        {/* Right — Preview */}
        <div className="col-span-7 flex flex-col gap-6 animate-[float-in_1.2s_var(--ease-out-expo)_both]">
          {/* ATS bar */}
          <div className="glass-panel rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative size-20 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="5" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="oklch(0.55 0.21 260)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34 * 0.87} ${2 * Math.PI * 34}`}
                  />
                </svg>
                <span className="font-mono text-xl font-bold tracking-tighter">87</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg tracking-tight">ATS Match</h3>
                <p className="text-xs text-foreground/50 mt-0.5">Strong fit · AI/ML Engineer at Anthropic</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 max-w-[300px] justify-end">
              {KEYWORDS.map((k) => (
                <span
                  key={k}
                  className="px-2 py-1 rounded-md bg-white/50 border border-white/70 text-[10px] font-medium"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="glass-panel rounded-3xl overflow-hidden relative flex-1 min-h-[520px]">
            <div className="absolute top-0 inset-x-0 h-14 bg-white/50 backdrop-blur-md border-b border-white/30 z-10 px-6 flex items-center justify-between">
              <div className="flex gap-5 h-full items-end">
                <button className="text-xs font-semibold text-accent border-b-2 border-accent pb-3.5">Resume</button>
                <button className="text-xs font-medium text-foreground/40 pb-3.5 hover:text-foreground/60 transition">
                  Cover Letter
                </button>
                <button className="text-xs font-medium text-foreground/40 pb-3.5 hover:text-foreground/60 transition">
                  Diff
                </button>
              </div>
              <button className="px-3.5 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium hover:opacity-90 transition shadow-sm">
                Download .docx
              </button>
            </div>

            <div className="pt-20 px-10 pb-10 h-full overflow-y-auto bg-white/30">
              <article className="max-w-2xl mx-auto font-['Inter'] text-[12.5px] leading-relaxed text-foreground/90">
                <header className="text-center mb-6">
                  <h1 className="text-2xl font-bold tracking-tight">Pranav Koduru</h1>
                  <p className="text-[11px] text-foreground/60 mt-1">
                    pranav@example.com · linkedin.com/in/pranav-koduru · github.com/Pranavk098
                  </p>
                </header>

                <Section title="Experience">
                  <Role
                    title="ML Engineer · Stealth AI Startup"
                    meta="2024 — Present"
                    bullets={[
                      "Reduced LLM inference latency 3.2× by implementing speculative decoding with vLLM on A100 clusters.",
                      "Architected agentic RAG pipeline serving 40k QPS with sub-200ms p99 via async batching.",
                      "Built distributed fine-tuning harness for 70B param models with FSDP + DeepSpeed.",
                    ]}
                  />
                  <Role
                    title="AI Research Intern · Forward Labs"
                    meta="2023"
                    bullets={[
                      "Published quantization technique cutting memory 58% with <1% perplexity drop.",
                      "Open-sourced CUDA kernels adopted by 2.1k+ GitHub repositories.",
                    ]}
                  />
                </Section>

                <Section title="Projects">
                  <Role
                    title="Agentic Coding Harness"
                    meta="Python · Claude · LangGraph"
                    bullets={[
                      "Multi-agent system completing SWE-bench tasks at 47% — top decile of academic baselines.",
                    ]}
                  />
                </Section>

                <Section title="Skills">
                  <p className="text-[11.5px] text-foreground/75">
                    PyTorch · vLLM · CUDA · Triton · Ray · Kubernetes · FastAPI · Postgres · TypeScript
                  </p>
                </Section>
              </article>
            </div>
          </div>
        </div>
      </main>

      {/* Floating command bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-panel px-5 py-2.5 rounded-full flex items-center gap-5 animate-[float-in_1.4s_var(--ease-out-expo)_both]">
        <Kbd k="⌘ K" label="Command" />
        <div className="h-3.5 w-px bg-border" />
        <Kbd k="G" label="Guidelines" />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/50 border-b border-foreground/10 pb-1 mb-3">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Role({ title, meta, bullets }: { title: string; meta: string; bullets: string[] }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="font-semibold text-[12.5px]">{title}</h3>
        <span className="text-[10.5px] text-foreground/50 font-mono">{meta}</span>
      </div>
      <ul className="list-disc pl-4 space-y-0.5 marker:text-foreground/30">
        {bullets.map((b, i) => (
          <li key={i} className="text-[11.5px] text-foreground/75 leading-snug">{b}</li>
        ))}
      </ul>
    </div>
  );
}
