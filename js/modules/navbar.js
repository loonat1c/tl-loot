// ====================================================
// navbar.js — единый навбар для всех страниц
// Подключается один раз, рендерит навбар динамически
// ====================================================

import { initAuth, logout } from "./auth.js";

// Определяем активную страницу по URL
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

// Определяем префикс пути (root или pages/)
function getBase() {
  const path = window.location.pathname;
  // Если мы в /pages/ — ссылки без префикса
  // Если в корне — ссылки с pages/
  return path.includes("/pages/") ? "" : "pages/";
}

export function initNavbar() {
  const active = getActivePage();
  const base   = getBase();
  const rootBase = base === "" ? "../" : "";

  const nav = document.getElementById("main-nav");
  if (!nav) return;

  nav.innerHTML = `
    <a class="nav-brand" href="${rootBase}index.html">
      <span class="nav-brand-text">⚔️ TL Loot</span>
    </a>
    <div class="nav-links">
      <a href="${base}players.html"  class="${active==="players"  ? "active" : ""}">Игроки</a>
      <a href="${base}items.html"    class="${active==="items"    ? "active" : ""}">Предметы</a>
      <a href="${base}bosses.html"   class="${active==="bosses"   ? "active" : ""}">Боссы</a>
      <a href="${base}raids.html"    class="${active==="raids"    ? "active" : ""}">Рейды</a>
      <a href="${base}search.html"   class="${active==="search"   ? "active" : ""}">Поиск</a>
      <a href="${base}stats.html"    class="${active==="stats"    ? "active" : ""}">Статистика</a>
      <a href="${base}admin.html"    class="${active==="admin"    ? "active" : ""}" data-role="moderator" style="display:none">Управление</a>
      <a href="${base}settings.html" class="${active==="settings" ? "active" : ""}" data-role="admin"     style="display:none">Настройки</a>
    </div>
    <div class="nav-user">
      <span id="nav-user-label">Гость</span>
      <button class="btn btn-sm" id="btn-login"  onclick="location.href='${base}login.html'">Войти</button>
      <button class="btn btn-sm" id="btn-logout" style="display:none">Выйти</button>
    </div>
  `;

  // Кнопка выйти
  document.getElementById("btn-logout").addEventListener("click", () => {
    logout().then(() => location.reload());
  });

  // Запускаем auth — он сам обновит UI через updateNavUI()
  initAuth((_user, _role) => {});
}
