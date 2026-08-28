import React, { useState } from "react";

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
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-auto shadow-xl">
      <h2 className="text-2xl font-bold mb-2 text-white">
        {isSignUp ? "Create an Account" : "Sign In to Career Copilot"}
      </h2>
      <p className="text-slate-400 text-sm mb-6">AI-driven skill leveling & career growth tracking.</p>
      {error && (
        <div className="p-3 mb-4 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs text-indigo-400 hover:underline"
        >
          {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}