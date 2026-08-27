// ====================================================
// firebase.js — инициализация Firebase
// Замени firebaseConfig на свои данные из консоли
// ====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-FrBsAftRlfa3TZU-YOG4jeVixgxmgj8",
  authDomain: "tl-loot.firebaseapp.com",
  projectId: "tl-loot",
  storageBucket: "tl-loot.firebasestorage.app",
  messagingSenderId: "950256243462",
  appId: "1:950256243462:web:d6fae5068501e778b8c487"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
