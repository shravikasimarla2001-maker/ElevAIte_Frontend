import React, { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { useSkillTree } from "./hooks/useSkillTree";
import { apiClient } from "./services/api";
import { AuthScreen } from "./components/AuthScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { DiagnosticScreen } from "./components/DiagnosticScreen";
import { OpportunityRadarScreen } from "./components/OpportunityRadarScreen";
import { RecommendationsSection } from "./components/RecommendationsSection";
import { 
  Sparkles, 
  Layers, 
  Terminal, 
  Compass, 
  Sun, 
  Moon, 
  LogOut, 
  RefreshCw,
  ExternalLink,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, error, login, signup, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'interview' | 'onboard' | 'radar'
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");

  // Real-time Firestore Skill Matrix & Recommendations hook
  const { 
    skillMatrix = {}, 
    studyRemediations: firestoreRecs = [], 
    userData,
    loading: matrixLoading 
  } = useSkillTree(user ? user.uid : null);

  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [liveRecs, setLiveRecs] = useState([]);
  const [ragLoading, setRagLoading] = useState(false);

  // Sync user profile targets if stored in database
  useEffect(() => {
    if (userData?.target_preferences?.length > 0) {
      setTargetRole(userData.target_preferences[0].role || "");
      setTargetCompany(userData.target_preferences[0].company || "");
    }
  }, [userData]);

  if (!user) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-6">
        <AuthScreen onLogin={login} onSignup={signup} error={error} />
      </div>
    );
  }

  const displayRecommendations = liveRecs.length > 0 ? liveRecs : (firestoreRecs || []);

  const handleScanRAG = async () => {
    setRagLoading(true);
    try {
      const res = await apiClient.triggerRAGRecommendations(user.uid);
      // Handles both { items: [...] } or direct array [...]
      const items = res?.items || (Array.isArray(res) ? res : []);
      if (items.length > 0) {
        setLiveRecs(items);
      }
    } catch (err) {
      alert("RAG discovery failed: " + err.message);
    } finally {
      setRagLoading(false);
    }
  };

  // Derive dynamic metrics purely from database state
  const assessedSkills = Object.entries(skillMatrix || {});
  const totalAssessed = assessedSkills.length;
  const averageScore = totalAssessed > 0
    ? (assessedSkills.reduce((acc, [, data]) => acc + (data.score || 0), 0) / totalAssessed).toFixed(1)
    : 0;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-[#070b13] text-slate-800 dark:text-slate-100 transition-colors select-none font-sans">
      
      {/* ================= 1. TOP HEADER ================= */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0f19]/90 backdrop-blur px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base">ElevAIte</span>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Career</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced</span>
          </div>

          <button 
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300 text-xs">
            {user.email ? user.email.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN LAYOUT ================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-[#080c14]/90 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-5">
            {/* User Profile Card */}
            <div className="bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.email}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Target: {targetRole || <span className="italic text-slate-400">Not configured</span>}
              </p>
              {targetCompany && (
                <div className="mt-2 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 inline-block">
                  {targetCompany} Focus
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Skill Matrix & Horizon", icon: Layers },
                { id: "interview", label: "Adaptive Diagnostic", icon: Terminal },
                { id: "onboard", label: "Identity & Ingestion", icon: UserCheck },
                { id: "radar", label: "Opportunity Radar", icon: Compass },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === id
                      ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Live Metrics Card */}
            <div className="bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Metrics</h4>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Assessed Nodes</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {matrixLoading ? "..." : totalAssessed}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Average Proficiency</span>
                <span className="font-bold text-indigo-500">
                  {matrixLoading ? "..." : `${averageScore} / 10`}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-xs text-rose-500 hover:text-rose-400 p-2 font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* ================= CENTER WORKSPACE ================= */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: IDENTITY & ONBOARDING */}
          {activeTab === "onboard" && (
            <OnboardingScreen 
              user={user} 
              onComplete={(role) => { 
                setTargetRole(role); 
                setActiveTab("interview"); 
              }} 
            />
          )}

          {/* TAB 2: DIAGNOSTIC INTERVIEW */}
          {activeTab === "interview" && (
            <DiagnosticScreen 
              user={user} 
              targetRole={targetRole} 
              onFinished={() => setActiveTab("dashboard")} 
            />
          )}

          {/* TAB 3: REAL-TIME MATRIX & RAG FEED */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* COMPETENCY MATRIX SNAPSHOT */}
              <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-300 tracking-wider uppercase">
                    Live Competency Matrix
                  </h3>
                  <button
                    onClick={() => setActiveTab("interview")}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Take Diagnostic Interview
                  </button>
                </div>

                {matrixLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading competency telemetry...</div>
                ) : totalAssessed === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                    <AlertCircle className="h-5 w-5 text-indigo-400 mx-auto" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No assessed technical competencies found in Firestore.
                    </p>
                    <button
                      onClick={() => setActiveTab("interview")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
                    >
                      Start Diagnostic Engine
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assessedSkills.map(([domain, data]) => {
                      const score = Number(data?.score ?? 0);
                      const percentage = Math.min(Math.max((score / 10) * 100, 0), 100);
                      const isLow = score <= 5;
                      return (
                        <div 
                          key={domain} 
                          className={`bg-slate-50 dark:bg-[#090d16] border rounded-2xl p-4 space-y-2 ${
                            isLow ? "border-rose-400/40" : "border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{domain}</span>
                            <span className={`text-xs font-bold font-mono ${isLow ? "text-rose-500" : "text-indigo-500"}`}>
                              {score} / 10
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500 ${isLow ? "bg-rose-500" : "bg-indigo-600"}`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {data.last_feedback || (isLow ? "Priority Gap Flagged" : "Verified via Interview Evaluation")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <RecommendationsSection 
                items={displayRecommendations}
                loading={ragLoading}
                onRefresh={handleScanRAG}
              />

              {/* RAG CONTENT RECOMMENDATIONS CARDS */}
              <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                {/*<div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-300 tracking-wider uppercase">
                    Curated RAG Remediation Plan
                  </h3>
                  <button
                    onClick={handleScanRAG}
                    disabled={ragLoading}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${ragLoading ? "animate-spin" : ""}`} />
                    <span>{ragLoading ? "Discovering..." : "Scan & Refresh Feed"}</span>
                  </button>
                </div>*/}

                {/* <div className="space-y-4">
                  {recommendations?.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No custom recommendations generated yet for this profile.
                      </p>
                      <button
                        onClick={handleScanRAG}
                        disabled={ragLoading}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
                      >
                        Run Vector Content Discovery
                      </button>
                    </div>
                  ) : (
                    recommendations?.map((item, idx) => {
                      const isYouTube = item.source_type === "youtube" || (item.url && item.url.includes("youtube.com"));
                      const isAudioPlaying = playingAudioId === idx;

                      return (
                        <div key={idx} className="bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                isYouTube 
                                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                                  : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              }`}>
                                {isYouTube ? "YOUTUBE TALK" : "OFFICIAL GUIDE"}
                              </span>
                              {item.skill_domain && (
                                <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                  GAP: {item.skill_domain}
                                </span>
                              )}
                            </div>
                            {item.relevance_score && (
                              <span className="text-emerald-500 text-xs font-bold font-mono">
                                {Math.round(Number(item.relevance_score) * 100)}% Match
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                          {item.snippet && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.snippet}</p>
                          )}

                          
                          {Array.isArray(item.takeaways) && item.takeaways.length > 0 && (
                            <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="text-[10px] font-bold text-indigo-500 block">💡 Why Study This:</span>
                              <ul className="space-y-0.5">
                                {item.takeaways.map((t, i) => (
                                  <li key={i} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start space-x-1.5">
                                    <span className="text-indigo-400 font-bold">•</span>
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            {item.audio_url ? (
                              <button 
                                onClick={() => setPlayingAudioId(isAudioPlaying ? null : idx)} 
                                className="text-[11px] font-semibold text-indigo-500 hover:underline"
                              >
                                🎧 {isAudioPlaying ? "Pause Audio" : "Play Commute Espresso"}
                              </button>
                            ) : <div />}

                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[11px] font-semibold text-indigo-500 hover:underline inline-flex items-center gap-1"
                              >
                                <span>{isYouTube ? "Watch Full Talk" : "Read Original Guide"}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div> */}
              </div>
            </div>
          )}

          {/* TAB 4: OPPORTUNITY RADAR */}
          {activeTab === "radar" && (
            <OpportunityRadarScreen
              user={user} 
              targetRole={targetRole} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}