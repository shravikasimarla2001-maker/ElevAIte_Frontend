import React, { useState } from "react";
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
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Adaptive Diagnostic Interview</h2>
          <p className="text-slate-400 text-xs mt-0.5">Assessing alignment for {targetRole}</p>
        </div>
        {sessionId && (
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-mono">
            Question {questionNumber} of 5
          </span>
        )}
      </div>

      {!sessionId ? (
        <div className="text-center py-12">
          <p className="text-slate-300 mb-6">
            Synthesizes adaptive questions turn-by-turn based on your skill gap matrix[cite: 1, 2].
          </p>
          <button
            onClick={() => start(targetRole)}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            {loading ? "Generating Question #1..." : "Start Diagnostic Interview"}
          </button>
        </div>
      ) : isCompleted ? (
        <div className="text-center py-12 space-y-4">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">✓</div>
          <h3 className="text-xl font-bold text-white">Assessment Completed!</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">{feedback}</p>
          <button
            onClick={onFinished}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            View Live Skill Tree
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {feedback && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-sm">
              <span className="font-semibold block mb-0.5 text-blue-300">Previous Turn Feedback:</span>
              {feedback}
            </div>
          )}

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-700">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold block mb-1">
              Domain: {skillDomain}
            </span>
            <p className="text-base text-slate-100 leading-relaxed font-medium">{currentQuestion}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows={4}
              required
              placeholder="Explain your architectural rationale and trade-offs..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition"
            >
              {loading ? "Evaluating & Synthesizing Next Turn..." : "Submit Answer"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}