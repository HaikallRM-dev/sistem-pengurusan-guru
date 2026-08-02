import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXkbtYgBCg8Japki5is0Zv___b10w1oEI",
  authDomain: "sistem-pengurusan-guru.firebaseapp.com",
  projectId: "sistem-pengurusan-guru",
  storageBucket: "sistem-pengurusan-guru.firebasestorage.app",
  messagingSenderId: "90167513427",
  appId: "1:90167513427:web:30aee5e0c7f0500ba351a6"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Eksport perkhidmatan pangkalan data & log masuk
export const db = getFirestore(app);
export const auth = getAuth(app);