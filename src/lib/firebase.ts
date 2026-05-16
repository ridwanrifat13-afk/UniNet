import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBIA2OxCvMVCSWQ4YInwIAwEgTT0F_F7n0",
  authDomain: "cuet-cse25-network-app.firebaseapp.com",
  projectId: "cuet-cse25-network-app",
  storageBucket: "cuet-cse25-network-app.firebasestorage.app",
  messagingSenderId: "948267743653",
  appId: "1:948267743653:web:2b2c7bf8ee121487a9d04c",
  measurementId: "G-LHZP6D0RFZ",
  databaseURL: "https://cuet-cse25-network-app-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Initialize Analytics asychronously to prevent blocking the main thread
export const analytics = typeof window !== 'undefined' ? 
  isSupported().then(supported => supported ? getAnalytics(app) : null).catch(() => null) : 
  null;

export default app;
