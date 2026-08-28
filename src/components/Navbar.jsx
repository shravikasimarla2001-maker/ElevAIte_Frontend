import React from "react";

export function Navbar({ user, activeTab, onSelectTab, onLogout }) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur px-6 py-4 flex justify-between items-center">
      <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        Career Copilot
      </span>
      {user && (
        <div className="flex items-center space-x-4">
          <nav className="flex space-x-2">
            {["onboard", "interview", "dashboard"].map((tab) => (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                  activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} className="text-xs text-rose-400 hover:text-rose-300 font-medium">
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}