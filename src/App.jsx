import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { Navbar } from "./components/Navbar";
import { AuthScreen } from "./components/AuthScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { DiagnosticScreen } from "./components/DiagnosticScreen";
import { SkillTreeScreen } from "./components/SkillTreeScreen";

export default function App() {
  const { user, error, login, signup, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("onboard");
  const [targetRole, setTargetRole] = useState("AI Solutions Architect");

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <AuthScreen onLogin={login} onSignup={signup} error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        user={user}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={logout}
      />
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        {activeTab === "onboard" && (
          <OnboardingScreen
            user={user}
            onComplete={(role) => {
              setTargetRole(role);
              setActiveTab("interview");
            }}
          />
        )}
        {activeTab === "interview" && (
          <DiagnosticScreen
            user={user}
            targetRole={targetRole}
            onFinished={() => setActiveTab("dashboard")}
          />
        )}
        {activeTab === "dashboard" && (
          <SkillTreeScreen
            user={user}
            onRetake={() => setActiveTab("interview")}
          />
        )}
      </main>
    </div>
  );
}