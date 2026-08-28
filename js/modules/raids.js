// ====================================================
// raids.js — CRUD для рейдов, траёв и дропов
// ====================================================

import { db } from "../firebase.js";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, writeBatch, increment,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const raidCol = () => collection(db, "raids");
const tryCol  = (rid) => collection(db, "raids", rid, "tries");
const dropCol = (rid,tid) => collection(db, "raids", rid, "tries", tid, "drops");

// ── Рейды ─────────────────────────────────────────────
export async function getRaids() {
  try {
    const snap = await getDocs(query(raidCol(), orderBy("date", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Ошибка получения рейдов:', e);
    throw e;
  }
}

export async function getRaid(id) {
  try {
    const snap = await getDoc(doc(db, "raids", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    console.error('Ошибка получения рейда:', e);
    throw e;
  }
}

export async function createRaid({ date, notes }) {
  try {
    const ref = await addDoc(raidCol(), {
      date, notes: notes || "",
      status: "open",
      drop_count: 0,
      created_at: new Date().toISOString(),
      deleted: false,
      deleted_at: null,
      created_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
    return ref.id;
  } catch (e) {
    console.error('Ошибка создания рейда:', e);
    throw e;
  }
}

export async function updateRaid(id, data) {
  try {
    await updateDoc(doc(db, "raids", id), {
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
  } catch (e) {
    console.error('Ошибка обновления рейда:', e);
    throw e;
  }
}

export async function softDeleteRaid(id) {
  try {
    await updateDoc(doc(db, "raids", id), {
      deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
  } catch (e) {
    console.error('Ошибка удаления рейда:', e);
    throw e;
  }
}

export async function restoreRaid(id) {
  try {
    await updateDoc(doc(db, "raids", id), {
      deleted: false,
      deleted_at: null,
      restored_at: new Date().toISOString(),
      restored_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
  } catch (e) {
    console.error('Ошибка восстановления рейда:', e);
    throw e;
  }
}

export async function hardDeleteRaid(id) {
  try {
    await deleteDoc(doc(db, "raids", id));
  } catch (e) {
    console.error('Ошибка жёсткого удаления рейда:', e);
    throw e;
  }
}

// ── Траи ──────────────────────────────────────────────
export async function getRaidTries(raidId) {
  try {
    const snap = await getDocs(query(tryCol(raidId), orderBy("order")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Ошибка получения траёв:', e);
    throw e;
  }
}

export async function addTry(raidId, { boss_id, boss_name, order }) {
  try {
    const ref = await addDoc(tryCol(raidId), {
      boss_id:    boss_id || null,
      boss_name:  boss_name || "",
      order:      order || 0,
      drop_count: 0,
      created_at: new Date().toISOString(),
      created_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
    return ref.id;
  } catch (e) {
    console.error('Ошибка добавления трая:', e);
    throw e;
  }
}

export async function deleteTry(raidId, tryId) {
  try {
    await deleteDoc(doc(db, "raids", raidId, "tries", tryId));
  } catch (e) {
    console.error('Ошибка удаления трая:', e);
    throw e;
  }
}

// ── Дропы ─────────────────────────────────────────────
export async function getTryDrops(raidId, tryId) {
  try {
    const snap = await getDocs(dropCol(raidId, tryId));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Ошибка получения дропов:', e);
    throw e;
  }
}

export async function addDrop(raidId, tryId, dropData) {
  if (!dropData.item_id || !dropData.item_name) {
    throw new Error('Не указан предмет');
  }
  
  try {
    const batch = writeBatch(db);

    const dropRef = doc(dropCol(raidId, tryId));
    batch.set(dropRef, {
      ...dropData,
      winner_player_id: dropData.winner_player_id || null,
      winner_nickname: dropData.winner_nickname || null,
      roll_type: dropData.roll_type || null,
      property: dropData.property || null,
      created_at: new Date().toISOString(),
      created_by: localStorage.getItem('tl_user_id') || 'unknown',
    });

    batch.update(doc(db, "raids", raidId, "tries", tryId), {
      drop_count: increment(1),
    });
    batch.update(doc(db, "raids", raidId), {
      drop_count: increment(1),
    });

    await batch.commit();
    return dropRef.id;
  } catch (e) {
    console.error('Ошибка добавления дропа:', e);
    throw e;
  }
}

export async function updateDropWinner(raidId, tryId, dropId, winnerPlayerId, winnerNickname, rollType) {
  if (!winnerPlayerId || !winnerNickname) {
    throw new Error('Не указан победитель');
  }
  
  try {
    await updateDoc(doc(db, "raids", raidId, "tries", tryId, "drops", dropId), {
      winner_player_id: winnerPlayerId,
      winner_nickname: winnerNickname,
      roll_type: rollType || "main",
      updated_at: new Date().toISOString(),
      updated_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
  } catch (e) {
    console.error('Ошибка обновления победителя дропа:', e);
    throw e;
  }
}

export async function deleteDrop(raidId, tryId, dropId) {
  try {
    await deleteDoc(doc(db, "raids", raidId, "tries", tryId, "drops", dropId));
    await updateDoc(doc(db, "raids", raidId, "tries", tryId), { drop_count: increment(-1) });
    await updateDoc(doc(db, "raids", raidId), { drop_count: increment(-1) });
  } catch (e) {
    console.error('Ошибка удаления дропа:', e);
    throw e;
  }
}

// ── Закрыть рейд ──────────────────────────────────────
export async function closeRaid(raidId, attendedIds, allPlayerIds) {
  if (!Array.isArray(attendedIds) || !Array.isArray(allPlayerIds)) {
    throw new Error('Неверные данные для закрытия рейда');
  }
  
  try {
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
      closed_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
    await batch.commit();
  } catch (e) {
    console.error('Ошибка закрытия рейда:', e);
    throw e;
  }
}

// ── Обновить статус рейда ────────────────────────────
export async function updateRaidStatus(raidId, status) {
  const allowedStatuses = ['open', 'rolling', 'closed'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Недопустимый статус рейда');
  }
  
  try {
    await updateDoc(doc(db, "raids", raidId), { 
      status,
      updated_at: new Date().toISOString(),
      updated_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
  } catch (e) {
    console.error('Ошибка обновления статуса рейда:', e);
    throw e;
  }
}
