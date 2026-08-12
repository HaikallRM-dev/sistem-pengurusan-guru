import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Konfigurasi dibaca dari .env (VITE_FIREBASE_*).
// Fallback ke nilai sedia ada supaya app masih jalan jika env tidak di-set
// (berguna untuk dev/local tanpa fail .env).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "«redacted>>",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sistem-pengurusan-guru.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sistem-pengurusan-guru",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sistem-pengurusan-guru.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "90167513427",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:90167513427:web:30aee5e0c7f0500ba351a6"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Eksport perkhidmatan pangkalan data & log masuk
export const db = getFirestore(app);
export const auth = getAuth(app);