import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Sparkles, 
  ArrowUpRight, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Layers 
} from "lucide-react";

/**
 * Extracts YouTube video ID from various standard URL formats.
 */
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function RecommendationCard({ item }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isYouTube = item.source_type === "youtube" || (item.url && item.url.includes("youtube.com"));
  const ytVideoId = isYouTube ? getYouTubeId(item.url) : null;

  // Support both array of domains and single domain string
  const domains = Array.isArray(item.skill_domains)
    ? item.skill_domains
    : item.skill_domain
    ? [item.skill_domain]
    : [];

  // Use the 3-point summary points, falling back to takeaways
  const summaryPoints = item.summary_points || item.takeaways || [];

  // Cleanup audio if component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Per-card speech synthesis toggle
  const toggleAudio = () => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any other speech

    const spokenScript =
      item.audio_briefing_text ||
      `${item.title}. Key takeaways: ${summaryPoints.join(". ")}`;

    const utterance = new SpeechSynthesisUtterance(spokenScript);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition space-y-4 shadow-sm">
      
      {/* Top Header: Badge, Domains, Match Score */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Source Type Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                isYouTube
                  ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                  : "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
              }`}
            >
              {isYouTube ? (
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              ) : (
                <Globe className="h-3 w-3" />
              )}
              {isYouTube ? "YouTube Talk" : "Official Guide"}
            </span>

            {/* Target Skill Domains Badges */}
            {domains.map((domain, dIdx) => (
              <span
                key={dIdx}
                className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
              >
                <Layers className="h-2.5 w-2.5" />
                {domain}
              </span>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug pt-0.5">
            {item.title}
          </h4>
        </div>

        {/* Fit / Relevance Percentage */}
        <div className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-mono font-bold shrink-0">
          {Math.round((item.relevance_score || 0.92) * 100)}% Match
        </div>
      </div>

      {/* Snippet / Context */}
      {item.snippet && (
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
          {item.snippet}
        </p>
      )}

      {/* YouTube Thumbnail Preview Card */}
      {isYouTube && ytVideoId && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-800"
        >
          <img
            src={`https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`}
            alt={item.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 flex items-center justify-center transition-colors">
            <div className="h-11 w-11 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
          </div>
        </a>
      )}

      {/* 3-Point Architectural Takeaways */}
      {summaryPoints.length > 0 && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            3-Point Core Architecture Takeaways:
          </span>
          <ul className="space-y-1.5">
            {summaryPoints.map((point, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2 leading-relaxed"
              >
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5">
                  •
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Controls: Commute Audio Player & Direct Link */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60">
        {/* Audio Briefing Button */}
        <button
          onClick={toggleAudio}
          type="button"
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isPlaying
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
              : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="h-3 w-3 fill-current" />
              <span>Stop Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3 w-3 text-indigo-500" />
              <span>2-Min Espresso Audio</span>
            </>
          )}
        </button>

        {/* Source Redirection Link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition"
        >
          <span>{isYouTube ? "Watch Full Talk" : "Read Original Source"}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}