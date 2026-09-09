import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export function useSkillTree(userId) {
  const [skillMatrix, setSkillMatrix] = useState({});
  const [studyRemediations, setStudyRemediations] = useState([]);
  const [radarOpportunities, setRadarOpportunities] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSkillMatrix({});
      setStudyRemediations([]);
      setRadarOpportunities([]);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setSkillMatrix(data.skill_matrix || {});
          setStudyRemediations(data.study_remediations || data.recommendations || []);
          setRadarOpportunities(data.radar_opportunities || []);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [userId]);

  return { skillMatrix, studyRemediations, radarOpportunities, userData, loading };
}