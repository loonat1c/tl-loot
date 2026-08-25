// ====================================================
// settings.js — чтение и запись настроек лут-правил
// ====================================================

import { db } from "../firebase.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { DEFAULT_LOOT_RULES } from "../constants.js";

const SETTINGS_REF = () => doc(db, "settings", "loot_rules");

// ── Получить настройки (с фолбэком на дефолт) ────────
export async function getLootRules() {
  try {
    const snap = await getDoc(SETTINGS_REF());
    if (snap.exists()) return snap.data();
  } catch (e) {
    console.error("getLootRules error:", e);
  }
  return { ...DEFAULT_LOOT_RULES };
}

// ── Сохранить настройки (только админ) ───────────────
export async function saveLootRules({ reset_after_raids, max_skip_raids }) {
  const data = {
    reset_after_raids: Number(reset_after_raids),
    max_skip_raids:    Number(max_skip_raids),
    updated_at:        new Date().toISOString(),
  };
  await setDoc(SETTINGS_REF(), data, { merge: true });
  return data;
}
