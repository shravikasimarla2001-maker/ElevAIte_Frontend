import React, { useState } from "react";
import { Terminal, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { useInterview } from "../hooks/useInterview";

export function DiagnosticScreen({ user, targetRole, onFinished }) {
  const { 
    sessionId, 
    currentQuestion, 
    skillDomain, 
    questionNumber, 
    feedback, 
    isCompleted, 
    loading, 
    start, 
    submit 
  } = useInterview(user.uid);

  const [userAnswer, setUserAnswer] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(userAnswer);
    setUserAnswer("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Adaptive Diagnostic Interview</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic, turn-by-turn technical probing for <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{targetRole}</span>[cite: 2, 3].
          </p>
        </div>
        {sessionId && !isCompleted && (
          <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-mono font-semibold">
            Question {questionNumber} of 5[cite: 2]
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xl backdrop-blur-xl transition-colors">
        {!sessionId ? (
          <div className="text-center py-12 space-y-4">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <Terminal className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Zero Static Questionnaires</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Gemini Flash generates questions dynamically on demand, adapting each turn to your previous responses and skill gaps[cite: 2, 3].
            </p>
            <button
              onClick={() => start(targetRole)}
              disabled={loading}
              className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition"
            >
              {loading ? "Synthesizing First Question..." : "Start Diagnostic Interview"}
            </button>
          </div>
        ) : isCompleted ? (
          <div className="text-center py-12 space-y-4">
            <div className="inline-flex h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Diagnostic Evaluation Complete</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              "{feedback}"
            </p>
            <button
              onClick={onFinished}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              View Updated Skill Matrix & Roadmap
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {feedback && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Previous Turn Evaluation[cite: 2]
                </span>
                <p className="text-xs text-indigo-900 dark:text-indigo-200">{feedback}</p>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50">
                Assessing: {skillDomain}
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">{currentQuestion}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                rows={5}
                required
                placeholder="Structure your architectural reasoning, key trade-offs, and scaling approach..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Evaluating & Calibrating Next Question...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-3.5 w-3.5" /> Submit Response
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}