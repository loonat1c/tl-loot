// ====================================================
// locks.js — блокировки слотов и логика мягкого сброса
// ====================================================

import { db } from "../firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getLootRules } from "./settings.js";

// ── Получить все блокировки игрока ───────────────────
export async function getPlayerLocks(playerId) {
  const locksRef = collection(db, "players", playerId, "locks");
  const snap = await getDocs(locksRef);
  const locks = {};
  snap.forEach(d => { locks[d.id] = d.data(); });
  return locks;
}

// ── Получить одну блокировку ─────────────────────────
export async function getSlotLock(playerId, slot) {
  const ref = doc(db, "players", playerId, "locks", slot);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ── Установить блокировку при выигрыше ───────────────
export async function setSlotLock(playerId, slot, { itemId, itemName, raidId }) {
  const ref = doc(db, "players", playerId, "locks", slot);
  await setDoc(ref, {
    item_id:        itemId,
    item_name:      itemName,
    won_at_raid:    raidId,
    raids_attended: 0,   // сколько рейдов посетил после выигрыша
    raids_skipped:  0,   // сколько пропустил
    is_locked:      true,
    locked_at:      new Date().toISOString(),
  });
}

// ── Снять блокировку вручную (модератор/админ) ───────
export async function removeSlotLock(playerId, slot) {
  await deleteDoc(doc(db, "players", playerId, "locks", slot));
}

// ── Обновить счётчики после рейда ────────────────────
// Вызывается для каждого игрока при закрытии рейда.
// attended = true если игрок был в рейде, false если пропустил.
export async function updateLockCounters(playerId, attended) {
  const locks = await getPlayerLocks(playerId);
  const rules = await getLootRules();

  for (const [slot, lock] of Object.entries(locks)) {
    if (!lock.is_locked) continue;

    const newAttended = lock.raids_attended + (attended ? 1 : 0);
    const newSkipped  = lock.raids_skipped  + (attended ? 0 : 1);
    const totalRaids  = newAttended + newSkipped;

    // Превысил лимит пропусков — счётчик посещений не движется
    // (блокировка "замораживается")
    const frozen = newSkipped > rules.max_skip_raids;

    // Сброс если набрал нужное количество рейдов
    const shouldReset = !frozen && totalRaids >= rules.reset_after_raids;

    const ref = doc(db, "players", playerId, "locks", slot);

    if (shouldReset) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        ...lock,
        raids_attended: newAttended,
        raids_skipped:  newSkipped,
        is_locked:      true,
      });
    }
  }
}

// ── Проверить: заблокирован ли слот (для UI) ─────────
// Возвращает { locked: bool, lock: data|null, frozenReason: string|null }
export async function checkSlotStatus(playerId, slot) {
  const lock = await getSlotLock(playerId, slot);
  if (!lock) return { locked: false, lock: null, frozenReason: null };

  const rules = await getLootRules();
  const frozen = lock.raids_skipped > rules.max_skip_raids;
  const frozenReason = frozen
    ? `Пропустил ${lock.raids_skipped} рейдов (лимит ${rules.max_skip_raids}) — счётчик заморожен`
    : null;

  return { locked: true, lock, frozenReason };
}
