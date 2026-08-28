import React from "react";

export function RecommendationCard({ item }) {
  const isYouTube = item.source_type === "youtube" || (item.url && item.url.includes("youtube.com"));

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 hover:border-indigo-500/50 transition space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              isYouTube ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}>
              {isYouTube ? "YouTube Deep Dive" : "Official Guide / Blog"}
            </span>
            <span className="text-xs text-indigo-400 font-medium">
              🎯 For Skill: {item.skill_domain}
            </span>
          </div>
          <h4 className="font-semibold text-slate-100 text-sm leading-snug">{item.title}</h4>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-mono font-bold whitespace-nowrap">
          {Math.round((item.relevance_score || 0.9) * 100)}% Match
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
        {item.snippet}
      </p>

      {/* AI "Why Watch/Read This" Takeaways */}
      {item.takeaways && item.takeaways.length > 0 && (
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1.5">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
            💡 Why Study This (Skill Gap Alignment):
          </span>
          <ul className="space-y-1">
            {item.takeaways.map((takeaway, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-1 flex justify-end">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 px-3.5 py-2 rounded-lg border border-indigo-800/40 transition"
        >
          {isYouTube ? "▶ Watch Full Talk" : "🌐 Read Original Source"} ↗
        </a>
      </div>
    </div>
  );
}