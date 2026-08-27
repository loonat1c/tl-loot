// ====================================================
// navbar.js — Навбар
// ====================================================

import { initAuth, authReady, currentUser, currentRole, logout } from "./auth.js";

let navbarInitialized = false;

export async function initNavbar() {

  if (navbarInitialized) return;
  navbarInitialized = true;

  // Ждём авторизацию
  await initAuth();
  await authReady;

  const nav = document.getElementById("main-nav");
  if (!nav) return;

  // Отрисовываем навбар
  renderNav(nav);
}

function renderNav(nav) {
  const isAuth = !!currentUser;
  const role = currentRole || "guest";
  const email = currentUser?.email || "";

  nav.innerHTML = `
    <div class="nav-container">
      <a href="/index.html" class="nav-brand">⚔️ TL Loot</a>
      
      <div class="nav-links">
        <a href="/index.html">Главная</a>
        <a href="/items.html">Предметы</a>
        
        ${isAuth ? `
          <span class="nav-user-label" id="nav-user-label">
            ${email} (${role})
          </span>
          <button class="btn btn-ghost btn-sm" id="btn-logout">Выйти</button>
        ` : `
          <a href="/login.html" class="btn btn-ghost btn-sm" id="btn-login">Войти</a>
          <a href="/register.html" class="btn btn-primary btn-sm">Регистрация</a>
        `}
      </div>
    </div>
  `;

  // Вешаем обработчик на кнопку выхода
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
      window.location.href = "/index.html";
    });
  }
}
