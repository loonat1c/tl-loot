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

export const RANKS = [
  { id: "guildmaster", label: "Глава гильдии" },
  { id: "advisor",     label: "Советник" },
  { id: "guardian",    label: "Хранитель" },
  { id: "member",      label: "Рядовой" },
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
  { id: "epic",    label: "🟣 Эпическое", color: "#9b59b6" },
  { id: "epic_ii", label: "🟣 Эпическое II", color: "#8e44ad" },
];

// ====================================================
// КЛАССЫ БОССОВ (ОБНОВЛЕНО)
// ====================================================

export const BOSS_CLASSES = [
  { id: "beast",     label: "🐾 Зверь" },
  { id: "undead",    label: "💀 Нежить" },
  { id: "humanoid",  label: "🧑 Гуманоид" },
  { id: "mechanism", label: "⚙️ Механизм" },
  { id: "demon",     label: "👿 Демон" },
];

export const ROLL_TYPE = [
  { id: "main", label: "Основной ролл (для билда)" },
  { id: "open", label: "Открытый ролл (продажа/трейты)" },
];

export const DEFAULT_LOOT_RULES = {
  reset_after_raids: 6,
  max_skip_raids:    2,
};
