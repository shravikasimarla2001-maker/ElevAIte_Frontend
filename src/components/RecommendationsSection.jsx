import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Video, 
  BookOpen, 
  ExternalLink, 
  RefreshCw, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Headphones, 
  Square,
  Play,
  Layers,
  CheckCircle2,
  FileText
} from "lucide-react";

// Robust URL sanitizer for markdown artifacts
function sanitizeUrl(rawUrl) {
  if (!rawUrl) return "#";
  const mdMatch = rawUrl.match(/\((https?:\/\/[^\)]+)\)/);
  if (mdMatch) return mdMatch[1];
  const cleaned = rawUrl.replace(/[\[\]]/g, "").trim();
  const urlMatch = cleaned.match(/https?:\/\/[^\s]+/);
  return urlMatch ? urlMatch[0] : cleaned;
}

// Extract YouTube ID for video cover thumbnail
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export function RecommendationsSection({ items = [], loading = false, onRefresh }) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [playingId, setPlayingId] = useState(null); // Tracks specific item URL/ID playing
  const synthRef = useRef(null);

  // 1. Group items by clean URL so multiple domains merge into one card
  const consolidatedItems = React.useMemo(() => {
    const map = new Map();
    
    items.forEach((item) => {
      const cleanUrl = sanitizeUrl(item.url);
      const key = cleanUrl !== "#" ? cleanUrl : item.title;
      
      const domain = item.skill_domain;
      const existingDomains = Array.isArray(item.skill_domains) 
        ? item.skill_domains 
        : (domain ? [domain] : []);

      if (!map.has(key)) {
        map.set(key, {
          ...item,
          url: cleanUrl,
          skill_domains: [...new Set(existingDomains)],
          summary_points: item.summary_points || item.takeaways || []
        });
      } else {
        const existing = map.get(key);
        const combined = new Set([...existing.skill_domains, ...existingDomains]);
        existing.skill_domains = Array.from(combined);
      }
    });

    return Array.from(map.values());
  }, [items]);

  // Extract all unique domain tags for filter buttons
  const allDomains = React.useMemo(() => {
    const set = new Set();
    consolidatedItems.forEach(i => i.skill_domains?.forEach(d => set.add(d)));
    return Array.from(set);
  }, [consolidatedItems]);

  const filteredItems = consolidatedItems.filter(item => {
    if (selectedFilter === "all") return true;
    return item.skill_domains?.includes(selectedFilter);
  });

  // 2. Browser Text-to-Speech Engine for Commute Espresso Audio
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleToggleAudio = (item, uniqueKey) => {
    if (!synthRef.current) {
      alert("Text-to-speech audio is not supported in this browser.");
      return;
    }

    // Stop current audio if clicking the active one
    if (playingId === uniqueKey) {
      synthRef.current.cancel();
      setPlayingId(null);
      return;
    }

    // Stop any existing speech
    synthRef.current.cancel();

    // Prepare spoken narrative: Title + Snippet + Summary Points
    const speechText = `
      Briefing for: ${item.title}.
      Target Competencies: ${item.skill_domains?.join(", ") || "Technical architecture"}.
      Overview: ${item.snippet}.
      Key Architectural Summary:
      ${item.summary_points?.map((p, i) => `Point ${i + 1}: ${p}`).join(". ")}
    `;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    setPlayingId(uniqueKey);
    synthRef.current.speak(utterance);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6 transition-all">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
              RAG Remediation & Upward Trajectory Feed
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Curated architectural guides and talks addressing multi-domain gaps.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Discovering with RAG..." : "Scan & Refresh Feed"}</span>
        </button>
      </div>

      {/* Domain Filters */}
      {allDomains.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mr-1 shrink-0">
            <Filter className="h-3 w-3" />
            <span>Filter Gap:</span>
          </div>
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            All Remediation ({consolidatedItems.length})
          </button>
          {allDomains.map(d => (
            <button
              key={d}
              onClick={() => setSelectedFilter(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedFilter === d
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Feed Cards */}
      {loading ? (
        <div className="py-14 text-center space-y-3">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Synthesizing vector match results across architectural catalogs...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-3">
          <Sparkles className="h-6 w-6 text-indigo-400 mx-auto opacity-70" />
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No recommendations generated. Click <strong>"Scan & Refresh Feed"</strong> to discover content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item, idx) => {
            const isYouTube = item.source_type?.toLowerCase() === "youtube" || item.url?.includes("youtube.com") || item.url?.includes("youtu.be");
            const ytId = isYouTube ? getYouTubeId(item.url) : null;
            const matchScore = Math.round((Number(item.relevance_score) || 0.92) * 100);
            const cardKey = `card-${idx}-${item.url}`;
            const isAudioActive = playingId === cardKey;

            return (
              <div
                key={cardKey}
                className="group relative bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="space-y-3">
                  
                  {/* Card Header: Source Badge & Fit Score */}
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isYouTube
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    }`}>
                      {isYouTube ? (
                        <>
                          <Video className="h-3 w-3" />
                          <span>YOUTUBE SESSION</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-3 w-3" />
                          <span>OFFICIAL ARCHITECTURE SPEC</span>
                        </>
                      )}
                    </span>

                    <div className="flex items-center space-x-1 text-emerald-500 font-mono text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <span>{matchScore}%</span>
                      <span className="text-[10px] font-sans font-medium text-emerald-600/80">Match</span>
                    </div>
                  </div>

                  {/* Multiple Skill Domain Pills on the Same Card */}
                  {item.skill_domains?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mr-1">
                        <Layers className="h-3 w-3 text-indigo-400" /> Bridging:
                      </span>
                      {item.skill_domains.map((dom, dIdx) => (
                        <span 
                          key={dIdx}
                          className="bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-indigo-500/20"
                        >
                          {dom}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* YouTube Video Cover Preview (with click to redirect) */}
                  {isYouTube && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group/video"
                    >
                      <img
                        src={ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-300 opacity-90 group-hover/video:opacity-100"
                        onError={(e) => {
                          // Fallback if custom image doesn't exist
                          e.target.src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60";
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover/video:bg-slate-950/20 transition-colors">
                        <div className="h-11 w-11 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover/video:scale-110 group-hover/video:bg-rose-600 transition-all">
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                        YouTube
                      </span>
                    </a>
                  )}

                  {/* Title & Snippet */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    {item.snippet && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {item.snippet}
                      </p>
                    )}
                  </div>

                  {/* 3-Point Executive Summary */}
                  {Array.isArray(item.summary_points) && item.summary_points.length > 0 && (
                    <div className="bg-white/70 dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-500 tracking-wider uppercase flex items-center gap-1.5">
                        <FileText className="h-3 w-3" /> Core Architecture Summary (3 Points):
                      </span>
                      <ul className="space-y-1.5">
                        {item.summary_points.slice(0, 3).map((pt, pIdx) => (
                          <li key={pIdx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                            <span className="leading-snug">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Isolated Audio & Working Redirect */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleAudio(item, cardKey)}
                    className={`flex items-center space-x-1.5 text-[11px] font-semibold transition px-2.5 py-1 rounded-lg ${
                      isAudioActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {isAudioActive ? (
                      <>
                        <Square className="h-3 w-3 fill-current" />
                        <span>Stop Audio Briefing</span>
                      </>
                    ) : (
                      <>
                        <Headphones className="h-3.5 w-3.5 text-indigo-400" />
                        <span>2-Min Audio Espresso</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{isYouTube ? "Watch on YouTube" : "Read Full Specification"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}