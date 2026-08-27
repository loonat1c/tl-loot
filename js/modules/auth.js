// ====================================================
// auth.js — авторизация и роли
// ====================================================

import { auth, db } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export let currentUser = null;
export let currentRole = "guest";

// ── Подписка на изменение auth состояния ─────────────
export function initAuth(onReady) {
  // Явно включаем localStorage персистентность
  setPersistence(auth, browserLocalPersistence).catch(() => {});

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      // Сначала берём из кэша — быстрый рендер без мигания
      const cached = sessionStorage.getItem(`role_${user.uid}`);
      if (cached) {
        currentRole = cached;
        updateNavUI();
        onReady(currentUser, currentRole);
      }
      // Потом обновляем из Firestore
      const fresh = await fetchRole(user.uid);
      currentRole = fresh;
      sessionStorage.setItem(`role_${user.uid}`, fresh);
    } else {
      currentUser = null;
      currentRole = "guest";
      sessionStorage.clear();
    }
    updateNavUI();
    onReady(currentUser, currentRole);
  });
}

// ── Получить роль из Firestore ────────────────────────
async function fetchRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) return snap.data().role || "guest";
  } catch (e) {
    console.error("fetchRole error:", e);
  }
  return "guest";
}

// ── Логин ─────────────────────────────────────────────
export async function login(email, password) {
  await setPersistence(auth, browserLocalPersistence);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Логаут ────────────────────────────────────────────
export function logout() {
  sessionStorage.clear();
  return signOut(auth);
}

// ── Проверки роли ─────────────────────────────────────
export function canWrite() {
  return currentRole === "admin" || currentRole === "moderator";
}

export function isAdmin() {
  return currentRole === "admin";
}

// ── Обновить UI навбара ───────────────────────────────
function updateNavUI() {
  const loginBtn   = document.getElementById("btn-login");
  const logoutBtn  = document.getElementById("btn-logout");
  const userLabel  = document.getElementById("nav-user-label");
  const adminLinks = document.querySelectorAll("[data-role='admin']");
  const modLinks   = document.querySelectorAll("[data-role='moderator']");

  if (loginBtn)  loginBtn.classList.toggle("hidden", !!currentUser);
  if (logoutBtn) logoutBtn.classList.toggle("hidden", !currentUser);

  if (userLabel) {
    userLabel.textContent = currentUser
      ? `${currentUser.email} (${currentRole})`
      : "Гость";
  }

  adminLinks.forEach(el =>
    el.classList.toggle("hidden", currentRole !== "admin")
  );
  modLinks.forEach(el =>
    el.classList.toggle("hidden", !canWrite())
  );
}
