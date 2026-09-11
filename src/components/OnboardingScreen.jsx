import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Target, 
  UploadCloud, 
  CheckCircle2, 
  Edit3, 
  X, 
  Link2, 
  FileText, 
  ArrowRight,
  Sparkles,
  Layers,
  RotateCw
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { apiClient } from "../services/api";

export function OnboardingScreen({ user, onComplete }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [company, setCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUser, setGithubUser] = useState("");
  
  // Resume & Competency State
  const [resumeFile, setResumeFile] = useState(null);
  const [savedResumeName, setSavedResumeName] = useState("");
  const [parsedSkills, setParsedSkills] = useState([]);
  const [dynamicMatrix, setDynamicMatrix] = useState({});

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Real-time Firestore document sync
  useEffect(() => {
    if (!user?.uid) {
      setInitialLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const targetPrefs = data.target_preferences?.[0] || {};
          const hasProfile = Boolean(
            targetPrefs.role || 
            data.linkedin_url || 
            data.github_username || 
            data.resume_filename || 
            data.resume?.filename
          );

          if (hasProfile) {
            setHasExistingProfile(true);
            setCompany(targetPrefs.company || "");
            setTargetRole(targetPrefs.role || "");
            setLinkedinUrl(data.linkedin_url || "");
            setGithubUser(data.github_username || "");
            setSavedResumeName(data.resume?.filename || data.resume_filename || "");
            setParsedSkills(data.parsed_skills || []);
            setDynamicMatrix(data.skill_matrix || {});
          } else {
            setHasExistingProfile(false);
            setIsEditing(true);
          }
        } else {
          setHasExistingProfile(false);
          setIsEditing(true);
        }
        setInitialLoading(false);
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setErrorMsg("Failed to synchronize live profile state.");
        setInitialLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      setErrorMsg("Target Role is required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("user_id", user.uid);
    formData.append("email", user.email || "");
    formData.append(
      "target_preferences",
      JSON.stringify([{ company: company.trim() || "General Tech", role: targetRole.trim() }])
    );
    if (linkedinUrl.trim()) formData.append("linkedin_url", linkedinUrl.trim());
    if (githubUser.trim()) formData.append("github_username", githubUser.trim());
    if (resumeFile) formData.append("resume", resumeFile);

    try {
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      const response = await apiClient.onboardUser(formData);
      
      if (response?.action === "resume_replaced") {
        setSuccessMsg("Previous resume replaced! Fresh skills & dynamic matrix extracted.");
      } else if (response?.action === "target_recalibrated") {
        setSuccessMsg("Target role updated! Existing competencies re-rated against the new bar.");
      } else {
        setSuccessMsg("Profile updated successfully!");
      }

      // Explicitly update local state from the API response
      if (response?.extracted_skills) {
        setParsedSkills(response.extracted_skills);
      }
      if (response?.dynamic_matrix) {
        setDynamicMatrix(response.dynamic_matrix);
      }
      if (response?.resume_saved) {
        setSavedResumeName(response.resume_saved);
      }

      setResumeFile(null);
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-16 space-y-3">
        <span className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block" />
        <p className="text-xs text-slate-400">Loading your profile from Firestore...</p>
      </div>
    );
  }

  const dynamicDomainEntries = Object.entries(dynamicMatrix || {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Identity &amp; Trajectory</h2>
          <p className="text-xs text-slate-400 mt-1">
            {hasExistingProfile
              ? "Verified resume and career aspirations calibrated against the AI engine."
              : "Provide your goals and upload your resume to calibrate the assessment matrix."}
          </p>
        </div>

        {hasExistingProfile && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5 text-indigo-400"/>
            <span>Edit Profile / Change Target</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0"/>
          <span>{successMsg}</span>
        </div>
      )}

      {/* ================= READ MODE ================= */}
      {hasExistingProfile && !isEditing ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-400"/> Target Employer Wishlist
              </span>
              <p className="text-sm font-semibold text-slate-100">{company || "General Tech Ecosystem"}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-indigo-400"/> Target Role
              </span>
              <p className="text-sm font-semibold text-slate-100">{targetRole}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-blue-400"/> LinkedIn Profile
              </span>
              {linkedinUrl ? (
                <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline truncate block">
                  {linkedinUrl}
                </a>
              ) : (
                <p className="text-xs text-slate-500 italic">Not connected</p>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-slate-400"/> GitHub Profile
              </span>
              {githubUser ? (
                <a href={`[https://github.com/$](https://github.com/$){githubUser}`} target="_blank" rel="noreferrer" className="text-xs text-slate-200 font-mono hover:underline block">
                  @{githubUser}
                </a>
              ) : (
                <p className="text-xs text-slate-500 italic">Not connected</p>
              )}
            </div>
          </div>

          {/* Active Resume & Dynamic Matrix Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-indigo-400"/>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {savedResumeName || "No Resume PDF attached"}
                  </p>
                  {savedResumeName && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3"/> Processed via Document AI &amp; Vertex AI (Gemini 2.5)
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {savedResumeName ? "Replace Resume" : "Upload Resume"}
              </button>
            </div>

            {/* Dynamic Competency Matrix */}
            {dynamicDomainEntries.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-indigo-400"/> Live Calibrated Domain Matrix:
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Target: {targetRole}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dynamicDomainEntries.map(([domain, data]) => {
                    const score = data?.score || 0;
                    const isLow = score <= 5;
                    return (
                      <div key={domain} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-200 font-medium truncate">{domain}</span>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                            isLow 
                              ? "text-rose-400 bg-rose-950/40 border-rose-800/50" 
                              : "text-indigo-400 bg-indigo-950/60 border-indigo-900"
                          }`}>
                            {score}/10
                          </span>
                        </div>
                        {data?.last_feedback && (
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {data.last_feedback}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extracted Skills Visualization */}
            {parsedSkills.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-400"/> Current Verified Skills ({parsedSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-950 border border-slate-800 text-indigo-300 px-2 py-0.5 rounded-md font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onComplete(targetRole)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <span>Continue to Diagnostic Engine</span>
              <ArrowRight className="h-4 w-4"/>
            </button>
          </div>
        </div>
      ) : (
        /* ================= EDIT / RECALIBRATION MODE ================= */
        <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {hasExistingProfile ? "Edit Profile, Target Role, or Replace Resume" : "Initial Profile Calibration"}
            </h3>
            {hasExistingProfile && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setResumeFile(null);
                  setErrorMsg("");
                }}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5"/> Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-400"/> Target Employer Wishlist
              </label>
              <input
                type="text"
                placeholder="e.g. Google, Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-indigo-400"/> Target Role / Level *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI Solutions Architect"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-indigo-400/90 mt-1">
                Changing this re-rates existing skills automatically without re-uploading your resume.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-blue-400"/> LinkedIn Profile URL
              </label>
              <input
                type="url"
                placeholder="[https://linkedin.com/in/username](https://linkedin.com/in/username)"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-slate-400"/> GitHub Username
              </label>
              <input
                type="text"
                placeholder="e.g. octocat"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Current File Notice */}
          {savedResumeName && !resumeFile && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-indigo-400"/>
                <span className="text-slate-300">
                  Current Stored Resume: <strong className="text-white">{savedResumeName}</strong>
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3"/> Active
              </span>
            </div>
          )}

          {/* Resume Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UploadCloud className="h-3.5 w-3.5 text-indigo-400"/>
              {savedResumeName ? "Replace Resume / CV (PDF - Optional)" : "Upload Resume / CV (PDF)"}
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-900/60 transition">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-300">
                  {resumeFile 
                    ? `Staged: ${resumeFile.name}` 
                    : (savedResumeName ? `Click or drop file to replace "${savedResumeName}" (Deletes previous)` : "Drop your PDF resume here or click to browse")}
                </p>
                <p className="text-[10px] text-slate-400">
                  Uploading a new resume clears previous skills and generates a fresh competency matrix.
                </p>
                {resumeFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeFile(null);
                    }}
                    className="mt-2 text-[10px] text-rose-400 hover:underline inline-block"
                  >
                    Clear selected file
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 animate-spin"/>
                  {resumeFile ? "Replacing Resume & Extracting Skills..." : "Re-rating Skills Against Target..."}
                </span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4"/>
                  <span>
                    {resumeFile 
                      ? "Replace Resume & Regenerate Matrix" 
                      : (hasExistingProfile ? "Recalibrate & Save Changes" : "Save Profile & Launch Diagnostic")}
                  </span>
                </>
              )}
            </button>
            {hasExistingProfile && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setResumeFile(null);
                }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}