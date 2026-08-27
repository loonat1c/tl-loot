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
  doc, getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── Состояние ──────────────────────────────────────────
export let currentUser = null;
export let currentRole = "guest";

// ─── Промис готовности ────────────────────────────────
let _authReadyResolve = null;
export const authReady = new Promise((resolve) => {
  _authReadyResolve = resolve;
});

// ─── Флаг инициализации ──────────────────────────────
let isInitialized = false;

// ─── Инициализация ──────────────────────────────────────
export function initAuth(onReady) {
  if (isInitialized) {
    console.log("⚠️ Auth уже инициализирован");
    return;
  }
  
  console.log("🔄 Инициализация Auth...");
  isInitialized = true;
  
  setPersistence(auth, browserLocalPersistence).catch(() => {});

  onAuthStateChanged(auth, async (user) => {
    console.log("📡 onAuthStateChanged вызван, user:", user ? user.email : null);
    
    let result = { user: null, role: "guest" };
    
    if (user) {
      currentUser = user;
      console.log("👤 Пользователь найден:", user.email);
      
      // Загружаем роль из Firestore
      const fresh = await fetchRole(user.uid);
      currentRole = fresh;
      console.log("🔄 Роль из Firestore:", currentRole);
      sessionStorage.setItem(`role_${user.uid}`, fresh);
      
      result = { user: currentUser, role: currentRole };
    } else {
      console.log("👤 Пользователь не найден (guest)");
      currentUser = null;
      currentRole = "guest";
      sessionStorage.clear();
      result = { user: null, role: "guest" };
    }

    // Обновляем UI
    updateNavUI();
    
    // Вызываем колбэк если есть
    if (onReady) {
      onReady(currentUser, currentRole);
    }
    
    // Резолвим промис с данными
    console.log("✅ authReady резолвится с:", result);
    if (_authReadyResolve) {
      _authReadyResolve(result);
    }
  });
}

async function fetchRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const role = snap.data().role || "guest";
      console.log(`📋 Роль для ${uid}:`, role);
      return role;
    }
    console.log(`⚠️ Документ пользователя ${uid} не найден, роль: guest`);
  } catch (e) {
    console.error("fetchRole error:", e);
  }
  return "guest";
}

// ─── Публичная функция для получения роли ─────────────
export async function getUserRole(uid) {
  return await fetchRole(uid);
}

// ─── Аутентификация ────────────────────────────────────
export async function login(email, password) {
  console.log("🔑 Попытка входа:", email);
  await setPersistence(auth, browserLocalPersistence);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log("✅ Вход выполнен:", cred.user.email);
  
  // Ждем загрузки роли
  await new Promise(resolve => setTimeout(resolve, 300));
  const role = await fetchRole(cred.user.uid);
  currentRole = role;
  sessionStorage.setItem(`role_${cred.user.uid}`, role);
  updateNavUI();
  
  return { user: cred.user, role: role };
}

export function logout() {
  console.log("🚪 Выход из системы");
  sessionStorage.clear();
  return signOut(auth);
}

// ─── Проверки ролей ────────────────────────────────────
export function canWrite() {
  const result = currentRole === "admin" || currentRole === "moderator";
  console.log(`🔍 canWrite(): ${result} (role: ${currentRole})`);
  return result;
}

export function isAdmin() {
  const result = currentRole === "admin";
  console.log(`🔍 isAdmin(): ${result} (role: ${currentRole})`);
  return result;
}

// ─── Синонимы для удобства ────────────────────────────
export let user = currentUser;
export let role = currentRole;

// Обновляем синонимы при изменении
function updateCurrentUser() {
  user = currentUser;
  role = currentRole;
}

// ─── Обновление UI ─────────────────────────────────────
export function updateNavUI() {
  // Обновляем синонимы
  updateCurrentUser();
  
  const loginBtn  = document.getElementById("btn-login");
  const logoutBtn = document.getElementById("btn-logout");
  const userLabel = document.getElementById("nav-user-label");

  if (loginBtn)  loginBtn.classList.toggle("hidden", !!currentUser);
  if (logoutBtn) logoutBtn.classList.toggle("hidden", !currentUser);

  if (userLabel) {
    userLabel.textContent = currentUser
      ? `${currentUser.email} (${currentRole})`
      : "Гость";
  }

  document.querySelectorAll("[data-role='admin']").forEach(el => {
    el.classList.toggle("hidden", currentRole !== "admin");
  });
  document.querySelectorAll("[data-role='moderator']").forEach(el => {
    el.classList.toggle("hidden", !canWrite());
  });
}
