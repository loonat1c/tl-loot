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
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ====================================================
// Состояние
// ====================================================

export let currentUser = null;
export let currentRole = "guest";

export let user = null;
export let role = "guest";

// ====================================================
// Auth Ready (исправлено)
// ====================================================

let authReadyResolve;
let authReadyResolved = false;

export const authReady = new Promise((resolve) => {
  authReadyResolve = (result) => {
    if (!authReadyResolved) {
      authReadyResolved = true;
      console.log("✅ authReady резолвится:", result);
      resolve(result);
    }
  };
});

let isInitialized = false;
let initializationPromise = null;
let currentAuthResult = null;

// ====================================================
// Инициализация Auth (исправлено)
// ====================================================

export function initAuth(onReady = null) {
  console.log("🔄 initAuth вызван");

  // Если уже есть результат - возвращаем его
  if (currentAuthResult) {
    console.log("📦 Используем кэшированный результат:", currentAuthResult);
    return Promise.resolve(currentAuthResult);
  }

  // Если Auth уже запускается — возвращаем тот же Promise
  if (initializationPromise) {
    console.log("⏳ Используем существующий initializationPromise");
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve) => {
    console.log("🔄 Инициализация Auth...");

    try {
      await setPersistence(auth, browserLocalPersistence);
      console.log("💾 Firebase persistence установлена");
    } catch (e) {
      console.warn("⚠️ Не удалось установить persistence:", e);
    }

    isInitialized = true;

    // ==================================================
    // Слушаем изменение авторизации
    // ==================================================

    onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "📡 onAuthStateChanged:",
        firebaseUser ? firebaseUser.email : "guest"
      );

      let roleValue = "guest";

      // =================================================
      // Пользователь авторизован
      // =================================================

      if (firebaseUser) {
        currentUser = firebaseUser;
        user = firebaseUser;
        console.log("👤 Пользователь:", firebaseUser.email);

        // Получаем роль
        roleValue = await fetchRole(firebaseUser.uid);
        currentRole = roleValue;
        role = roleValue;

        sessionStorage.setItem(`role_${firebaseUser.uid}`, roleValue);
        console.log("🔐 Роль:", roleValue);
      } else {
        // Пользователь не авторизован
        currentUser = null;
        currentRole = "guest";
        user = null;
        role = "guest";
        console.log("👤 Пользователь не авторизован");
      }

      // Обновляем Navbar
      updateNavUI();

      const result = {
        user: currentUser,
        role: currentRole,
      };

      currentAuthResult = result;
      console.log("✅ Auth готов:", result);

      // Callback
      if (onReady) {
        try {
          onReady(currentUser, currentRole);
        } catch (e) {
          console.error("❌ Ошибка auth callback:", e);
        }
      }

      // Резолвим authReady
      if (authReadyResolve) {
        authReadyResolve(result);
      }

      // Резолвим initAuth()
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
    const snap = await getDoc(doc(db, "users", uid));

    if (snap.exists()) {
      const roleValue = snap.data().role || "guest";
      console.log(`📋 Роль пользователя ${uid}:`, roleValue);
      return roleValue;
    }

    console.warn(`⚠️ Документ users/${uid} не найден`);

    // Если документа нет — создаём его с ролью "user"
    try {
      const userData = await getUserData(uid);
      await setDoc(doc(db, "users", uid), {
        email: currentUser?.email || "",
        role: "user",
        username: userData?.username || currentUser?.email?.split('@')[0] || "User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log("✅ Создан новый документ пользователя с ролью user");
      return "user";
    } catch (createError) {
      console.error("❌ Ошибка создания документа:", createError);
    }

  } catch (e) {
    console.error("❌ Ошибка получения роли:", e);
  }

  return "guest";
}

// ====================================================
// Получение данных пользователя
// ====================================================

export async function getUserData(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// ====================================================
// Публичное получение роли
// ====================================================

export async function getUserRole(uid) {
  return await fetchRole(uid);
}

// ====================================================
// РЕГИСТРАЦИЯ ПО ЛОГИНУ
// ====================================================

export async function registerWithUsername(username, password, displayName = null) {
  console.log("📝 Регистрация с логином:", username);

  try {
    // Нормализуем логин
    const normalizedUsername = username.toLowerCase().trim();
    
    // Проверяем, не занят ли логин
    const usernameExists = await checkUsernameExists(normalizedUsername);
    if (usernameExists) {
      return { 
        success: false, 
        error: 'Этот логин уже занят' 
      };
    }

    // Создаём виртуальный email
    const email = `${normalizedUsername}@tlloot.app`;
    
    // Создаём пользователя в Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const newUser = userCredential.user;
    console.log("✅ Пользователь создан:", newUser.uid);

    // Создаём документ в Firestore
    await setDoc(doc(db, "users", newUser.uid), {
      email: email,
      role: "user",
      username: normalizedUsername,
      displayName: displayName || normalizedUsername,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    console.log("📄 Документ пользователя создан");

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
// ВХОД ПО ЛОГИНУ
// ====================================================

export async function loginWithUsername(username, password) {
  console.log("🔑 Попытка входа с логином:", username);

  try {
    // Нормализуем логин
    const normalizedUsername = username.toLowerCase().trim();
    
    // Создаём виртуальный email
    const email = `${normalizedUsername}@tlloot.app`;
    
    await setPersistence(auth, browserLocalPersistence);

    const cred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("✅ Вход выполнен:", cred.user.email);

    return {
      success: true,
      user: cred.user
    };
  } catch (error) {
    console.error("❌ Ошибка входа:", error);
    return {
      success: false,
      error: 'Неверный логин или пароль'
    };
  }
}

// ====================================================
// Проверка существования логина
// ====================================================

async function checkUsernameExists(username) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Ошибка проверки логина:', error);
    return false;
  }
}

// ====================================================
// РЕГИСТРАЦИЯ (старая, для обратной совместимости)
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
// Login (старый, для обратной совместимости)
// ====================================================

export async function login(email, password) {
  console.log("🔑 Попытка входа:", email);

  try {
    await setPersistence(auth, browserLocalPersistence);

    const cred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("✅ Вход выполнен:", cred.user.email);

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
  console.log("🚪 Выход из системы");

  sessionStorage.clear();

  await signOut(auth);
  
  return { success: true };
}

// ====================================================
// Проверка прав
// ====================================================

// ⭐ ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ПРАВ НА ЗАПИСЬ (ВКЛЮЧАЯ ГИЛЬД-ЛИДЕРА)
export function canWrite() {
  return (
    currentRole === "admin" ||
    currentRole === "moderator" ||
    currentRole === "guild_leader"
  );
}

export function isAdmin() {
  return currentRole === "admin";
}

export function isModerator() {
  return currentRole === "moderator" || currentRole === "admin";
}

// ⭐ НОВАЯ ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ГИЛЬД-ЛИДЕРА
export function isGuildLeader() {
  return currentRole === "guild_leader" || currentRole === "admin";
}

// ⭐ ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ПРАВ НА УПРАВЛЕНИЕ РЕЙДАМИ
export function canManageRaids() {
  return isAdmin() || currentRole === "guild_leader" || canWrite();
}

// ====================================================
// Вспомогательные функции
// ====================================================

function getAuthErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'Этот логин уже зарегистрирован',
    'auth/invalid-email': 'Некорректный логин',
    'auth/weak-password': 'Пароль должен содержать минимум 6 символов',
    'auth/user-not-found': 'Пользователь с таким логином не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/operation-not-allowed': 'Вход отключён',
    'auth/user-disabled': 'Аккаунт заблокирован',
    'auth/network-request-failed': 'Ошибка сети. Проверьте подключение',
    'auth/requires-recent-login': 'Требуется повторный вход',
    'auth/credential-already-in-use': 'Аккаунт уже используется',
    'auth/email-already-exists': 'Этот логин уже зарегистрирован',
    'auth/invalid-credential': 'Неверный логин или пароль'
  };
  return messages[code] || `Ошибка: ${code}`;
}

// ====================================================
// Navbar UI
// ====================================================

export function updateNavUI() {
  user = currentUser;
  role = currentRole;

  const loginBtn = document.getElementById("btn-login");
  const logoutBtn = document.getElementById("btn-logout");
  const userLabel = document.getElementById("nav-user-label");

  if (loginBtn) {
    loginBtn.classList.toggle("hidden", !!currentUser);
  }

  if (logoutBtn) {
    logoutBtn.classList.toggle("hidden", !currentUser);
  }

  if (userLabel) {
    if (currentUser) {
      // Пытаемся получить username из Firestore
      getUserData(currentUser.uid).then(userData => {
        const username = userData?.username || currentUser.email?.split('@')[0] || 'User';
        userLabel.textContent = `${username} (${currentRole})`;
      });
    } else {
      userLabel.textContent = "Гость";
    }
  }

  document.querySelectorAll("[data-role='admin']").forEach((el) => {
    el.classList.toggle("hidden", currentRole !== "admin");
  });

  document.querySelectorAll("[data-role='moderator']").forEach((el) => {
    el.classList.toggle("hidden", !canWrite());
  });
  
  // ⭐ ДОБАВЛЯЕМ ПОДДЕРЖКУ data-role='guild_leader'
  document.querySelectorAll("[data-role='guild_leader']").forEach((el) => {
    el.classList.toggle("hidden", !isGuildLeader());
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
      updated_at: new Date().toISOString()
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

// ⭐ ДОПОЛНИТЕЛЬНЫЕ ЭКСПОРТЫ
export function getUser() { 
  return currentUser; 
}

export function getRole() { 
  return currentRole; 
}
