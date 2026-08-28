import { useState } from "react";
import { apiClient } from "../services/apis"

export function useInterview(userId) {
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [skillDomain, setSkillDomain] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = async (targetRole) => {
    setLoading(true);
    try {
      const data = await apiClient.startDiagnostic(userId, targetRole);
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setSkillDomain(data.skill_domain || "Core Architecture");
      setQuestionNumber(data.question_number || 1);
      setIsCompleted(false);
      setFeedback("");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (answer) => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const data = await apiClient.submitTurn(userId, sessionId, questionNumber, answer);
      if (data.status === "completed") {
        setIsCompleted(true);
        setFeedback(data.feedback_on_previous || "Interview Completed");
      } else {
        setFeedback(data.feedback_on_previous || "");
        setCurrentQuestion(data.question);
        setSkillDomain(data.skill_domain);
        setQuestionNumber(data.question_number);
      }
    } finally {
      setLoading(false);
    }
  };

  return { sessionId, currentQuestion, skillDomain, questionNumber, feedback, isCompleted, loading, start, submit };
}