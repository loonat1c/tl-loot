// ====================================================
// constants.js — все перечисления системы
// ====================================================

export const SLOTS = [
  { id: "weapon",    label: "Оружие" },
  { id: "helmet",    label: "Шлем" },
  { id: "cloak",     label: "Плащ" },
  { id: "chest",     label: "Нагрудник" },
  { id: "gloves",    label: "Перчатки" },
  { id: "pants",     label: "Поножи" },
  { id: "boots",     label: "Сапоги" },
  { id: "necklace",  label: "Ожерелье" },
  { id: "bracelet",  label: "Браслет" },
  { id: "ring",      label: "Кольцо" },
  { id: "belt",      label: "Пояс" },
];

export const ROLES = [
  { id: "tank",   label: "Танк" },
  { id: "dd",     label: "ДД" },
  { id: "healer", label: "Хил" },
];

export const WEAPONS = [
  { id: "bow",           label: "Лук" },
  { id: "staff",         label: "Посох" },
  { id: "wand",          label: "Жезл" },
  { id: "greatsword",    label: "Двуручный меч" },
  { id: "sword_shield",  label: "Меч и щит" },
  { id: "spear",         label: "Копьё" },
  { id: "crossbow",      label: "Арбалет" },
  { id: "daggers",       label: "Кинжалы" },
];

export const QUALITY = [
  { id: "purple", label: "Фиолетовая", color: "#9b59b6" },
  // gold оставляем на будущее
  // { id: "gold", label: "Золотая", color: "#f1c40f" },
];

export const ROLL_TYPE = [
  { id: "main", label: "Основной ролл (для билда)" },
  { id: "open", label: "Открытый ролл (продажа/трейты)" },
];

// Дефолтные настройки — применяются при первом запуске
// Потом хранятся в Firestore /settings/loot_rules
export const DEFAULT_LOOT_RULES = {
  reset_after_raids: 6,   // через сколько рейдов сбрасывается блокировка
  max_skip_raids:    2,   // сколько рейдов можно пропустить за этот период
};
