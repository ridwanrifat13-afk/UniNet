import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBIA2OxCvMVCSWQ4YInwIAwEgTT0F_F7n0",
  authDomain: "cuet-cse25-network-app.firebaseapp.com",
  projectId: "cuet-cse25-network-app",
  storageBucket: "cuet-cse25-network-app.firebasestorage.app",
  messagingSenderId: "948267743653",
  appId: "1:948267743653:web:2b2c7bf8ee121487a9d04c",
  measurementId: "G-LHZP6D0RFZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
