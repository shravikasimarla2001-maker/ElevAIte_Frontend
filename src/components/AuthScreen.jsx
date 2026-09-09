import React, { useState } from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export function AuthScreen({ onLogin, onSignup, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) onSignup(email, password);
    else onLogin(email, password);
  };

  return (
    <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 items-center justify-center text-indigo-400 mb-3 shadow-inner">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isSignUp ? "Create Copilot Account" : "Welcome Back"}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          AI-driven career horizon mapping and diagnostic skill leveling.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Work Email
          </label>
          <input
            type="email"
            required
            placeholder="engineer@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <span>{isSignUp ? "Get Started" : "Enter Workspace"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
}