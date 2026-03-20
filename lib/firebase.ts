import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase project configuration

const firebaseConfig = {
  apiKey: "AIzaSyDWMbC9xXaVYwBGsUey6nysjQmS65pneak",
  authDomain: "hidupmelampaui.firebaseapp.com",
  projectId: "hidupmelampaui",
  storageBucket: "hidupmelampaui.firebasestorage.app",
  messagingSenderId: "381208509879",
  appId: "1:381208509879:web:0d1f2945c73cfc44b43c32",
  measurementId: "G-P1G8FETTDF"
};

// Initialize Firebase (prevent re-initialization in hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
