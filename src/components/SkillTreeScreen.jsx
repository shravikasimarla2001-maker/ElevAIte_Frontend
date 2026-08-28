import React, { useState } from "react";
import { useSkillTree } from "../hooks/useSkillsTree";
import { apiClient } from "../services/apis";
import { RecommendationCard } from "./RecommendationCard";

export function SkillTreeScreen({ user, onRetake }) {
  const { skillMatrix, loading } = useSkillTree(user.uid);
  const [recommendations, setRecommendations] = useState([]);
  const [generatingRAG, setGeneratingRAG] = useState(false);

  const handleRefreshRecommendations = async () => {
    setGeneratingRAG(true);
    try {
      const data = await apiClient.triggerRAGRecommendations(user.uid);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      alert("Error generating recommendations: " + err.message);
    } finally {
      setGeneratingRAG(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Career Horizon & Skill Matrix</h2>
          <p className="text-slate-400 text-xs">Real-time gap evaluation and dynamic learning roadmap</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefreshRecommendations}
            disabled={generatingRAG}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
          >
            {generatingRAG ? "Discovering Content with RAG..." : "⚡ Scan & Refresh Recommendations"}
          </button>
          <button
            onClick={onRetake}
            className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
          >
            Retake Assessment
          </button>
        </div>
      </div>

      {/* 1. Skill Matrix Grid */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <span>📊 Current Competency Matrix</span>
        </h3>
        {loading ? (
          <p className="text-slate-400 text-sm">Syncing matrix state...</p>
        ) : Object.keys(skillMatrix).length === 0 ? (
          <p className="text-slate-400 text-sm py-4">No assessed skills yet. Complete diagnostic to populate.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(skillMatrix).map(([domain, data]) => {
              const score = data.score || 0;
              const percentage = (score / 10) * 100;
              return (
                <div key={domain} className="bg-slate-900 border border-slate-700/70 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-200 text-sm">{domain}</span>
                    <span className="text-base font-bold text-indigo-400 font-mono">{score}/10</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                  </div>
                  {data.last_feedback && (
                    <p className="text-[11px] text-slate-400 italic">"{data.last_feedback}"</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. RAG Content Recommendations Feed */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>🎯 Curated Action Plan (RAG Recommendations)</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Targeted videos and architecture guides tailored specifically to your lowest scoring nodes
            </p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-400 text-sm mb-3">
              No recommendations generated yet for this session.
            </p>
            <button
              onClick={handleRefreshRecommendations}
              disabled={generatingRAG}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              {generatingRAG ? "Querying RAG Agent..." : "Generate Gap Recommendations"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((item, idx) => (
              <RecommendationCard key={idx} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}