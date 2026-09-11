import React from "react";
import { 
  Compass, 
  Sparkles, 
  Layers, 
  LogOut, 
  UserCheck,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function Navbar({ user, activeTab, onSelectTab, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: "onboard", label: "Identity & Goals", icon: UserCheck },
    { id: "interview", label: "Diagnostic Engine", icon: Sparkles },
    { id: "dashboard", label: "Skill Horizon", icon: Layers },
    { id: "radar", label: "Opportunity Radar", icon: Compass },
  ];

  return (
    <aside className="w-64 bg-slate-100 dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800/80 backdrop-blur-xl flex flex-col justify-between p-5 select-none shrink-0 transition-colors duration-200">
      <div className="space-y-6">
        {/* Brand Logo & Theme Switcher */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                ElevAIte
              </h1>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono tracking-wider uppercase">Career Copilot</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 border border-slate-300 dark:border-slate-800 transition shadow-sm"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTab(id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-xs shrink-0">
              {user.email ? user.email.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Active Synced
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}