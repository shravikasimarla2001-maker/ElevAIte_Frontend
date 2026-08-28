const API_BASE = "/api/v1";

export const apiClient = {
  async onboardUser(formData) {
    const response = await fetch(`${API_BASE}/onboard`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Onboarding failed");
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
    if (!response.ok) throw new Error("Failed to start diagnostic interview");
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
    if (!response.ok) throw new Error("Failed to submit diagnostic response");
    return response.json();
  },

  async triggerRAGRecommendations(userId) {
    const response = await fetch(`${API_BASE}/recommendations/generate/${userId}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to generate recommendations");
    return response.json();
  }
};