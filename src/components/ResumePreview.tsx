import type { ResumeJSON } from "../types/resume";

interface Props {
  resume: ResumeJSON;
  originalBullets?: Set<string>;  // bullets from base resume — unchanged bullets
  showDiff?: boolean;
}

export function ResumePreview({ resume, originalBullets, showDiff = false }: Props) {
  const { header, summary, skills, experience, projects, education, certifications } = resume;

  function bulletClass(text: string): string {
    if (!showDiff || !originalBullets) return "";
    // A bullet is "changed" if it does NOT appear in the original set
    return originalBullets.has(text) ? "" : "bg-yellow-100/60 rounded px-0.5";
  }

  return (
    <article className="font-['Times_New_Roman'] text-[12px] leading-snug text-black max-w-[680px] mx-auto">
      {/* Header */}
      <header className="text-center mb-3">
        <h1 className="text-[18px] font-bold tracking-tight">{header.name}</h1>
        <p className="text-[11px] mt-0.5">{header.role_title}</p>
        <p className="text-[10px] text-gray-600 mt-1">
          {header.phone} · {header.email} · {header.location} ·{" "}
          <a href={header.linkedin} target="_blank" rel="noreferrer" className="underline">LinkedIn</a> ·{" "}
          <a href={header.github} target="_blank" rel="noreferrer" className="underline">GitHub</a>
        </p>
      </header>
      <hr className="border-black border-t my-2" />

      {/* Summary */}
      <Section title="Summary">
        <p className="text-[11px] text-justify">{summary}</p>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        {Object.entries(skills).map(([label, items]) => (
          <p key={label} className="text-[11px] mb-0.5">
            <span className="font-bold">{label}: </span>{items.join(", ")}
          </p>
        ))}
      </Section>

      {/* Experience */}
      <Section title="Experience">
        {experience.map((exp, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-[11.5px]">{exp.company} — {exp.title}</span>
              <span className="text-[10.5px] text-gray-600 font-mono">{exp.dates}</span>
            </div>
            <p className="text-[10.5px] italic text-gray-600 mb-1">{exp.location}</p>
            <ul className="list-disc pl-4 space-y-0.5 marker:text-gray-500">
              {exp.bullets.map((b, j) => (
                <li key={j} className={`text-[11px] ${bulletClass(b)}`}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      {/* Projects */}
      <Section title="Projects">
        {projects.map((proj, i) => (
          <div key={i} className="mb-3">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="font-bold text-[11.5px]">{proj.name}</span>
              <span className="text-[10.5px] text-gray-600">| {proj.stack}</span>
              {proj.is_new && <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded">new</span>}
            </div>
            <ul className="list-disc pl-4 space-y-0.5 mt-0.5 marker:text-gray-500">
              {proj.bullets.map((b, j) => (
                <li key={j} className={`text-[11px] ${bulletClass(b)}`}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      {/* Education */}
      <Section title="Education">
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-[11.5px]">{education.institution}</span>
          <span className="text-[10.5px] font-mono text-gray-600">{education.dates}</span>
        </div>
        <p className="text-[11px]">{education.degree} · GPA: {education.gpa} · {education.location}</p>
        <p className="text-[11px]"><span className="font-bold">Coursework: </span>{education.coursework}</p>
      </Section>

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="Certifications">
          <p className="text-[11px]">{certifications.join(" · ")}</p>
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3">
      <h2 className="text-[11.5px] font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1.5">{title}</h2>
      {children}
    </section>
  );
}
