import React, { useState, useEffect } from "react";
import { 
  Compass, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  RefreshCw, 
  ChevronRight,
  BookOpen,
  ExternalLink,
  DollarSign
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { apiClient } from "../services/api";

export function OpportunityRadarScreen({ user, targetRole }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [recalibrating, setRecalibrating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [horizonData, setHorizonData] = useState({
    next_level_concepts: [],
    opportunities: []
  });

  // Normalizer: Handles both backend schema variants (raw search indexing & AI synthesized)
  const normalizeOpportunities = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      const matchScore = item.match_percentage != null 
        ? item.match_percentage 
        : (item.fit_score != null ? Math.round(item.fit_score * 100) : 88);

      const typeOrLevel = item.level || item.type || "Opportunity";

      return {
        title: item.title || "Production Architecture Trajectory",
        company: item.company || item.target_company || "Target Company",
        level: typeOrLevel,
        match_percentage: matchScore,
        compensation_range: item.compensation_range || (typeOrLevel === "Job Opening" ? "$170,000 - $220,000" : "Prizes & Recognition"),
        unlocked_by: item.unlocked_by?.length ? item.unlocked_by : ["System Design", "Cloud Infrastructure", "API Architecture"],
        blocking_gaps: item.blocking_gaps?.length ? item.blocking_gaps : ["Production Resiliency Patterns", "Concurrency Optimization"],
        strategic_advice: item.strategic_advice || item.snippet || "Deep dive into production deployment blueprints and architectural tradeoffs.",
        url: item.url || ""
      };
    });
  };

  // 1. Sync live with Firestore and normalize stored items
  useEffect(() => {
    if (!user?.uid) {
      setInitialLoading(false);
      return;
    }

    const docRef = doc(db, "users", user.uid, "horizon_analytics", "next_level_roadmap");
    const unsubscribe = onSnapshot(
      docRef,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const storedConcepts = data.next_level_concepts || [];
          const storedOpps = data.opportunities || [];

          if (storedOpps.length > 0) {
            setHorizonData({
              next_level_concepts: storedConcepts,
              opportunities: normalizeOpportunities(storedOpps) // <-- Normalizes stored Firestore data
            });
            setInitialLoading(false);
            return;
          }

          // If no opportunities are stored, trigger discover API
          try {
            const apiRes = await apiClient.getRadarDiscover(user.uid);
            const opps = apiRes?.opportunities || apiRes || [];
            setHorizonData({
              next_level_concepts: storedConcepts,
              opportunities: normalizeOpportunities(opps)
            });
          } catch (err) {
            console.error("Failed to load initial opportunities:", err);
          }
        } else {
          // Document doesn't exist yet
          try {
            const apiRes = await apiClient.getRadarDiscover(user.uid);
            const opps = apiRes?.opportunities || apiRes || [];
            setHorizonData({
              next_level_concepts: [],
              opportunities: normalizeOpportunities(opps)
            });
          } catch (err) {
            console.error("Initial discovery fetch failed:", err);
          }
        }
        setInitialLoading(false);
      },
      (err) => {
        console.error("Firestore sync error:", err);
        setErrorMsg("Failed to synchronize roadmap from database.");
        setInitialLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Trigger scan / recalibrate through apiClient
  // const handleRecalibrate = async () => {
  //   if (!user?.uid) return;
  //   setRecalibrating(true);
  //   setErrorMsg("");
  //   setSuccessMsg("");

  //   try {
  //     const [discoveryRes, scanRes] = await Promise.allSettled([
  //       apiClient.getRadarDiscover(user.uid),
  //       apiClient.triggerOpportunityScan(user.uid)
  //     ]);

  //     const freshOpps = discoveryRes.status === "fulfilled" 
  //       ? (discoveryRes.value?.opportunities || discoveryRes.value)
  //       : (scanRes.status === "fulfilled" ? scanRes.value?.opportunities : []);

  //     const freshConcepts = scanRes.status === "fulfilled" 
  //       ? (scanRes.value?.next_level_concepts || horizonData.next_level_concepts)
  //       : horizonData.next_level_concepts;

  //     setHorizonData({
  //       next_level_concepts: freshConcepts,
  //       opportunities: normalizeOpportunities(freshOpps)
  //     });

  //     setSuccessMsg("Radar recalibrated and updated with fresh benchmarks!");
  //   } catch (err) {
  //     setErrorMsg(err.message || "Failed to recalibrate radar.");
  //   } finally {
  //     setRecalibrating(false);
  //   }
  // };
  const handleRecalibrate = async () => {
    if (!user?.uid) return;
    setRecalibrating(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Single unified API call
      const res = await apiClient.triggerOpportunityScan(user.uid);

      setHorizonData({
        next_level_concepts: res.next_level_concepts || [],
        opportunities: normalizeOpportunities(res.opportunities || [])
      });

      setSuccessMsg("Radar recalibrated and updated with live market opportunities!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to recalibrate radar.");
    } finally {
      setRecalibrating(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-16 space-y-3">
        <span className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block" />
        <p className="text-xs text-slate-400">Loading stored opportunities &amp; trajectory roadmap...</p>
      </div>
    );
  }

  const { next_level_concepts, opportunities } = horizonData;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090d16] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Opportunity Radar &amp; Next-Level Trajectory
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calibrated against target role: <strong className="text-indigo-400">{targetRole || "L3 / Target Role"}</strong>
          </p>
        </div>

        <button
          onClick={handleRecalibrate}
          disabled={recalibrating}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${recalibrating ? "animate-spin" : ""}`} />
          <span>{recalibrating ? "Recalibrating Radar..." : "Recalibrate Radar"}</span>
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: NEXT-LEVEL TECHNICAL CONCEPTS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
          Next-Level Concepts To Bridge Seniority Bar ({next_level_concepts.length})
        </h3>

        {next_level_concepts.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-500">
              No concept suggestions yet. Click "Recalibrate Radar" to assess your domain matrix.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {next_level_concepts.map((concept, cIdx) => (
              <div 
                key={cIdx} 
                className="bg-[#090d16] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-indigo-500/30 transition shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                      {concept.domain}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Current: <strong className="text-rose-400 font-mono">{concept.current_proficiency}/10</strong>
                      {concept.target_proficiency && (
                        <span> → Target: <strong className="text-emerald-400 font-mono">{concept.target_proficiency}/10</strong></span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                    Bridge to Target Tier <ChevronRight className="h-3 w-3" />
                  </span>
                </div>

                {concept.what_user_knows?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-slate-400" /> What You Already Know:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {concept.what_user_knows.map((knowItem, kIdx) => (
                        <span key={kIdx} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {knowItem}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  🎯 Next-Level Concept: <span className="text-indigo-400">{concept.target_concept}</span>
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Why It Matters:</strong> {concept.why_next_level}
                </p>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-indigo-400 font-mono">
                  🛠️ <strong className="font-sans text-slate-300">Blueprint:</strong> {concept.implementation_blueprint}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: MATCHED OPPORTUNITIES */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-indigo-400" />
          Matched Career Opportunities ({opportunities.length})
        </h3>

        {opportunities.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl space-y-2">
            <p className="text-xs text-slate-500">
              No calibrated opportunities found. Recalibrate to populate matching roles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp, idx) => (
              <div 
                key={idx} 
                className="bg-[#090d16] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 space-y-4 transition shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Title & Fit Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {opp.title}
                        {opp.url && (
                          <a 
                            href={opp.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-400 hover:text-indigo-300 inline-flex"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="text-slate-300 font-semibold">{opp.company}</span> • <span className="text-indigo-400 font-semibold">{opp.level}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                      <span>{opp.match_percentage}%</span>
                      <span className="text-[10px] font-sans font-medium">Fit</span>
                    </div>
                  </div>

                  {/* Compensation / Reward */}
                  <div className="text-xs font-mono text-slate-200 bg-slate-900/80 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 border border-slate-800">
                    <span className="text-amber-400">💰</span>
                    <span>{opp.compensation_range}</span>
                  </div>

                  {/* Unlocked Strengths */}
                  {opp.unlocked_by?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Unlocked By Strengths:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {opp.unlocked_by.map((skill, sIdx) => (
                          <span key={sIdx} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Priority Gaps */}
                  {opp.blocking_gaps?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Target Gaps:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {opp.blocking_gaps.map((gap, gIdx) => (
                          <span key={gIdx} className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Advice / Snippet */}
                  {opp.strategic_advice && (
                    <p className="text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                      💡 <span className="font-semibold text-slate-300">Brief:</span> {opp.strategic_advice}
                    </p>
                  )}
                </div>

                {/* Listing Button Link */}
                {opp.url && (
                  <div className="pt-2">
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-indigo-500/20"
                    >
                      <span>View Opportunity Listing</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}