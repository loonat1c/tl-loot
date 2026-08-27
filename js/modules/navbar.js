// ====================================================
// navbar.js — Навбар
// ====================================================

import { initAuth, authReady, currentUser, currentRole, logout, canWrite } from "./auth.js";

let navbarInitialized = false;

export async function initNavbar() {

  if (navbarInitialized) return;
  navbarInitialized = true;

  await initAuth();
  await authReady;

  const nav = document.getElementById("main-nav");
  if (!nav) return;

  renderNav(nav);
  updateRoleElements();
}

function renderNav(nav) {
  const isAuth = !!currentUser;
  const role = currentRole || "guest";
  const email = currentUser?.email || "";

  // Определяем текущую страницу для подсветки активной ссылки
  const currentPath = window.location.pathname;
  const isItemsPage = currentPath.includes('items.html');
  const isAdminPage = currentPath.includes('admin.html');
  const isRaidPage = currentPath.includes('raids.html');
  const isPlayersPage = currentPath.includes('players.html');
  const isStatsPage = currentPath.includes('stats.html');
  const isSearchPage = currentPath.includes('search.html');
  
  // Главная страница: если путь заканчивается на / или index.html
  const isIndexPage = currentPath.endsWith('/') || 
                       currentPath.endsWith('/index.html') ||
                       currentPath === '/index.html';

  nav.innerHTML = `
    <a href="/index.html" class="nav-brand">⚔️ TL Loot</a>
    
    <div class="nav-links">
      <a href="/index.html" class="${isIndexPage ? 'active' : ''}">Главная</a>
      <a href="/pages/items.html" class="${isItemsPage ? 'active' : ''}">Предметы</a>
      <a href="/pages/raids.html" class="${isRaidPage ? 'active' : ''}">Рейды</a>
      <a href="/pages/players.html" class="${isPlayersPage ? 'active' : ''}">Игроки</a>
      <a href="/pages/search.html" class="${isSearchPage ? 'active' : ''}">Поиск</a>
      <a href="/pages/stats.html" class="${isStatsPage ? 'active' : ''}">Статистика</a>
      ${isAuth && canWrite() ? `<a href="/pages/admin.html" class="${isAdminPage ? 'active' : ''}">⚙️ Админка</a>` : ''}
    </div>
    
    <div class="nav-user">
      ${isAuth ? `
        <span id="nav-user-label">${email} (${role})</span>
        <button class="btn btn-ghost btn-sm" id="btn-logout">Выйти</button>
      ` : `
        <a href="/pages/login.html" class="btn btn-ghost btn-sm" id="btn-login">Войти</a>
        <a href="/pages/register.html" class="btn btn-primary btn-sm">Регистрация</a>
      `}
    </div>
  `;

  // Обработчик выхода
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logout();
      window.location.href = "/index.html";
    });
  }
}

function updateRoleElements() {
  document.querySelectorAll("[data-role='admin']").forEach(el => {
    el.classList.toggle("hidden", currentRole !== "admin");
  });

  document.querySelectorAll("[data-role='moderator']").forEach(el => {
    el.classList.toggle("hidden", !canWrite());
  });
}
