import { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../services/firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setError("");
    return signInWithEmailAndPassword(auth, email, password).catch((err) => setError(err.message));
  };

  const signup = async (email, password) => {
    setError("");
    return createUserWithEmailAndPassword(auth, email, password).catch((err) => setError(err.message));
  };

  const logout = () => signOut(auth);

  return { user, loading, error, login, signup, logout };
}