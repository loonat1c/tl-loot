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
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,  // ← ДОБАВЛЕНО!
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ====================================================
// Состояние
// ====================================================

export let currentUser = null;
export let currentRole = "guest";

export let user = null;
export let role = "guest";

// ====================================================
// Auth Ready
// ====================================================

let authReadyResolve;

export const authReady = new Promise((resolve) => {
  authReadyResolve = resolve;
});

let isInitialized = false;
let initializationPromise = null;

// ====================================================
// Инициализация Auth
// ====================================================

export function initAuth(onReady = null) {

  // Если Auth уже запускается — возвращаем тот же Promise
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve) => {

    console.log("🔄 Инициализация Auth...");

    try {

      // ВАЖНО:
      // Сначала устанавливаем persistence
      await setPersistence(auth, browserLocalPersistence);

      console.log("💾 Firebase persistence установлена");

    } catch (e) {

      console.warn(
        "⚠️ Не удалось установить persistence:",
        e
      );

    }

    isInitialized = true;

    // ==================================================
    // Слушаем изменение авторизации
    // ==================================================

    onAuthStateChanged(auth, async (firebaseUser) => {

      console.log(
        "📡 onAuthStateChanged:",
        firebaseUser
          ? firebaseUser.email
          : "guest"
      );

      let roleValue = "guest";

      // =================================================
      // Пользователь авторизован
      // =================================================

      if (firebaseUser) {

        currentUser = firebaseUser;

        user = firebaseUser;

        console.log(
          "👤 Пользователь:",
          firebaseUser.email
        );

        // Получаем роль
        roleValue = await fetchRole(firebaseUser.uid);

        currentRole = roleValue;
        role = roleValue;

        sessionStorage.setItem(
          `role_${firebaseUser.uid}`,
          roleValue
        );

        console.log(
          "🔐 Роль:",
          roleValue
        );

      }

      // =================================================
      // Пользователь не авторизован
      // =================================================

      else {

        currentUser = null;
        currentRole = "guest";

        user = null;
        role = "guest";

        console.log(
          "👤 Пользователь не авторизован"
        );
      }

      // =================================================
      // Обновляем Navbar
      // =================================================

      updateNavUI();

      const result = {
        user: currentUser,
        role: currentRole,
      };

      console.log(
        "✅ Auth готов:",
        result
      );

      // Callback
      if (onReady) {
        try {
          onReady(
            currentUser,
            currentRole
          );
        } catch (e) {
          console.error(
            "❌ Ошибка auth callback:",
            e
          );
        }
      }

      // Promise authReady
      authReadyResolve(result);

      // Resolve initAuth()
      resolve(result);

    });
  });

  return initializationPromise;
}

// ====================================================
// Получение роли
// ====================================================

async function fetchRole(uid) {

  try {

    const snap = await getDoc(
      doc(db, "users", uid)
    );

    if (snap.exists()) {

      const roleValue =
        snap.data().role || "guest";

      console.log(
        `📋 Роль пользователя ${uid}:`,
        roleValue
      );

      return roleValue;
    }

    console.warn(
      `⚠️ Документ users/${uid} не найден`
    );

    // Если документа нет — создаём его с ролью "user"
    try {
      await setDoc(doc(db, "users", uid), {
        email: currentUser?.email || "",
        role: "user",
        username: currentUser?.email?.split('@')[0] || "User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log("✅ Создан новый документ пользователя с ролью user");
      return "user";
    } catch (createError) {
      console.error("❌ Ошибка создания документа:", createError);
    }

  } catch (e) {

    console.error(
      "❌ Ошибка получения роли:",
      e
    );
  }

  return "guest";
}

// ====================================================
// Публичное получение роли
// ====================================================

export async function getUserRole(uid) {
  return await fetchRole(uid);
}

// ====================================================
// РЕГИСТРАЦИЯ
// ====================================================

export async function register(email, password, username = null) {

  console.log("📝 Регистрация:", email);

  try {

    // 1. Создаём пользователя в Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const newUser = userCredential.user;

    console.log("✅ Пользователь создан:", newUser.uid);

    // Если username не указан — берём из email (до @)
    const finalUsername = username || newUser.email?.split('@')[0] || 'User';

    // 2. Создаём документ в Firestore
    await setDoc(doc(db, "users", newUser.uid), {
      email: newUser.email,
      role: "user",
      username: finalUsername,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    console.log("📄 Документ пользователя создан");

    // 3. (Опционально) Отправляем письмо для подтверждения email
    try {
      await sendEmailVerification(newUser);
      console.log("✉️ Письмо подтверждения отправлено");
    } catch (verifyError) {
      console.warn("⚠️ Не удалось отправить письмо подтверждения:", verifyError);
    }

    return {
      success: true,
      user: newUser,
      message: "Регистрация успешна!"
    };

  } catch (error) {

    console.error("❌ Ошибка регистрации:", error);

    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

// ====================================================
// Login
// ====================================================

export async function login(email, password) {

  console.log(
    "🔑 Попытка входа:",
    email
  );

  try {
    await setPersistence(
      auth,
      browserLocalPersistence
    );

    const cred =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    console.log(
      "✅ Вход выполнен:",
      cred.user.email
    );

    return {
      success: true,
      user: cred.user
    };
  } catch (error) {
    console.error("❌ Ошибка входа:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

// ====================================================
// Logout
// ====================================================

export async function logout() {

  console.log(
    "🚪 Выход из системы"
  );

  sessionStorage.clear();

  await signOut(auth);
  
  return { success: true };
}

// ====================================================
// Проверка прав
// ====================================================

export function canWrite() {

  return (
    currentRole === "admin" ||
    currentRole === "moderator"
  );
}

export function isAdmin() {

  return currentRole === "admin";
}

export function isModerator() {
  return currentRole === "moderator" || currentRole === "admin";
}

// ====================================================
// Вспомогательные функции
// ====================================================

function getAuthErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'Этот email уже зарегистрирован',
    'auth/invalid-email': 'Некорректный email адрес',
    'auth/weak-password': 'Пароль должен содержать минимум 6 символов',
    'auth/user-not-found': 'Пользователь с таким email не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/operation-not-allowed': 'Вход с email/паролем отключён',
    'auth/user-disabled': 'Аккаунт заблокирован',
    'auth/network-request-failed': 'Ошибка сети. Проверьте подключение',
    'auth/requires-recent-login': 'Требуется повторный вход',
    'auth/credential-already-in-use': 'Аккаунт уже используется',
    'auth/email-already-exists': 'Этот email уже зарегистрирован',
    'auth/invalid-credential': 'Неверный email или пароль'
  };
  return messages[code] || `Ошибка: ${code}`;
}

// ====================================================
// Navbar UI
// ====================================================

export function updateNavUI() {

  user = currentUser;
  role = currentRole;

  const loginBtn =
    document.getElementById("btn-login");

  const logoutBtn =
    document.getElementById("btn-logout");

  const userLabel =
    document.getElementById(
      "nav-user-label"
    );

  if (loginBtn) {

    loginBtn.classList.toggle(
      "hidden",
      !!currentUser
    );
  }

  if (logoutBtn) {

    logoutBtn.classList.toggle(
      "hidden",
      !currentUser
    );
  }

  if (userLabel) {

    userLabel.textContent =
      currentUser
        ? `${currentUser.email} (${currentRole})`
        : "Гость";
  }

  document
    .querySelectorAll(
      "[data-role='admin']"
    )
    .forEach((el) => {

      el.classList.toggle(
        "hidden",
        currentRole !== "admin"
      );
    });

  document
    .querySelectorAll(
      "[data-role='moderator']"
    )
    .forEach((el) => {

      el.classList.toggle(
        "hidden",
        !canWrite()
      );
    });
}

// ====================================================
// ОБНОВЛЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ
// ====================================================

export async function updateUserProfile(data) {
  if (!currentUser) {
    return {
      success: false,
      error: 'Пользователь не авторизован'
    };
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Профиль обновлён в Firestore');
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка обновления профиля:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
