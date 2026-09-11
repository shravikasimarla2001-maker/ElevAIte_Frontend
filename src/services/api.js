const API_BASE = "https://elevaite-backend-vtdhnwibeq-uc.a.run.app/api/v1";

export const apiClient = {
  async onboardUser(formData) {
    const response = await fetch(`${API_BASE}/onboard`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Onboarding profile upload failed");
    }
    return response.json();
  },

  async startDiagnostic(userId, targetRole) {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("target_role", targetRole);

    const response = await fetch(`${API_BASE}/diagnostic/start`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to initialize diagnostic session");
    }
    return response.json();
  },

  async submitTurn(userId, sessionId, questionNumber, userAnswer) {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("session_id", sessionId);
    formData.append("question_number", questionNumber.toString());
    formData.append("user_answer", userAnswer);

    const response = await fetch(`${API_BASE}/diagnostic/submit-turn`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to evaluate diagnostic response");
    }
    return response.json();
  },

  async triggerRAGRecommendations(userId) {
    const response = await fetch(`${API_BASE}/recommendations/generate/${userId}`, {
      method: "POST",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to generate RAG content recommendations");
    }
    return response.json();
  },

  // Opportunity Radar: External Market Events & Jobs
  async triggerOpportunityScan(userId) {
    const res = await fetch(`${API_BASE}/recommendations/radar/discover/v2/${userId}`, { 
      method: "POST" 
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to scan market opportunities");
    }
    return res.json();
  },

  async getRadarDiscover(userId) {
    const response = await fetch(`${API_BASE}/recommendations/radar/discover/${userId}`, {
      method: "POST",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to load discovered radar opportunities");
    }
    return response.json();
  },

  async getHorizonOpportunities(userId) {
    const response = await fetch(`${API_BASE}/recommendations/horizon/${userId}`, {
      method: "POST",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to generate horizon roadmap");
    }
    return response.json();
  },
};