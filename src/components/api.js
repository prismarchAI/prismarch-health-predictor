const BASE_URL = "https://gouthamjayan49-dotcom-ai-health-predictor.hf.space/api";

export const api = {
  /**
   * Submits patient vitals to the Diabetes risk classification endpoint
   */
  predictDiabetes: async (data) => {
    const response = await fetch(`${BASE_URL}/predict/diabetes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Diabetes analytics server error");
    return response.json();
  },

  /**
   * Submits patient vitals to the Heart Disease risk classification endpoint
   */
  predictHeartRisk: async (data) => {
    const response = await fetch(`${BASE_URL}/predict/heart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Heart analytics server error");
    return response.json();
  },

  /**
   * Forwards conversational queries to Gemini, contextualized with calculated patient risk profiles
   */
  sendChatMessage: async (message, diabetesRisk, heartRisk, diagnostics) => {
    const response = await fetch(`${BASE_URL}/chat/health`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        diabetes_risk: diabetesRisk,
        heart_risk: heartRisk,
        user_diagnostics: diagnostics,
      }),
    });
    if (!response.ok) throw new Error("Health AI assistant failed to respond");
    return response.json();
  }
};