import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAMkK3DOuoWAU9lR5kjH5R_hbCsABcPBms",
  authDomain: "career-copilot-506013.firebaseapp.com",
  projectId: "career-copilot-506013",
  storageBucket: "career-copilot-506013.firebasestorage.app",
  messagingSenderId: "498665016035",
  appId: "1:498665016035:web:76055cf0deeb3042d953d6",
  measurementId: "G-PXQW87EVZF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);