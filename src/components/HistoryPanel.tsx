import { useState, useEffect } from "react";
import { getApplications, updateApplication, deleteApplication, exportToCSV } from "../lib/appTracker";
import type { AppEntry } from "../types/resume";

const STATUS_OPTIONS: AppEntry["status"][] = [
  "Applied", "Phone Screen", "Technical", "Offer", "Rejected", "No Response"
];

const STATUS_COLOR: Record<AppEntry["status"], string> = {
  Applied: "bg-blue-100 text-blue-700",
  "Phone Screen": "bg-purple-100 text-purple-700",
  Technical: "bg-yellow-100 text-yellow-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  "No Response": "bg-gray-100 text-gray-500",
};

interface Props {
  refreshTrigger?: number;  // increment to force a refresh
}

export function HistoryPanel({ refreshTrigger }: Props) {
  const [apps, setApps] = useState<AppEntry[]>([]);

  useEffect(() => {
    setApps(getApplications());
  }, [refreshTrigger]);

  function handleStatusChange(id: string, status: AppEntry["status"]) {
    updateApplication(id, { status });
    setApps(getApplications());
  }

  function handleDelete(id: string) {
    deleteApplication(id);
    setApps(getApplications());
  }

  // ATS trend: last 10 scores for sparkline
  const last10 = apps.slice(0, 10).map(a => a.atsScore).reverse();
  const maxScore = Math.max(...last10, 1);

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-foreground/40 text-sm">
        No applications yet. Generate your first resume to start tracking.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ATS Trend Sparkline */}
      {last10.length > 1 && (
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">ATS Score Trend</div>
          <div className="flex items-end gap-1 h-12">
            {last10.map((score, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-accent/60 transition-all"
                  style={{ height: `${(score / maxScore) * 44}px` }}
                />
                <span className="text-[9px] font-mono text-foreground/40">{score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportToCSV}
          className="text-xs px-3 py-1.5 glass-panel rounded-lg hover:bg-white/70 transition-all font-medium"
        >
          Export CSV
        </button>
      </div>

      {/* Applications Table */}
      <div className="space-y-2">
        {apps.map(app => (
          <div key={app.id} className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm truncate">{app.company}</span>
                <span className="text-xs text-foreground/50 truncate">{app.role}</span>
              </div>
              <div className="text-[10px] text-foreground/40 mt-0.5">
                {new Date(app.dateApplied).toLocaleDateString()} · ATS {app.atsScore}%
              </div>
              {app.notes && <div className="text-[10px] text-foreground/50 mt-0.5 truncate">{app.notes}</div>}
            </div>

            <select
              value={app.status}
              onChange={e => handleStatusChange(app.id, e.target.value as AppEntry["status"])}
              className={`text-[10px] px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${STATUS_COLOR[app.status]}`}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button
              onClick={() => handleDelete(app.id)}
              className="text-foreground/20 hover:text-destructive transition-colors text-xs"
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
