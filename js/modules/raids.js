// ====================================================
// raids.js — CRUD для рейдов, траёв и дропов
// ====================================================

import { db } from "../firebase.js";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, writeBatch, increment,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { setSlotLock } from "./locks.js";
import { updateLockCounters } from "./locks.js";

const raidCol = ()       => collection(db, "raids");
const tryCol  = (rid)    => collection(db, "raids", rid, "tries");
const dropCol = (rid,tid)=> collection(db, "raids", rid, "tries", tid, "drops");
const histCol = ()       => collection(db, "loot_history");

// ── Рейды ─────────────────────────────────────────────
export async function getRaids() {
  const snap = await getDocs(query(raidCol(), orderBy("date", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getRaid(id) {
  const snap = await getDoc(doc(db, "raids", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createRaid({ date, notes }) {
  const ref = await addDoc(raidCol(), {
    date, notes: notes || "",
    status: "open",
    drop_count: 0,
    created_at: new Date().toISOString(),
    deleted: false,
  });
  return ref.id;
}

export async function updateRaid(id, data) {
  await updateDoc(doc(db, "raids", id), data);
}

// Мягкое удаление
export async function softDeleteRaid(id) {
  await updateDoc(doc(db, "raids", id), {
    deleted: true,
    deleted_at: new Date().toISOString(),
  });
}

// Восстановление (в течение 30 дней)
export async function restoreRaid(id) {
  await updateDoc(doc(db, "raids", id), {
    deleted: false,
    deleted_at: null,
  });
}

// Жёсткое удаление
export async function hardDeleteRaid(id) {
  await deleteDoc(doc(db, "raids", id));
}

// ── Траи ──────────────────────────────────────────────
export async function getRaidTries(raidId) {
  const snap = await getDocs(query(tryCol(raidId), orderBy("order")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addTry(raidId, { boss_id, boss_name, order }) {
  const ref = await addDoc(tryCol(raidId), {
    boss_id:    boss_id || null,
    boss_name:  boss_name || "",
    order:      order || 0,
    drop_count: 0,
    created_at: new Date().toISOString(),
  });
  return ref.id;
}

export async function deleteTry(raidId, tryId) {
  await deleteDoc(doc(db, "raids", raidId, "tries", tryId));
}

// ── Дропы ─────────────────────────────────────────────
export async function getTryDrops(raidId, tryId) {
  const snap = await getDocs(dropCol(raidId, tryId));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addDrop(raidId, tryId, {
  item_id, item_name, item_slot, item_image,
  winner_player_id, winner_nickname,
  boss_id, boss_name,
  lucent_value_snapshot,
  roll_type,
}) {
  const batch = writeBatch(db);

  const dropRef = doc(dropCol(raidId, tryId));
  batch.set(dropRef, {
    item_id, item_name, item_slot,
    item_image: item_image || null,
    winner_player_id, winner_nickname,
    boss_id: boss_id || null,
    boss_name: boss_name || "",
    lucent_value_snapshot: lucent_value_snapshot || 0,
    roll_type,
    created_at: new Date().toISOString(),
  });

  const histRef = doc(histCol());
  batch.set(histRef, {
    raid_id: raidId,
    try_id:  tryId,
    item_id, item_name, item_slot,
    item_image: item_image || null,
    player_id:       winner_player_id,
    player_nickname: winner_nickname,
    boss_id: boss_id || null,
    boss_name: boss_name || "",
    lucent_value_snapshot: lucent_value_snapshot || 0,
    roll_type,
    date: new Date().toISOString(),
  });

  // Счётчик дропов в трае и рейде
  batch.update(doc(db, "raids", raidId, "tries", tryId), {
    drop_count: increment(1),
  });
  batch.update(doc(db, "raids", raidId), {
    drop_count: increment(1),
  });

  await batch.commit();

  if (roll_type === "main") {
    await setSlotLock(winner_player_id, item_slot, {
      itemId: item_id, itemName: item_name, raidId,
    });
  }

  return dropRef.id;
}

export async function deleteDrop(raidId, tryId, dropId) {
  await deleteDoc(doc(db, "raids", raidId, "tries", tryId, "drops", dropId));
  // Уменьшаем счётчики
  await updateDoc(doc(db, "raids", raidId, "tries", tryId), { drop_count: increment(-1) });
  await updateDoc(doc(db, "raids", raidId), { drop_count: increment(-1) });
}

// ── Закрыть рейд ──────────────────────────────────────
export async function closeRaid(raidId, attendedIds, allPlayerIds) {
  const batch = writeBatch(db);
  for (const pid of allPlayerIds) {
    const attended = attendedIds.includes(pid);
    batch.update(doc(db, "players", pid), {
      raids_total:    increment(1),
      raids_attended: increment(attended ? 1 : 0),
    });
  }
  batch.update(doc(db, "raids", raidId), {
    status: "closed",
    closed_at: new Date().toISOString(),
    attended_player_ids: attendedIds,
  });
  await batch.commit();

  for (const pid of allPlayerIds) {
    await updateLockCounters(pid, attendedIds.includes(pid));
  }
}
