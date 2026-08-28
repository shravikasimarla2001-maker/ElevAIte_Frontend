import React, { useState } from "react";
import { apiClient } from "../services/apis";

export function OnboardingScreen({ user, onComplete }) {
  const [company, setCompany] = useState("Google");
  const [targetRole, setTargetRole] = useState("AI Solutions Architect");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUser, setGithubUser] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("user_id", user.uid);
    formData.append("email", user.email);
    formData.append("target_preferences", JSON.stringify([{ company, role: targetRole }]));
    if (linkedinUrl) formData.append("linkedin_url", linkedinUrl);
    if (githubUser) formData.append("github_username", githubUser);
    if (resumeFile) formData.append("resume", resumeFile);

    try {
      await apiClient.onboardUser(formData);
      onComplete(targetRole);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold mb-1 text-white">Profile & Trajectory Setup</h2>
      <p className="text-slate-400 text-sm mb-6">Map your current capabilities against target employers and roles[cite: 1].</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Target Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">LinkedIn Profile URL</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">GitHub Username</label>
            <input
              type="text"
              placeholder="octocat"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Resume (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition"
        >
          {loading ? "Parsing Profile & Ingesting..." : "Save & Proceed to Assessment"}
        </button>
      </form>
    </div>
  );
}