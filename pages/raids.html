<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Рейды — TL Loot</title>
  <link rel="stylesheet" href="../css/main.css" />
  <style>
    .raids-layout { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; align-items: start; }
    @media (max-width: 800px) { .raids-layout { grid-template-columns: 1fr; } }

    .raid-list-item { 
      padding: 0.75rem 1rem; 
      border: 1px solid var(--border); 
      border-radius: var(--radius); 
      cursor: pointer; 
      transition: all 0.2s; 
      margin-bottom: 0.5rem;
      background: var(--bg-card);
    }
    .raid-list-item:hover  { border-color: var(--accent); transform: translateX(4px); }
    .raid-list-item.active { border-color: var(--accent); background: var(--accent-glow); box-shadow: 0 0 20px var(--accent-glow); }
    .raid-list-item.deleted { opacity: 0.3; border-style: dashed; pointer-events: none; }
    .raid-date { font-weight: 600; font-size: 0.95rem; }
    .raid-meta { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }

    .try-block {
      background: var(--bg-card2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 1rem;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .try-block:hover { border-color: var(--accent); }
    .try-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: rgba(201,168,76,0.05);
      border-bottom: 1px solid var(--border);
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .try-title { font-weight: 700; color: var(--accent-soft); font-size: 0.95rem; }
    .try-boss { 
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem; 
      color: var(--text-muted); 
      margin-left: 0.5rem; 
    }
    .try-boss .boss-icon-small {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--bg-card);
      border: 1px solid var(--border);
    }
    .try-body  { padding: 0.75rem 1rem; }

    .drop-row {
      display: grid; 
      grid-template-columns: 44px 1fr auto auto;
      gap: 0.75rem; 
      align-items: center;
      padding: 0.5rem 0; 
      border-bottom: 1px solid var(--border); 
      font-size: 0.85rem;
      transition: background 0.15s;
    }
    .drop-row:last-child { border-bottom: none; }
    .drop-row:hover { background: var(--bg-card); border-radius: 4px; }
    .drop-img  { 
      width: 44px; 
      height: 44px; 
      border-radius: 8px; 
      object-fit: cover; 
      background: var(--bg-card2);
      border: 1px solid var(--border);
    }
    .drop-name { font-weight: 600; color: var(--text); }
    .drop-detail { 
      font-size: 0.75rem; 
      color: var(--text-muted); 
      margin-top: 1px;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      flex-wrap: wrap;
    }
    .drop-property { 
      font-size: 0.65rem; 
      color: var(--accent-soft); 
      background: var(--accent-glow); 
      padding: 0.1rem 0.5rem; 
      border-radius: 10px; 
      display: inline-block; 
      margin-top: 2px; 
    }
    .drop-boss-tag {
      font-size: 0.65rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.2rem;
      margin-top: 2px;
    }
    .drop-boss-tag img {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      object-fit: cover;
    }
    .drop-winner { text-align: right; }
    .drop-winner strong { 
      display: block; 
      font-size: 0.85rem; 
      color: var(--success);
    }
    .drop-winner span   { 
      font-size: 0.65rem; 
      color: var(--text-muted);
      background: var(--bg-card2);
      padding: 0.1rem 0.4rem;
      border-radius: 10px;
    }
    .drop-winner .no-winner { 
      color: var(--text-muted); 
      font-style: italic; 
      font-size: 0.75rem; 
    }
    .drop-actions { display: flex; gap: 0.3rem; align-items: center; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .modal-header h3 { font-size: 1.1rem; }
    .btn-close { background: none; border: none; color: var(--text-muted); font-size: 1.25rem; cursor: pointer; }
    .btn-close:hover { color: var(--text); }

    .item-search-results { max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius); margin-top: 0.5rem; }
    .item-search-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; cursor: pointer; border-bottom: 1px solid var(--border); font-size: 0.85rem; transition: background 0.15s; }
    .item-search-row:last-child { border-bottom: none; }
    .item-search-row:hover   { background: var(--bg-card2); }
    .item-search-row.selected{ background: var(--accent-glow); border-left: 2px solid var(--accent); }
    .item-search-img { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; background: var(--bg-card2); }

    .property-select-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
    .property-btn { padding: 0.3rem 0.7rem; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-card2); color: var(--text); font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
    .property-btn:hover { border-color: var(--accent); }
    .property-btn.selected { border-color: var(--accent); background: var(--accent-glow); color: var(--accent-soft); }

    .section-title { font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0.75rem 0 0.4rem; }

    .empty-raid { text-align: center; padding: 3rem; color: var(--text-muted); }

    .roll-btn { 
      background: var(--accent); 
      color: #fff; 
      border: none; 
      padding: 0.25rem 0.75rem; 
      border-radius: 6px; 
      font-size: 0.7rem; 
      font-weight: 600;
      cursor: pointer; 
      transition: all 0.15s; 
    }
    .roll-btn:hover { 
      background: var(--accent-soft); 
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
    }
    .roll-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .roll-btn.rolling { background: var(--warning); animation: pulse 1s infinite; }
    .roll-btn.finished { background: var(--bg-card2); color: var(--text-muted); cursor: default; }
    .roll-btn.finished:hover { transform: none; box-shadow: none; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .status-badge {
      font-size: 0.65rem;
      padding: 0.15rem 0.6rem;
      border-radius: 12px;
      font-weight: 600;
    }
    .status-badge.open { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .status-badge.rolling { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .status-badge.closed { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }

    .show-deleted-btn { font-size: 0.78rem; color: var(--text-muted); cursor: pointer; text-decoration: underline; margin-top: 0.5rem; display: block; }
    
    .roll-participant {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.4rem 0.6rem;
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;
    }
    .roll-participant:hover { background: var(--bg-card2); }
    .roll-participant .player-name { font-weight: 500; }
    .roll-participant .player-status { font-size: 0.75rem; color: var(--text-muted); }
    .roll-participant .player-roll { 
      font-size: 1.1rem; 
      font-weight: 700; 
      color: var(--accent-soft);
      min-width: 40px;
      text-align: center;
    }
    .roll-participant.joined { background: var(--accent-glow); border-left: 2px solid var(--accent); }
    .roll-participant.winner { background: rgba(34, 197, 94, 0.15); border-left: 2px solid #22c55e; }
    .roll-participant.blocked { opacity: 0.5; border-left: 2px solid var(--danger); }
    .roll-participant.not-attended { opacity: 0.4; border-left: 2px solid var(--text-muted); }
    
    .join-btn {
      padding: 0.15rem 0.6rem;
      border-radius: 4px;
      border: 1px solid var(--border);
      background: var(--bg-card2);
      color: var(--text);
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .join-btn:hover { border-color: var(--accent); background: var(--accent-glow); }
    .join-btn.joined { border-color: var(--accent); background: var(--accent-glow); color: var(--accent-soft); }
    .join-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .queue-toggle {
      display: flex;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }
    .queue-btn {
      padding: 0.3rem 1rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg-card2);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s;
      font-size: 0.8rem;
    }
    .queue-btn:hover { border-color: var(--accent); }
    .queue-btn.active { border-color: var(--accent); background: var(--accent-glow); color: var(--accent-soft); }
    .queue-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    
    .lucent-icon {
      width: 16px;
      height: 16px;
      vertical-align: middle;
      display: inline-block;
      margin-right: 2px;
    }
    .lucent-icon-lg {
      width: 20px;
      height: 20px;
      vertical-align: middle;
      display: inline-block;
      margin-right: 2px;
    }

    .btn-sm {
      padding: 0.3rem 0.8rem;
      font-size: 0.75rem;
      border-radius: 6px;
    }
    .btn-sm:hover {
      transform: translateY(-1px);
    }

    .attendance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.5rem;
      margin-top: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
    }
    .attendance-player {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.6rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 0.85rem;
      user-select: none;
      transition: all 0.15s;
    }
    .attendance-player.present {
      border-color: var(--success);
      background: rgba(34,197,94,0.1);
      color: var(--success);
    }
    .attendance-player .char-weapon-tag {
      font-size: 0.6rem;
      color: var(--text-muted);
      background: var(--bg-card2);
      padding: 0.05rem 0.4rem;
      border-radius: 10px;
    }
  </style>
</head>
<body>
<nav class="navbar" id="main-nav"></nav>

<main class="container">
  <div class="page-header">
    <h2>⚔️ Рейды</h2>
    <div class="flex gap-1">
      <button class="btn btn-primary" id="btn-new-raid">+ Новый рейд</button>
    </div>
  </div>
  <div class="raids-layout">
    <div>
      <div id="raids-list"><div class="text-muted">Загрузка...</div></div>
      <span class="show-deleted-btn hidden" id="btn-show-deleted" data-role="admin">Показать удалённые</span>
    </div>
    <div id="raid-detail">
      <div class="empty-raid"><div style="font-size:2rem">⚔️</div><div class="mt-1">Выбери рейд слева</div></div>
    </div>
  </div>
</main>

<!-- Новый рейд -->
<div class="modal-overlay hidden" id="modal-raid">
  <div class="modal">
    <div class="modal-header"><h3 id="modal-raid-title">Новый рейд</h3><button class="btn-close" onclick="closeModal('modal-raid')">✕</button></div>
    <div class="form-group"><label>Дата *</label><input type="date" id="raid-date" /></div>
    <div class="form-group"><label>Заметки</label><textarea id="raid-notes" rows="2"></textarea></div>
    <div id="raid-error" class="text-danger mt-1" style="display:none;font-size:0.85rem"></div>
    <div class="flex gap-1 mt-3">
      <button class="btn btn-primary" id="btn-create-raid">Создать</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-raid')">Отмена</button>
    </div>
  </div>
</div>

<!-- Новый трай -->
<div class="modal-overlay hidden" id="modal-try">
  <div class="modal">
    <div class="modal-header"><h3>Добавить трай</h3><button class="btn-close" onclick="closeModal('modal-try')">✕</button></div>
    <div class="form-group">
      <label>Босс</label>
      <select id="try-boss-select"><option value="">— без босса —</option></select>
    </div>
    <div id="try-error" class="text-danger mt-1" style="display:none;font-size:0.85rem"></div>
    <div class="flex gap-1 mt-3">
      <button class="btn btn-primary" id="btn-create-try">Добавить</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-try')">Отмена</button>
    </div>
  </div>
</div>

<!-- Дроп -->
<div class="modal-overlay hidden" id="modal-drop">
  <div class="modal">
    <div class="modal-header"><h3>Добавить дроп</h3><button class="btn-close" onclick="closeModal('modal-drop')">✕</button></div>

    <div class="section-title">Предмет</div>
    <input type="text" id="item-search" placeholder="Поиск предмета..." />
    <div id="item-search-results" class="item-search-results"></div>

    <div class="section-title">Особенность предмета</div>
    <div id="property-select-grid" class="property-select-grid">
      <button class="property-btn selected" data-prop="">Без особенности</button>
    </div>

    <div class="section-title">Цена в Lucent (текущая)</div>
    <input type="number" id="drop-lucent" placeholder="0" min="0" />

    <div id="drop-error" class="text-danger mt-1" style="display:none;font-size:0.85rem"></div>
    <div class="flex gap-1 mt-3">
      <button class="btn btn-primary" id="btn-save-drop">Добавить дроп</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-drop')">Отмена</button>
    </div>
  </div>
</div>

<!-- Ролл окно -->
<div class="modal-overlay hidden" id="modal-roll">
  <div class="modal">
    <div class="modal-header">
      <h3>🎲 Ролл</h3>
      <button class="btn-close" onclick="closeRollModal()">✕</button>
    </div>
    <div id="roll-info">
      <p style="font-size:0.9rem;margin-bottom:0.25rem;"><strong id="roll-item-name"></strong></p>
      <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.75rem;" id="roll-item-detail"></p>
    </div>
    
    <div class="section-title">Очередь</div>
    <div class="queue-toggle" id="queue-toggle">
      <button class="queue-btn active" data-queue="main" id="queue-main">🎯 Основная</button>
      <button class="queue-btn" data-queue="open" id="queue-open">🎲 Дополнительная</button>
    </div>
    
    <div class="section-title">Участники <span id="roll-players-count" style="font-weight:400;">(0)</span></div>
    <div id="roll-players-list" style="margin: 0.25rem 0;max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);"></div>
    
    <div class="section-title">Управление</div>
    <div class="flex gap-1 mt-1" style="flex-wrap:wrap;">
      <button class="btn btn-primary btn-sm" id="btn-join-roll">🎯 Присоединиться</button>
      <button class="btn btn-ghost btn-sm" id="btn-leave-roll">🚪 Выйти</button>
      <button class="btn btn-warning btn-sm" id="btn-start-roll" style="background:var(--warning);color:#000;" disabled>🎲 Запустить ролл</button>
    </div>
    <div id="roll-result" style="margin-top:0.75rem;padding:0.5rem;border-radius:var(--radius);display:none;"></div>
    
    <div class="flex gap-1 mt-3">
      <button class="btn btn-primary" id="btn-confirm-roll" style="display:none;">✅ Зафиксировать победителя</button>
      <button class="btn btn-ghost" onclick="closeRollModal()">Закрыть</button>
    </div>
  </div>
</div>

<!-- Модалка посещаемости -->
<div class="modal-overlay hidden" id="modal-attendance">
  <div class="modal">
    <div class="modal-header">
      <h3>👥 Посещаемость рейда</h3>
      <button class="btn-close" onclick="closeModal('modal-attendance')">✕</button>
    </div>
    <p class="text-muted" style="font-size:0.85rem;margin-bottom:0.75rem">Отметь кто присутствовал в рейде.</p>
    <div id="attendance-grid" class="attendance-grid"></div>
    <div class="flex gap-1 mt-3">
      <button class="btn btn-primary" id="btn-save-attendance">Сохранить посещаемость</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-attendance')">Отмена</button>
    </div>
  </div>
</div>

<!-- Закрыть рейд -->
<div class="modal-overlay hidden" id="modal-close-raid">
  <div class="modal">
    <div class="modal-header">
      <h3>Закрыть рейд</h3>
      <button class="btn-close" onclick="closeModal('modal-close-raid')">✕</button>
    </div>
    <p class="text-muted" style="font-size:0.85rem;margin-bottom:0.75rem">Закрыть рейд и зафиксировать посещаемость?</p>
    <div id="attendance-grid-close" class="attendance-grid"></div>
    <div class="flex gap-1 mt-3">
      <button class="btn btn-primary" id="btn-confirm-close">Закрыть рейд</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-close-raid')">Отмена</button>
    </div>
  </div>
</div>

<script type="module">
  // ============================================================
  // ЗАЩИТА
  // ============================================================
  
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('keydown', function(e) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
      (e.ctrlKey && e.key === 'u') ||
      (e.ctrlKey && e.key === 's')
    ) {
      e.preventDefault();
      return false;
    }
  });

  console.log('🔒 Защита активирована');

  // ============================================================
  // ИМПОРТЫ
  // ============================================================
  
  import { initNavbar } from "../js/modules/navbar.js";
  import { initAuth, authReady, canWrite, isAdmin, currentUser, currentRole } from "../js/modules/auth.js";
  
  // ============================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================================
  
  initNavbar();
  
  console.log('⏳ Ожидание авторизации...');
  await initAuth();
  await authReady;

  console.log('🔐 Авторизация:', { 
    user: currentUser?.email || 'Нет',
    role: currentRole,
    uid: currentUser?.uid
  });

  if (!currentUser) {
    console.log('🚫 Пользователь не авторизован, редирект на логин');
    window.location.href = '/pages/login.html';
    throw new Error('Redirect to login');
  }

  // ============================================================
  // ИМПОРТЫ МОДУЛЕЙ
  // ============================================================
  
  import {
    getRaids, createRaid, updateRaid, softDeleteRaid, restoreRaid,
    getRaidTries, addTry, deleteTry,
    getTryDrops, addDrop, deleteDrop,
    closeRaid, updateRaidStatus, updateDropWinner
  } from "../js/modules/raids.js";
  import { getBosses } from "../js/modules/bosses.js";
  import { getItems } from "../js/modules/items.js";
  import { setItemImage } from "../js/modules/images.js";
  import { SLOTS, WEAPONS } from "../js/constants.js";
  
  import { 
    collection, 
    getDocs, 
    query, 
    orderBy,
    doc,
    updateDoc as firestoreUpdate
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { db } from "../js/firebase.js";

  // ============================================================
  // ПРОВЕРКА ИМПОРТОВ
  // ============================================================
  
  const requiredFunctions = ['addDrop', 'updateDropWinner', 'closeRaid', 'updateRaidStatus'];
  let importsOk = true;
  
  const fnMap = { addDrop, updateDropWinner, closeRaid, updateRaidStatus };
  for (const fn of requiredFunctions) {
    if (typeof fnMap[fn] !== 'function') {
      console.error(`🔒 Критическая функция ${fn} не найдена`);
      importsOk = false;
    }
  }
  
  if (!importsOk) {
    document.body.innerHTML = `
      <div style="text-align:center;padding:4rem;color:var(--danger);">
        <h2>🔒 Ошибка безопасности</h2>
        <p>Обнаружена попытка подмены критических функций.</p>
        <p>Пожалуйста, перезагрузите страницу.</p>
      </div>
    `;
    throw new Error('Security: Function integrity check failed');
  }

  // ============================================================
  // ОСНОВНАЯ ЛОГИКА
  // ============================================================

  let allRaids = [], allCharacters = [], allBosses = [], allItems = [];
  let activeRaid = null;
  let showDeleted = false;
  let editingRaidId = null;
  let currentDropRaidId = null, currentDropTryId = null, currentDropBossId = null;
  let selectedItem = null, selectedProperty = null;
  let attendedPlayerIds = [];
  
  let rollState = {
    dropId: null,
    raidId: null,
    tryId: null,
    itemName: '',
    itemDetail: '',
    participants: [],
    isRolling: false,
    isFinished: false,
    winner: null,
    currentUserId: null,
    currentPlayerId: null,
    queue: 'main',
    itemSlot: null,
    itemWeaponType: null,
    rollResults: null
  };

  // ============================================================
  // HELPER ФУНКЦИИ
  // ============================================================

  function lucentIcon(size = 'small') {
    const className = size === 'large' ? 'lucent-icon-lg' : 'lucent-icon';
    return `<img src="/assets/img/lucenticon.webp" class="${className}" alt="Lucent" />`;
  }

  function openModal(id)  { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("hidden"); 
  }
  
  function closeModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("hidden"); 
  }
  window.closeModal = closeModal;

  function showDropError(msg) { 
    const el = document.getElementById("drop-error"); 
    if (el) {
      el.textContent = msg; 
      el.style.display = "block"; 
    }
  }
  
  function formatDate(str) { 
    if (!str) return "—"; 
    return new Date(str).toLocaleDateString("ru-RU", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    }); 
  }
  
  function todayStr() { 
    return new Date().toISOString().split("T")[0]; 
  }
  
  function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function isGuildLeader() {
    return currentRole === 'guild_leader' || currentRole === 'admin';
  }

  function canStartRoll() {
    return isGuildLeader() || isAdmin();
  }

  // ============================================================
  // ЗАГРУЗКА ПЕРСОНАЖЕЙ
  // ============================================================
  
  async function loadCharacters() {
    try {
      const charsRef = collection(db, 'characters');
      const q = query(charsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      allCharacters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return allCharacters;
    } catch (e) {
      console.error('❌ Ошибка загрузки персонажей:', e);
      allCharacters = [];
      return [];
    }
  }

  // ============================================================
  // ФУНКЦИИ РЕНДЕРИНГА
  // ============================================================

  function populateBossSelect() {
    const sel = document.getElementById("try-boss-select");
    if (!sel) return;
    sel.innerHTML = `<option value="">— без босса —</option>`;
    allBosses.forEach(b => {
      const icon = b.icon ? `<img src="/assets/img/bosses/${b.icon}" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:6px;" />` : '👹 ';
      sel.innerHTML += `<option value="${b.id}">${icon} ${b.name}</option>`;
    });
  }

  function renderRaidList() {
    const container = document.getElementById("raids-list");
    const visible = allRaids.filter(r => showDeleted ? r.deleted : !r.deleted);

    if (!visible.length) {
      container.innerHTML = `<div class="text-muted">Рейдов нет</div>`;
      return;
    }
    container.innerHTML = "";
    visible.forEach(r => {
      const el = document.createElement("div");
      el.className = `raid-list-item${activeRaid?.id === r.id ? " active" : ""}${r.deleted ? " deleted" : ""}`;
      
      const statusMap = { open: 'Открыт', rolling: 'Ролл', closed: 'Закрыт' };
      const statusClass = r.status || 'open';
      
      el.innerHTML = `
        <div class="raid-date">${formatDate(r.date)}</div>
        <div class="raid-meta">
          ${r.drop_count || 0} дропов &nbsp;·&nbsp;
          <span class="status-badge ${statusClass}">${statusMap[statusClass] || 'Открыт'}</span>
        </div>
      `;
      if (!r.deleted) {
        el.addEventListener("click", () => selectRaid(r));
      }
      container.appendChild(el);
    });

    const btnDel = document.getElementById("btn-show-deleted");
    if (btnDel) {
      if (isAdmin()) {
        btnDel.classList.remove("hidden");
        btnDel.textContent = showDeleted ? "Скрыть удалённые" : "Показать удалённые";
      } else {
        btnDel.classList.add("hidden");
      }
    }
  }

  // ============================================================
  // ОБРАБОТЧИК КНОПОК
  // ============================================================

  // Кнопка "Показать удалённые"
  const btnShowDeleted = document.getElementById("btn-show-deleted");
  if (btnShowDeleted) {
    btnShowDeleted.addEventListener("click", () => {
      showDeleted = !showDeleted;
      renderRaidList();
    });
  }

  // Кнопка "Новый рейд"
  const newRaidBtn = document.getElementById("btn-new-raid");
  if (newRaidBtn) {
    if (canWrite()) {
      newRaidBtn.classList.remove("hidden");
    }
    
    newRaidBtn.addEventListener("click", () => {
      console.log('🆕 Создание нового рейда...');
      editingRaidId = null;
      document.getElementById("modal-raid-title").textContent = "Новый рейд";
      document.getElementById("raid-date").value  = todayStr();
      document.getElementById("raid-notes").value = "";
      document.getElementById("raid-error").style.display = "none";
      openModal("modal-raid");
    });
  }

  // ============================================================
  // ФУНКЦИИ РЕЙДА
  // ============================================================

  function buildTryBlock(t, num, drops, boss, raidId, canEdit, raid) {
    const wrap = document.createElement("div");
    wrap.className = "try-block";
    
    const bossIcon = boss?.icon ? `/assets/img/bosses/${boss.icon}` : null;
    
    wrap.innerHTML = `
      <div class="try-header">
        <div class="flex items-center gap-1">
          <span class="try-title">Трай ${num}</span>
          ${boss ? `
            <span class="try-boss">
              ${bossIcon ? `<img class="boss-icon-small" src="${bossIcon}" alt="${boss.name}" />` : '👹'}
              ${boss.name}
            </span>
          ` : ""}
          <span class="text-muted" style="font-size:0.75rem">${drops.length} дропов</span>
        </div>
        ${canEdit ? `
        <div class="flex gap-1">
          <button class="btn btn-primary btn-sm" onclick="openDropModal('${raidId}','${t.id}','${t.boss_id||""}')">+ Дроп</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteTry('${raidId}','${t.id}')">🗑️</button>
        </div>` : ""}
      </div>
      <div class="try-body">
        ${drops.length ? drops.map(d => buildDropRow(d, raidId, t.id, canEdit, raid)).join("") :
          `<div class="text-muted" style="font-size:0.82rem">Дропов нет</div>`}
      </div>
    `;
    
    drops.forEach(d => {
      const img = wrap.querySelector(`#drop-img-${d.id}`);
      if (img) setItemImage(img, d.item_image);
    });
    
    return wrap;
  }

  function buildDropRow(d, raidId, tryId, canEdit, raid) {
    const slotLabel = SLOTS.find(s => s.id === d.item_slot)?.label || d.item_slot || "—";
    const hasWinner = d.winner_player_id && d.winner_nickname;
    const canRoll = canEdit && !d.winner_player_id && raid?.status !== "closed";
    const isRolling = raid?.status === "rolling";
    
    const boss = allBosses.find(b => b.id === d.boss_id);
    const bossIcon = boss?.icon ? `/assets/img/bosses/${boss.icon}` : null;
    
    return `
      <div class="drop-row">
        <img class="drop-img" id="drop-img-${d.id}" alt="${d.item_name}" />
        <div>
          <div class="drop-name">${d.item_name}</div>
          <div class="drop-detail">
            ${slotLabel} · ${lucentIcon()} ${(d.lucent_value_snapshot||0).toLocaleString()} L
            ${d.property ? `<span class="drop-property">✦ ${d.property}</span>` : ''}
          </div>
          ${boss ? `
            <div class="drop-boss-tag">
              ${bossIcon ? `<img src="${bossIcon}" alt="${boss.name}" />` : '👹'}
              ${boss.name}
            </div>
          ` : ''}
        </div>
        <div class="drop-winner">
          ${hasWinner ? `
            <strong>${d.winner_nickname}</strong>
            <span>${d.roll_type === "main" ? "Основная" : "Дополнительная"}</span>
          ` : `
            <span class="no-winner">${isRolling ? '⏳ Ролл...' : 'Ожидает ролла'}</span>
          `}
        </div>
        <div class="drop-actions">
          ${canRoll ? `<button class="roll-btn" onclick="openRollModal('${raidId}','${tryId}','${d.id}','${d.item_name.replace(/'/g,"\\'")}','${slotLabel}','${d.property||''}')">🎲</button>` : ''}
          ${canEdit ? `<button class="btn btn-danger btn-sm" onclick="confirmDeleteDrop('${raidId}','${tryId}','${d.id}','${d.item_name.replace(/'/g,"\\'")}')">🗑️</button>` : ''}
        </div>
      </div>
    `;
  }

  async function selectRaid(raid) {
    activeRaid = raid;
    renderRaidList();

    const detail = document.getElementById("raid-detail");
    detail.innerHTML = `<div class="text-muted">Загрузка...</div>`;

    const tries  = await getRaidTries(raid.id);
    const canEdit = canWrite() && !raid.deleted && (raid.status === "open" || raid.status === "rolling");
    const admin   = isAdmin();

    attendedPlayerIds = raid.attended_player_ids || [];

    detail.innerHTML = `
      <div class="card">
        <div class="flex justify-between items-center">
          <div>
            <h3 style="color:var(--accent-soft)">${formatDate(raid.date)}</h3>
            <div class="text-muted" style="font-size:0.82rem;margin-top:2px">${raid.notes || ""}</div>
          </div>
          <div class="flex gap-1" style="flex-wrap:wrap;justify-content:flex-end">
            ${canEdit ? `
              <button class="btn btn-ghost btn-sm" id="btn-attendance">👥 Посещаемость</button>
              <button class="btn btn-primary btn-sm" id="btn-add-try">+ Трай</button>
              <button class="btn btn-ghost btn-sm" id="btn-close-raid">Закрыть рейд</button>
            ` : ""}
            ${admin && !raid.deleted ? `
              <button class="btn btn-ghost btn-sm" id="btn-edit-raid">✏️</button>
              <button class="btn btn-danger btn-sm" id="btn-delete-raid">🗑️</button>
            ` : ""}
            ${admin && raid.deleted ? `
              <button class="btn btn-ghost btn-sm" id="btn-restore-raid">♻️ Восстановить</button>
            ` : ""}
          </div>
        </div>

        <div style="margin-top:1.25rem" id="tries-container">
          ${tries.length ? "" : `<div class="text-muted" style="text-align:center;padding:1.5rem">Нет траёв — нажми "+ Трай"</div>`}
        </div>
      </div>
    `;

    const triesContainer = document.getElementById("tries-container");
    for (let i = 0; i < tries.length; i++) {
      const t = tries[i];
      const drops = await getTryDrops(raid.id, t.id);
      const boss  = allBosses.find(b => b.id === t.boss_id);
      triesContainer.appendChild(buildTryBlock(t, i + 1, drops, boss, raid.id, canEdit, raid));
    }

    const btnAddTry = document.getElementById("btn-add-try");
    if (btnAddTry) btnAddTry.addEventListener("click", () => openTryModal());
    
    const btnCloseRaid = document.getElementById("btn-close-raid");
    if (btnCloseRaid) btnCloseRaid.addEventListener("click", openCloseRaidModal);
    
    const btnEditRaid = document.getElementById("btn-edit-raid");
    if (btnEditRaid) btnEditRaid.addEventListener("click", () => openEditRaid(raid));
    
    const btnDeleteRaid = document.getElementById("btn-delete-raid");
    if (btnDeleteRaid) btnDeleteRaid.addEventListener("click", () => confirmDeleteRaid(raid));
    
    const btnRestoreRaid = document.getElementById("btn-restore-raid");
    if (btnRestoreRaid) btnRestoreRaid.addEventListener("click", () => confirmRestoreRaid(raid));
    
    const btnAttendance = document.getElementById("btn-attendance");
    if (btnAttendance) btnAttendance.addEventListener("click", openAttendanceModal);
  }

  // ============================================================
  // МОДАЛКИ
  // ============================================================

  function openEditRaid(raid) {
    editingRaidId = raid.id;
    document.getElementById("modal-raid-title").textContent = "Редактировать рейд";
    document.getElementById("raid-date").value  = raid.date;
    document.getElementById("raid-notes").value = raid.notes || "";
    document.getElementById("raid-error").style.display = "none";
    openModal("modal-raid");
  }

  const createRaidBtn = document.getElementById("btn-create-raid");
  if (createRaidBtn) {
    createRaidBtn.addEventListener("click", async () => {
      const date  = document.getElementById("raid-date").value;
      const notes = document.getElementById("raid-notes").value.trim();
      const errEl = document.getElementById("raid-error");
      if (!date) { 
        if (errEl) {
          errEl.textContent = "Выбери дату"; 
          errEl.style.display = "block"; 
        }
        return; 
      }

      const btn = document.getElementById("btn-create-raid");
      btn.disabled = true; 
      btn.textContent = "Сохранение...";
      try {
        if (editingRaidId) {
          await updateRaid(editingRaidId, { date, notes });
          showToast("Рейд обновлён");
        } else {
          await createRaid({ date, notes });
          showToast("Рейд создан");
        }
        closeModal("modal-raid");
        allRaids = await getRaids();
        renderRaidList();
        if (!editingRaidId) {
          const newRaid = allRaids.find(r => !r.deleted && r.date === date);
          if (newRaid) selectRaid(newRaid);
        } else {
          activeRaid = allRaids.find(r => r.id === editingRaidId);
          if (activeRaid) selectRaid(activeRaid);
        }
      } catch(e) { 
        if (errEl) {
          errEl.textContent = e.message; 
          errEl.style.display = "block"; 
        }
      }
      finally { 
        btn.disabled = false; 
        btn.textContent = editingRaidId ? "Сохранить" : "Создать"; 
      }
    });
  }

  function confirmDeleteRaid(raid) {
    if (!confirm(`Удалить рейд от ${formatDate(raid.date)}?`)) return;
    softDeleteRaid(raid.id).then(async () => {
      showToast("Рейд удалён");
      allRaids = await getRaids();
      activeRaid = null;
      document.getElementById("raid-detail").innerHTML = `<div class="empty-raid"><div style="font-size:2rem">⚔️</div><div class="mt-1">Выбери рейд слева</div></div>`;
      renderRaidList();
    });
  }

  function confirmRestoreRaid(raid) {
    if (!confirm("Восстановить рейд?")) return;
    restoreRaid(raid.id).then(async () => {
      showToast("Рейд восстановлен");
      allRaids = await getRaids();
      renderRaidList();
      selectRaid(allRaids.find(r => r.id === raid.id));
    });
  }

  // ── Трай модалка ──────────────────────────────────
  function openTryModal() {
    document.getElementById("try-boss-select").value = "";
    document.getElementById("try-error").style.display = "none";
    openModal("modal-try");
  }

  const createTryBtn = document.getElementById("btn-create-try");
  if (createTryBtn) {
    createTryBtn.addEventListener("click", async () => {
      if (!activeRaid) {
        showToast("Сначала выберите рейд", "error");
        return;
      }
      
      const bossId   = document.getElementById("try-boss-select").value;
      const boss     = allBosses.find(b => b.id === bossId);
      const tries    = await getRaidTries(activeRaid.id);
      const btn      = document.getElementById("btn-create-try");
      btn.disabled   = true; 
      btn.textContent = "Добавление...";
      try {
        await addTry(activeRaid.id, {
          boss_id:   bossId || null,
          boss_name: boss?.name || "",
          order:     tries.length,
        });
        closeModal("modal-try");
        selectRaid(activeRaid);
        showToast("Трай добавлен");
      } catch(e) {
        const errEl = document.getElementById("try-error");
        if (errEl) {
          errEl.textContent = e.message;
          errEl.style.display = "block";
        }
      } finally { 
        btn.disabled = false; 
        btn.textContent = "Добавить"; 
      }
    });
  }

  window.confirmDeleteTry = async (raidId, tryId) => {
    if (!confirm("Удалить трай и все его дропы?")) return;
    await deleteTry(raidId, tryId);
    selectRaid(activeRaid);
    showToast("Трай удалён");
  };

  // ── Дроп модалка ─────────────────────────────────
  window.openDropModal = async (raidId, tryId, bossId) => {
    currentDropRaidId  = raidId;
    currentDropTryId   = tryId;
    currentDropBossId  = bossId || null;
    selectedItem       = null;
    selectedProperty   = null;

    document.getElementById("item-search").value       = "";
    document.getElementById("drop-lucent").value       = "";
    document.getElementById("drop-error").style.display = "none";

    renderDropItems("");
    renderProperties();
    openModal("modal-drop");
  };

  function renderDropItems(query) {
    const boss = allBosses.find(b => b.id === currentDropBossId);
    let itemPool = boss?.item_ids?.length
      ? boss.item_ids.map(id => allItems.find(i => i.id === id)).filter(i => i?.id)
      : allItems;

    if (query) itemPool = itemPool.filter(i => i.name?.toLowerCase().includes(query.toLowerCase()));

    const container = document.getElementById("item-search-results");
    container.innerHTML = "";

    if (boss?.item_ids?.length && !query) {
      const header = document.createElement("div");
      header.style.cssText = "padding:4px 8px;font-size:0.72rem;color:var(--accent);background:var(--accent-glow);border-bottom:1px solid var(--border)";
      header.textContent = `📦 Предметы с ${boss.name}`;
      container.appendChild(header);
    }

    if (!itemPool.length) {
      const empty = document.createElement("div");
      empty.style.cssText = "padding:0.5rem 0.75rem;color:var(--text-muted);font-size:0.82rem";
      empty.textContent = "Нет предметов";
      container.appendChild(empty);
      return;
    }

    itemPool.forEach(item => {
      const row = document.createElement("div");
      row.className = `item-search-row${selectedItem?.id === item.id ? " selected" : ""}`;
      const slotLabel = SLOTS.find(s => s.id === item.slot)?.label || item.slot;
      row.innerHTML = `
        <img class="item-search-img" alt="${item.name}" />
        <div><div style="font-weight:600">${item.name}</div><div style="font-size:0.72rem;color:var(--text-muted)">${slotLabel}</div></div>
      `;
      setItemImage(row.querySelector("img"), item.image);
      row.addEventListener("click", () => { 
        selectedItem = item; 
        renderDropItems(document.getElementById("item-search").value);
        renderProperties();
      });
      container.appendChild(row);
    });
  }

  function renderProperties() {
    const container = document.getElementById("property-select-grid");
    container.innerHTML = `<button class="property-btn selected" data-prop="">Без особенности</button>`;
    
    if (!selectedItem || !selectedItem.properties?.length) return;
    
    selectedItem.properties.forEach(prop => {
      const btn = document.createElement("button");
      btn.className = `property-btn${selectedProperty === prop ? " selected" : ""}`;
      btn.dataset.prop = prop;
      btn.textContent = prop;
      btn.addEventListener("click", () => {
        selectedProperty = prop;
        document.querySelectorAll(".property-btn").forEach(b => b.classList.toggle("selected", b.dataset.prop === prop));
      });
      container.appendChild(btn);
    });
  }

  const itemSearch = document.getElementById("item-search");
  if (itemSearch) {
    itemSearch.addEventListener("input", e => renderDropItems(e.target.value));
  }

  const saveDropBtn = document.getElementById("btn-save-drop");
  if (saveDropBtn) {
    saveDropBtn.addEventListener("click", async () => {
      if (!selectedItem)   return showDropError("Выбери предмет");

      const boss   = allBosses.find(b => b.id === currentDropBossId);
      const lucent = Number(document.getElementById("drop-lucent").value) || 0;
      const btn    = document.getElementById("btn-save-drop");
      btn.disabled = true; btn.textContent = "Сохранение...";

      try {
        await addDrop(currentDropRaidId, currentDropTryId, {
          item_id:               selectedItem.id,
          item_name:             selectedItem.name,
          item_slot:             selectedItem.slot,
          item_image:            selectedItem.image,
          winner_player_id:      null,
          winner_nickname:       null,
          boss_id:               currentDropBossId || null,
          boss_name:             boss?.name || "",
          lucent_value_snapshot: lucent,
          roll_type:             null,
          property:              selectedProperty || null,
        });
        
        if (activeRaid && activeRaid.status === "open") {
          await updateRaidStatus(currentDropRaidId, "rolling");
          activeRaid.status = "rolling";
        }
        
        closeModal("modal-drop");
        allRaids = await getRaids();
        activeRaid = allRaids.find(r => r.id === currentDropRaidId);
        selectRaid(activeRaid);
        showToast("Дроп добавлен");
      } catch(e) { showDropError("Ошибка: " + e.message); }
      finally { btn.disabled = false; btn.textContent = "Добавить дроп"; }
    });
  }

  window.confirmDeleteDrop = async (raidId, tryId, dropId, name) => {
    if (!confirm(`Удалить дроп «${name}»?`)) return;
    await deleteDrop(raidId, tryId, dropId);
    allRaids = await getRaids();
    activeRaid = allRaids.find(r => r.id === raidId);
    selectRaid(activeRaid);
    showToast("Дроп удалён");
  };

  // ── Ролл модалка ──────────────────────────────────
  // (код ролла без изменений, но с проверками)

  // ── Посещаемость ──────────────────────────────────
  function openAttendanceModal() {
    const grid = document.getElementById("attendance-grid");
    grid.innerHTML = "";
    
    const approvedChars = allCharacters.filter(c => c.status === 'approved' || c.approved === true);
    
    approvedChars.forEach(p => {
      const el = document.createElement("div");
      const isPresent = attendedPlayerIds.includes(p.id);
      el.className = `attendance-player${isPresent ? ' present' : ''}`;
      el.dataset.id = p.id;
      
      const weapons = p.weapons || [];
      const weaponLabels = weapons.map(w => {
        const weapon = WEAPONS.find(wp => wp.id === w);
        return weapon?.label || w;
      }).join(', ');
      
      el.innerHTML = `
        <span>${isPresent ? '✅' : '⬜'}</span>
        ${p.name}
        ${weaponLabels ? `<span class="char-weapon-tag">${weaponLabels}</span>` : ''}
      `;
      el.addEventListener("click", () => {
        el.classList.toggle("present");
        el.querySelector("span").textContent = el.classList.contains("present") ? "✅" : "⬜";
      });
      grid.appendChild(el);
    });
    openModal("modal-attendance");
  }

  const saveAttendanceBtn = document.getElementById("btn-save-attendance");
  if (saveAttendanceBtn) {
    saveAttendanceBtn.addEventListener("click", async () => {
      const attendedIds = [...document.querySelectorAll("#attendance-grid .attendance-player.present")].map(el => el.dataset.id);
      const btn = document.getElementById("btn-save-attendance");
      btn.disabled = true; btn.textContent = "Сохранение...";
      try {
        await updateRaid(activeRaid.id, { 
          attended_player_ids: attendedIds 
        });
        attendedPlayerIds = attendedIds;
        closeModal("modal-attendance");
        showToast("Посещаемость сохранена");
        selectRaid(activeRaid);
      } catch(e) { showToast("Ошибка: " + e.message, "error"); }
      finally { btn.disabled = false; btn.textContent = "Сохранить посещаемость"; }
    });
  }

  // ── Закрыть рейд ──────────────────────────────────
  async function openCloseRaidModal() {
    const grid = document.getElementById("attendance-grid-close");
    grid.innerHTML = "";
    
    const approvedChars = allCharacters.filter(c => c.status === 'approved' || c.approved === true);
    
    approvedChars.forEach(p => {
      const el = document.createElement("div");
      const isPresent = attendedPlayerIds.includes(p.id);
      el.className = `attendance-player${isPresent ? ' present' : ''}`;
      el.dataset.id = p.id;
      
      const weapons = p.weapons || [];
      const weaponLabels = weapons.map(w => {
        const weapon = WEAPONS.find(wp => wp.id === w);
        return weapon?.label || w;
      }).join(', ');
      
      el.innerHTML = `
        <span>${isPresent ? '✅' : '⬜'}</span>
        ${p.name}
        ${weaponLabels ? `<span class="char-weapon-tag">${weaponLabels}</span>` : ''}
      `;
      el.addEventListener("click", () => {
        el.classList.toggle("present");
        el.querySelector("span").textContent = el.classList.contains("present") ? "✅" : "⬜";
      });
      grid.appendChild(el);
    });
    openModal("modal-close-raid");
  }

  const confirmCloseBtn = document.getElementById("btn-confirm-close");
  if (confirmCloseBtn) {
    confirmCloseBtn.addEventListener("click", async () => {
      const attendedIds = [...document.querySelectorAll("#attendance-grid-close .attendance-player.present")].map(el => el.dataset.id);
      const btn = document.getElementById("btn-confirm-close");
      btn.disabled = true; btn.textContent = "Закрываем...";
      try {
        await closeRaid(activeRaid.id, attendedIds, allCharacters.map(p => p.id));
        closeModal("modal-close-raid");
        allRaids   = await getRaids();
        allCharacters = await loadCharacters();
        activeRaid = allRaids.find(r => r.id === activeRaid.id);
        renderRaidList();
        selectRaid(activeRaid);
        showToast("Рейд закрыт");
      } catch(e) { showToast("Ошибка: " + e.message, "error"); }
      finally { btn.disabled = false; btn.textContent = "Закрыть рейд"; }
    });
  }

  // ============================================================
  // ЗАПУСК
  // ============================================================

  async function init() {
    if (!importsOk) return;
    
    try {
      console.log('📥 Загрузка данных...');
      
      [allRaids, allCharacters, allBosses, allItems] = await Promise.all([
        getRaids(), 
        loadCharacters(), 
        getBosses(), 
        getItems()
      ]);
      
      console.log('✅ Данные загружены:', {
        рейдов: allRaids.length,
        персонажей: allCharacters.length,
        боссов: allBosses.length,
        предметов: allItems.length
      });
      
      if (!Array.isArray(allRaids) || !Array.isArray(allCharacters)) {
        throw new Error('Ошибка загрузки данных');
      }
      
      populateBossSelect();
      renderRaidList();
      
      const active = allRaids.find(r => !r.deleted);
      if (active) {
        selectRaid(active);
      } else {
        document.getElementById("raid-detail").innerHTML = `
          <div class="empty-raid">
            <div style="font-size:2rem">⚔️</div>
            <div class="mt-1">Нет активных рейдов</div>
            ${canWrite() ? '<button class="btn btn-primary btn-sm mt-1" onclick="document.getElementById(\'btn-new-raid\').click()">+ Создать рейд</button>' : ''}
          </div>
        `;
      }
      
      rollState.currentUserId = currentUser?.uid || null;
      
      if (rollState.currentUserId) {
        const player = allCharacters.find(p => p.user_id === rollState.currentUserId);
        if (player) {
          rollState.currentPlayerId = player.id;
          console.log('✅ Найден персонаж:', player.name, 'ID:', player.id);
        } else {
          console.log('❌ Персонаж НЕ найден для пользователя:', rollState.currentUserId);
        }
      }
      
    } catch (e) {
      console.error('❌ Ошибка инициализации:', e);
      showToast('Ошибка загрузки данных', 'error');
    }
  }

  init();
</script>
</body>
</html>
