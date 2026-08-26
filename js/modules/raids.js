// ====================================================
// raids.js — CRUD для рейдов и дропов
// ====================================================

import { db } from "../firebase.js";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { setSlotLock } from "./locks.js";
import { updateLockCounters } from "./locks.js";

const raidCol  = () => collection(db, "raids");
const dropCol  = (raidId) => collection(db, "raids", raidId, "drops");
const histCol  = () => collection(db, "loot_history");

// ── Получить все рейды ────────────────────────────────
export async function getRaids() {
  const snap = await getDocs(query(raidCol(), orderBy("date", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Получить один рейд ────────────────────────────────
export async function getRaid(id) {
  const snap = await getDoc(doc(db, "raids", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Получить дропы рейда ──────────────────────────────
export async function getRaidDrops(raidId) {
  const snap = await getDocs(dropCol(raidId));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Создать рейд ──────────────────────────────────────
export async function createRaid({ date, notes }) {
  const ref = await addDoc(raidCol(), {
    date,
    notes:      notes || "",
    status:     "open",       // open | closed
    drop_count: 0,
    created_at: new Date().toISOString(),
  });
  return ref.id;
}

// ── Обновить рейд ─────────────────────────────────────
export async function updateRaid(id, data) {
  await updateDoc(doc(db, "raids", id), data);
}

// ── Добавить дроп в рейд ─────────────────────────────
// Атомарно пишет в raids/{id}/drops + loot_history + lock
export async function addDrop(raidId, {
  item_id, item_name, item_slot, item_image,
  winner_player_id, winner_nickname,
  boss_name, lucent_value_snapshot,
  roll_type,   // "main" | "open"
}) {
  const batch = writeBatch(db);

  // 1. Дроп внутри рейда
  const dropRef = doc(dropCol(raidId));
  batch.set(dropRef, {
    item_id,
    item_name,
    item_slot,
    item_image:           item_image || null,
    winner_player_id,
    winner_nickname,
    boss_name,
    lucent_value_snapshot: lucent_value_snapshot || 0,
    roll_type,
    created_at: new Date().toISOString(),
  });

  // 2. Плоский лог
  const histRef = doc(histCol());
  batch.set(histRef, {
    raid_id: raidId,
    item_id,
    item_name,
    item_slot,
    item_image:           item_image || null,
    player_id:            winner_player_id,
    player_nickname:      winner_nickname,
    boss_name,
    lucent_value_snapshot: lucent_value_snapshot || 0,
    roll_type,
    date: new Date().toISOString(),
  });

  // 3. Счётчик дропов в рейде
  const raidRef = doc(db, "raids", raidId);
  batch.update(raidRef, {
    drop_count: (await getRaid(raidId))?.drop_count + 1 || 1,
  });

  await batch.commit();

  // 4. Блокировка слота (только main ролл)
  if (roll_type === "main") {
    await setSlotLock(winner_player_id, item_slot, {
      itemId:   item_id,
      itemName: item_name,
      raidId,
    });
  }

  return dropRef.id;
}

// ── Удалить дроп ─────────────────────────────────────
export async function deleteDrop(raidId, dropId) {
  await deleteDoc(doc(db, "raids", raidId, "drops", dropId));
}

// ── Закрыть рейд — обновить посещаемость игроков ─────
// attendedIds — массив id игроков которые были
// allPlayerIds — все id игроков в системе
export async function closeRaid(raidId, attendedIds, allPlayerIds) {
  const batch = writeBatch(db);

  // Обновляем счётчики посещаемости у каждого игрока
  for (const pid of allPlayerIds) {
    const attended = attendedIds.includes(pid);
    const pRef = doc(db, "players", pid);
    batch.update(pRef, {
      raids_total:    increment(1),
      raids_attended: attended ? increment(1) : increment(0),
    });
  }

  // Закрываем рейд
  batch.update(doc(db, "raids", raidId), {
    status:    "closed",
    closed_at: new Date().toISOString(),
    attended_player_ids: attendedIds,
  });

  await batch.commit();

  // Обновляем счётчики блокировок (вне batch — отдельные операции)
  for (const pid of allPlayerIds) {
    await updateLockCounters(pid, attendedIds.includes(pid));
  }
}

// ── Хелпер increment ─────────────────────────────────
import {
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
