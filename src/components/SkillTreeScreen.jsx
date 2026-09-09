import React, { useState } from "react";
import { useSkillTree } from "../hooks/useSkillTree";
import { apiClient } from "../services/api";

export function SkillTreeScreen({ user, onRetake }) {
  const { skillMatrix, studyRemediations, loading } = useSkillTree(user.uid);
  const [remediating, setRemediating] = useState(false);

  const handleRunRemediation = async () => {
    setRemediating(true);
    try {
      await apiClient.triggerSkillRemediation(user.uid);
    } catch (err) {
      alert(err.message);
    } finally {
      setRemediating(false);
    }
  };

  const entries = Object.entries(skillMatrix || {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Competency Matrix &amp; Horizon</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time competency leveling calibrated by turn-by-turn evaluations.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRunRemediation}
            disabled={remediating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            {remediating ? "Curating Study Modules..." : "⚡ Curate Study Modules"}
          </button>
          <button
            onClick={onRetake}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition"
          >
            Retake Diagnostic
          </button>
        </div>
      </div>

      {/* Numerical Competency Bars */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active Technical Leveling (Firestore Live)
        </h3>

        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Syncing competency matrix...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl space-y-2">
            <p className="text-xs text-slate-400">No assessed skills yet.</p>
            <button onClick={onRetake} className="text-xs text-indigo-400 hover:underline">
              Launch Diagnostic Assessment ↗
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {entries.map(([domain, data]) => {
              const score = Number(data?.score ?? 0);
              const isLow = score <= 5;
              return (
                <div key={domain} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-200">{domain}</span>
                    <span className={`text-xs font-bold font-mono ${isLow ? "text-rose-400" : "text-indigo-400"}`}>
                      {score} / 10
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${isLow ? "bg-rose-500" : "bg-indigo-500"}`}
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>
                  {data?.last_feedback && (
                    <p className="text-[10px] text-slate-400 italic truncate">"{data.last_feedback}"</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Targeted Study Modules (Technical Content Only) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Targeted Gap Remediation (Articles &amp; Talks)
        </h3>

        {studyRemediations.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 mb-2">No learning recommendations generated yet.</p>
            <button onClick={handleRunRemediation} className="text-xs text-indigo-400 hover:underline">
              Scan Matrix to Bridge Weakest Nodes ↗
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {studyRemediations.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    GAP: {item.skill_domain}[cite: 3]
                  </span>
                  <span className="text-emerald-400 text-xs font-mono font-bold">
                    {Math.round((Number(item.relevance_score) || 0.9) * 100)}% Relevance[cite: 1, 2]
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                <p className="text-[11px] text-slate-400">{item.snippet}</p>

                {item.takeaways?.length > 0 && (
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 block">💡 Why Study This:[cite: 1, 3]</span>
                    <ul className="space-y-0.5">
                      {item.takeaways.map((t, i) => (
                        <li key={i} className="text-[11px] text-slate-300">• {t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-indigo-400 hover:underline inline-block pt-1">
                    Study Module Source ↗[cite: 1, 3]
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}