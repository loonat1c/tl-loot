// ====================================================
// navbar.js — Навбар с темами и выбором цвета акцента
// ====================================================

import { initAuth, authReady, currentUser, currentRole, logout, canWrite, isModerator, isAdmin } from "./auth.js";

let navbarInitialized = false;

// ── Цветовые акценты ──────────────────────────────
const ACCENT_COLORS = {
  violet:  { label: 'Фиолет', color: '#7c3aed' },
  ocean:   { label: 'Океан',  color: '#2563eb' },
  sakura:  { label: 'Сакура', color: '#db2777' },
  amber:   { label: 'Янтарь', color: '#d97706' },
  forest:  { label: 'Лес',    color: '#16a34a' },
  scarlet: { label: 'Алый',   color: '#dc2626' },
  steel:   { label: 'Сталь',  color: '#475569' },
  copper:  { label: 'Медь',   color: '#b45309' },
};

// ── Темы ──────────────────────────────────────────
const THEMES = {
  dark:  { label: 'Тёмная',  icon: 'dark-preview'  },
  light: { label: 'Светлая', icon: 'light-preview' },
  tl:    { label: 'T&L',     icon: 'tl-preview'    },
};

let currentAccent = 'violet';
let currentTheme  = 'tl';

// ── Init ──────────────────────────────────────────
export async function initNavbar() {
  if (navbarInitialized) return;
  navbarInitialized = true;

  loadSettings();

  await initAuth();
  await authReady;

  const nav = document.getElementById("main-nav");
  if (!nav) { console.warn('⚠️ #main-nav не найден'); return; }

  renderNav(nav);
  updateRoleElements();
  setupMobileMenu();
  setupThemeControls();
}

// ── Загрузка настроек из localStorage ─────────────
function loadSettings() {
  const savedTheme  = localStorage.getItem('tl_theme');
  const savedAccent = localStorage.getItem('tl_color');

  if (savedTheme && THEMES[savedTheme]) {
    currentTheme = savedTheme;
  }

  if (savedAccent && ACCENT_COLORS[savedAccent]) {
    currentAccent = savedAccent;
  }

  // T&L тема использует фиксированное золото, акцент не меняем
  applyTheme(currentTheme);
  if (currentTheme !== 'tl') {
    applyAccent(currentAccent);
  }
}

// ── Применить тему ─────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('tl_theme', theme);
  currentTheme = theme;

  // T&L: цвет акцента зафиксирован — сбрасываем переопределения
  if (theme === 'tl') {
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--accent-soft');
    document.documentElement.style.removeProperty('--accent-glow');
    document.documentElement.style.removeProperty('--accent-text');
    document.documentElement.style.removeProperty('--accent-rgb');
  } else {
    applyAccent(currentAccent);
  }
}

// ── Применить акцентный цвет ───────────────────────
function applyAccent(key) {
  const hex = ACCENT_COLORS[key]?.color || '#7c3aed';

  // Вычисляем RGB для glow
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.6 ? '#111' : '#fff';

  const root = document.documentElement;
  root.style.setProperty('--accent',      hex);
  root.style.setProperty('--accent-soft', shiftLightness(hex, 20));
  root.style.setProperty('--accent-glow', hex + '30');
  root.style.setProperty('--accent-text', textColor);
  root.style.setProperty('--accent-rgb',  `${r},${g},${b}`);

  localStorage.setItem('tl_color', key);
  currentAccent = key;
}

// Осветляет hex-цвет на ~delta% (упрощённо через mix)
function shiftLightness(hex, delta) {
  const r = Math.min(255, parseInt(hex.slice(1,3), 16) + delta * 2);
  const g = Math.min(255, parseInt(hex.slice(3,5), 16) + delta * 2);
  const b = Math.min(255, parseInt(hex.slice(5,7), 16) + delta * 2);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Рендер навбара ─────────────────────────────────
function renderNav(nav) {
  const isAuth      = !!currentUser;
  const email       = currentUser?.email || "";
  const isUserAdmin = isAdmin();

  const p          = window.location.pathname;
  const isItems    = p.includes('items.html');
  const isAdmin_p  = p.includes('admin.html');
  const isRaid     = p.includes('raids.html');
  const isPlayers  = p.includes('players.html');
  const isStats    = p.includes('stats.html');
  const isSearch   = p.includes('search.html');
  const isBosses   = p.includes('bosses.html');
  const isProfile  = p.includes('profile.html');

  const ballColor = currentTheme === 'tl'
    ? '#c9aa71'
    : (ACCENT_COLORS[currentAccent]?.color || '#7c3aed');

  nav.innerHTML = `
    <div class="navbar-inner">

      <div class="nav-left">
        <a href="/index.html" class="nav-brand" aria-label="На главную">
          <img src="/assets/img/logo.png" alt="TL Loot" class="nav-logo" />
        </a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Меню">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div class="nav-center" id="nav-menu">
        <div class="nav-links">
          <a href="/pages/items.html" class="${isItems ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 7h-4.5A2.5 2.5 0 0013 4.5V3a1 1 0 00-1-1H9.5A1.5 1.5 0 008 3.5V4a2.5 2.5 0 00-2.5 2.5H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Предметы</span>
          </a>
          <a href="/pages/bosses.html" class="${isBosses ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke-width="2"/><circle cx="12" cy="9" r="2" stroke-width="2"/></svg>
            <span>Боссы</span>
          </a>
          <a href="/pages/raids.html" class="${isRaid ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Рейды</span>
          </a>
          ${isUserAdmin ? `
            <a href="/pages/search.html"  class="${isSearch  ? 'active' : ''}">
              <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="8" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/></svg>
              <span>Поиск</span>
            </a>
            <a href="/pages/players.html" class="${isPlayers ? 'active' : ''}">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke-width="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-width="2" stroke-linecap="round"/></svg>
              <span>Игроки</span>
            </a>
            <a href="/pages/stats.html"   class="${isStats   ? 'active' : ''}">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 20V10M12 20V4M6 20v-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Статистика</span>
            </a>
          ` : ''}
          ${isAuth && isModerator() ? `
            <a href="/pages/admin.html" class="${isAdmin_p ? 'active' : ''}">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round"/></svg>
              <span>Админка</span>
            </a>
          ` : ''}
        </div>
      </div>

      <div class="nav-right">
        ${isAuth ? `
          <a href="/pages/profile.html" class="btn-profile ${!isProfile ? 'active' : ''}" id="btn-profile">
            <span class="profile-avatar">${email.charAt(0).toUpperCase()}</span>
            <span class="profile-email">${email.split('@')[0]}</span>
          </a>
        ` : `
          <a href="/pages/login.html"    class="btn-login">Войти</a>
          <a href="/pages/register.html" class="btn-register">Регистрация</a>
        `}

        <!-- Переключатель темы + акцент -->
        <div class="theme-toggle" id="theme-toggle">
          <span class="color-ball" id="color-ball" style="background:${ballColor};" title="Тема и цвет"></span>

          <div class="color-picker-popup" id="color-picker-popup">

            <!-- Переключатель тем -->
            <div class="popup-section-label">Тема</div>
            <div class="theme-switcher">
              ${Object.entries(THEMES).map(([key, t]) => `
                <div class="theme-option ${currentTheme === key ? 'active' : ''}" data-theme="${key}">
                  <span class="theme-icon ${t.icon}"></span>
                  <span class="theme-label">${t.label}</span>
                </div>
              `).join('')}
            </div>

            <hr class="popup-separator" />

            <!-- Акцент (скрыт в T&L) -->
            <div id="accent-section">
              <div class="popup-section-label">Акцент</div>
              <div class="color-grid">
                ${Object.entries(ACCENT_COLORS).map(([key, s]) => `
                  <div class="color-option ${currentAccent === key ? 'active' : ''}" data-color="${key}">
                    <span class="color-swatch" style="background:${s.color};"></span>
                    <span class="color-label">${s.label}</span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        </div>

        ${isAuth ? `
          <button class="btn-logout" id="btn-logout" title="Выйти">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke-width="2" stroke-linecap="round"/><path d="M16 17l5-5-5-5" stroke-width="2" stroke-linecap="round"/><path d="M21 12H9" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        ` : ''}
      </div>

    </div>
  `;

  // Выход
  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    await logout();
    window.location.href = "/index.html";
  });
}

// ── Мобильное меню ─────────────────────────────────
function updateRoleElements() {
  document.querySelectorAll("[data-role='admin']").forEach(el =>
    el.classList.toggle("hidden", currentRole !== "admin")
  );
  document.querySelectorAll("[data-role='moderator']").forEach(el =>
    el.classList.toggle("hidden", !canWrite())
  );
}

function setupMobileMenu() {
  const toggle = () => {
    const menu   = document.getElementById("nav-menu");
    const btn    = document.getElementById("nav-toggle");
    if (!menu || !btn) return;
    const isOpen = menu.classList.toggle("open");
    btn.classList.toggle("open", isOpen);
  };

  document.getElementById("nav-toggle")?.addEventListener("click", toggle);

  document.addEventListener("click", e => {
    const menu = document.getElementById("nav-menu");
    const btn  = document.getElementById("nav-toggle");
    if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
      btn.classList.remove("open");
    }
  });

  document.querySelectorAll("#nav-menu a").forEach(link =>
    link.addEventListener("click", () => {
      if (window.innerWidth <= 992) {
        document.getElementById("nav-menu")?.classList.remove("open");
        document.getElementById("nav-toggle")?.classList.remove("open");
      }
    })
  );
}

// ── Управление темой и цветом ──────────────────────
function setupThemeControls() {
  const toggleBtn = document.getElementById("theme-toggle");
  const popup     = document.getElementById("color-picker-popup");
  const ball      = document.getElementById("color-ball");
  if (!toggleBtn || !popup || !ball) return;

  // Открытие/закрытие попапа
  ball.addEventListener("click", e => {
    e.stopPropagation();
    popup.classList.toggle("open");
    syncAccentSection();
  });

  // Закрытие вне попапа
  document.addEventListener("click", e => {
    if (!toggleBtn.contains(e.target)) popup.classList.remove("open");
  });

  // Переключение темы
  document.querySelectorAll(".theme-option").forEach(opt => {
    opt.addEventListener("click", e => {
      e.stopPropagation();
      const theme = opt.dataset.theme;
      if (!theme) return;

      applyTheme(theme);

      document.querySelectorAll(".theme-option").forEach(el =>
        el.classList.toggle("active", el.dataset.theme === theme)
      );

      // Обновить цвет шарика
      ball.style.background = theme === 'tl'
        ? '#c9aa71'
        : (ACCENT_COLORS[currentAccent]?.color || '#7c3aed');

      syncAccentSection();
    });
  });

  // Выбор акцента
  document.querySelectorAll(".color-option").forEach(opt => {
    opt.addEventListener("click", e => {
      e.stopPropagation();
      const color = opt.dataset.color;
      if (!color || currentTheme === 'tl') return;

      applyAccent(color);
      ball.style.background = ACCENT_COLORS[color].color;

      document.querySelectorAll(".color-option").forEach(el =>
        el.classList.toggle("active", el.dataset.color === color)
      );

      popup.classList.remove("open");
    });
  });
}

// Скрывает секцию акцента в T&L теме
function syncAccentSection() {
  const section = document.getElementById("accent-section");
  if (!section) return;
  section.style.display = currentTheme === 'tl' ? 'none' : '';
}
