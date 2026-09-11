import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFjDT_YlGd8krzMdAjfNjWrexvPshbE1w",
  authDomain: "elev-ai-te-508207.firebaseapp.com",
  projectId: "elev-ai-te-508207",
  storageBucket: "elev-ai-te-508207.firebasestorage.app",
  messagingSenderId: "604762832232",
  appId: "1:604762832232:web:c313a7326d415b92836add",
  measurementId: "G-H22VVL23QT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);