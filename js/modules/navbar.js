// ====================================================
// navbar.js — Навбар с адаптивным меню и выбором темы
// ====================================================

import { initAuth, authReady, currentUser, currentRole, logout, canWrite, isModerator } from "./auth.js";

let navbarInitialized = false;

// Цветовые схемы
const COLOR_SCHEMES = {
  purple: { label: 'Фиолетовый', color: '#7c3aed' },
  blue: { label: 'Синий', color: '#3b82f6' },
  green: { label: 'Зеленый', color: '#22c55e' },
  red: { label: 'Красный', color: '#ef4444' },
  orange: { label: 'Оранжевый', color: '#f59e0b' },
  pink: { label: 'Розовый', color: '#ec4899' }
};

let currentTheme = 'dark';
let currentColor = 'purple';

export async function initNavbar() {

  if (navbarInitialized) return;
  navbarInitialized = true;

  // Загружаем сохраненные настройки
  loadThemeSettings();

  await initAuth();
  await authReady;

  const nav = document.getElementById("main-nav");
  if (!nav) return;

  renderNav(nav);
  updateRoleElements();
  setupMobileMenu();
  setupThemeControls();
}

function loadThemeSettings() {
  const savedTheme = localStorage.getItem('tl_theme');
  const savedColor = localStorage.getItem('tl_color');
  
  if (savedTheme) currentTheme = savedTheme;
  if (savedColor) currentColor = savedColor;
  
  applyTheme(currentTheme, currentColor);
}

function applyTheme(theme, color) {
  // Применяем тему (dark/light)
  document.documentElement.setAttribute('data-theme', theme);
  
  // Применяем цвет акцента
  const colorHex = COLOR_SCHEMES[color]?.color || '#7c3aed';
  document.documentElement.style.setProperty('--accent', colorHex);
  document.documentElement.style.setProperty('--accent-soft', colorHex + 'cc');
  document.documentElement.style.setProperty('--accent-glow', colorHex + '40');
  
  // Сохраняем в localStorage
  localStorage.setItem('tl_theme', theme);
  localStorage.setItem('tl_color', color);
}

function renderNav(nav) {
  const isAuth = !!currentUser;
  const role = currentRole || "guest";
  const email = currentUser?.email || "";

  // Определяем текущую страницу
  const currentPath = window.location.pathname;
  const isItemsPage = currentPath.includes('items.html');
  const isAdminPage = currentPath.includes('admin.html');
  const isRaidPage = currentPath.includes('raids.html');
  const isPlayersPage = currentPath.includes('players.html');
  const isStatsPage = currentPath.includes('stats.html');
  const isSearchPage = currentPath.includes('search.html');
  const isBossesPage = currentPath.includes('bosses.html');
  const isProfilePage = currentPath.includes('profile.html');
  
  const isIndexPage = currentPath.endsWith('/') || 
                       currentPath.endsWith('/index.html') ||
                       currentPath === '/index.html';

  const isProfileActive = !isProfilePage && isAuth;

  const themeIcon = currentTheme === 'dark' ? '🌙' : '☀️';

  nav.innerHTML = `
    <div class="navbar-inner">
      <div class="nav-left">
        <a href="/index.html" class="nav-brand" aria-label="На главную">
          <img src="/assets/img/logo.png" alt="TL Loot" class="nav-logo" />
        </a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Меню">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <div class="nav-center" id="nav-menu">
        <div class="nav-links">
          <a href="/pages/items.html" class="${isItemsPage ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 7h-4.5A2.5 2.5 0 0013 4.5V3a1 1 0 00-1-1H9.5A1.5 1.5 0 008 3.5V4a2.5 2.5 0 00-2.5 2.5H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Предметы</span>
          </a>
          <a href="/pages/bosses.html" class="${isBossesPage ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2" stroke="currentColor" stroke-width="2"/></svg>
            <span>Боссы</span>
          </a>
          <a href="/pages/raids.html" class="${isRaidPage ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Рейды</span>
          </a>
          <a href="/pages/players.html" class="${isPlayersPage ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Игроки</span>
          </a>
          <a href="/pages/search.html" class="${isSearchPage ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Поиск</span>
          </a>
          <a href="/pages/stats.html" class="${isStatsPage ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M21 12v-2a5 5 0 00-5-5H8a5 5 0 00-5 5v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 12h18" stroke="currentColor" stroke-width="2"/><path d="M3 16h18" stroke="currentColor" stroke-width="2"/><path d="M9 8h6" stroke="currentColor" stroke-width="2"/></svg>
            <span>Статистика</span>
          </a>
          ${isAuth && isModerator() ? `
            <a href="/pages/admin.html" class="${isAdminPage ? 'active' : ''}">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span>Админка</span>
            </a>
          ` : ''}
        </div>
      </div>
      
      <div class="nav-right">
        ${isAuth ? `
          <a href="/pages/profile.html" class="btn-profile ${isProfileActive ? 'active' : ''}" id="btn-profile">
            <span class="profile-avatar">${email.charAt(0).toUpperCase()}</span>
            <span class="profile-email">${email.split('@')[0]}</span>
          </a>
        ` : `
          <a href="/pages/login.html" class="btn-login">Войти</a>
          <a href="/pages/register.html" class="btn-register">Регистрация</a>
        `}
        
        <!-- Кнопка темы и цветов -->
        <div class="theme-toggle" id="theme-toggle" title="Настройка темы">
          <span id="theme-icon">${themeIcon}</span>
          <span class="color-dot" style="width:14px;height:14px;border-radius:50%;background:${COLOR_SCHEMES[currentColor].color};border:2px solid var(--theme-border);display:inline-block;"></span>
          
          <div class="color-picker-popup" id="color-picker-popup">
            <div style="font-size:0.7rem;color:var(--theme-text-muted);margin-bottom:0.5rem;text-align:center;padding:0.25rem;">Цвет акцента</div>
            ${Object.entries(COLOR_SCHEMES).map(([key, scheme]) => `
              <div class="color-option" data-color="${key}">
                <span class="color-dot ${currentColor === key ? 'active' : ''}" style="background:${scheme.color};width:20px;height:20px;border-radius:50%;border:2px solid var(--theme-border);display:inline-block;flex-shrink:0;"></span>
                ${scheme.label}
              </div>
            `).join('')}
            <div style="border-top:1px solid var(--theme-border);margin:0.4rem 0;"></div>
            <div class="color-option" id="theme-mode-toggle">
              <span>${currentTheme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}</span>
            </div>
          </div>
        </div>
        
        ${isAuth ? `
          <button class="btn-logout" id="btn-logout" title="Выйти">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 17l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        ` : ''}
      </div>
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

  // Обработчик toggle меню
  const toggleBtn = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (toggleBtn && menu) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggleBtn.classList.toggle("open");
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

function setupMobileMenu() {
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("nav-menu");
    const toggle = document.getElementById("nav-toggle");
    if (menu && toggle && !toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
      toggle.classList.remove("open");
    }
  });

  document.querySelectorAll("#nav-menu a").forEach(link => {
    link.addEventListener("click", () => {
      const menu = document.getElementById("nav-menu");
      const toggle = document.getElementById("nav-toggle");
      if (menu && toggle && window.innerWidth <= 992) {
        menu.classList.remove("open");
        toggle.classList.remove("open");
      }
    });
  });
}

function setupThemeControls() {
  const toggleBtn = document.getElementById("theme-toggle");
  const popup = document.getElementById("color-picker-popup");
  
  if (!toggleBtn || !popup) return;

  // Открытие/закрытие попапа
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.classList.toggle("open");
  });

  // Закрытие по клику вне
  document.addEventListener("click", (e) => {
    if (toggleBtn && !toggleBtn.contains(e.target)) {
      popup.classList.remove("open");
    }
  });

  // Выбор цвета
  document.querySelectorAll(".color-option[data-color]").forEach(option => {
    option.addEventListener("click", () => {
      const color = option.dataset.color;
      currentColor = color;
      applyTheme(currentTheme, currentColor);
      
      // Обновляем цветовую точку в кнопке
      const dot = toggleBtn.querySelector('.color-dot');
      if (dot) {
        dot.style.background = COLOR_SCHEMES[color].color;
      }
      
      // Обновляем активный класс
      document.querySelectorAll(".color-option .color-dot").forEach(d => {
        d.classList.toggle('active', d.parentElement.dataset.color === color);
      });
      
      popup.classList.remove("open");
    });
  });

  // Переключение темы
  document.getElementById("theme-mode-toggle")?.addEventListener("click", () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme, currentColor);
    
    // Обновляем иконку
    const icon = document.getElementById("theme-icon");
    if (icon) {
      icon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
    }
    
    // Обновляем текст
    const toggleText = document.querySelector("#theme-mode-toggle span");
    if (toggleText) {
      toggleText.textContent = currentTheme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая';
    }
    
    popup.classList.remove("open");
  });
}
