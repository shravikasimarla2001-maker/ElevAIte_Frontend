import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export function useSkillTree(userId) {
  const [skillMatrix, setSkillMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSkillMatrix({});
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSkillMatrix(data.skill_matrix || {});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { skillMatrix, loading };
}