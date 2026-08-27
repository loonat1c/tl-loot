// ====================================================
// navbar.js — единый навбар
// ====================================================

import { initAuth, logout } from "./auth.js";

function getActivePage() {
  const path = window.location.pathname;
  if (path.includes("players"))  return "players";
  if (path.includes("items"))    return "items";
  if (path.includes("bosses"))   return "bosses";
  if (path.includes("raids"))    return "raids";
  if (path.includes("search"))   return "search";
  if (path.includes("stats"))    return "stats";
  if (path.includes("admin"))    return "admin";
  if (path.includes("settings")) return "settings";
  if (path.includes("login"))    return "login";
  return "home";
}

function getBase() {
  return window.location.pathname.includes("/pages/") ? "" : "pages/";
}

export function initNavbar() {
  const active   = getActivePage();
  const base     = getBase();
  const rootBase = base === "" ? "../" : "";

  const nav = document.getElementById("main-nav");
  if (!nav) return;

  nav.innerHTML = `
    <a class="nav-brand" href="${rootBase}index.html">
      <span class="nav-brand-text">⚔️ TL Loot</span>
    </a>
    <div class="nav-links">
      <a href="${base}players.html"  class="${active==="players"  ? "active":""}">Игроки</a>
      <a href="${base}items.html"    class="${active==="items"    ? "active":""}">Предметы</a>
      <a href="${base}bosses.html"   class="${active==="bosses"   ? "active":""}">Боссы</a>
      <a href="${base}raids.html"    class="${active==="raids"    ? "active":""}">Рейды</a>
      <a href="${base}search.html"   class="${active==="search"   ? "active":""}">Поиск</a>
      <a href="${base}stats.html"    class="${active==="stats"    ? "active":""}">Статистика</a>
      <a href="${base}admin.html"    class="${active==="admin"    ? "active":""}" data-role="moderator" class="hidden">Управление</a>
      <a href="${base}settings.html" class="${active==="settings" ? "active":""}" data-role="admin" class="hidden">Настройки</a>
    </div>
    <div class="nav-user">
      <span id="nav-user-label">Гость</span>
      <button class="btn btn-sm hidden" id="btn-login" onclick="location.href='${base}login.html'">Войти</button>
      <button class="btn btn-sm hidden" id="btn-logout">Выйти</button>
    </div>
  `;

  document.getElementById("btn-logout").addEventListener("click", () => {
    logout().then(() => location.reload());
  });

  // Показываем кнопку Войти сразу (до auth) — auth скроет если залогинен
  document.getElementById("btn-login").classList.remove("hidden");
}
