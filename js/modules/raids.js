// ====================================================
// raids.js — модуль для работы с рейдами
// ====================================================

import { db } from "../firebase.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  orderBy,
  where,
  serverTimestamp,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ====================================================
// ПОЛУЧЕНИЕ ВСЕХ РЕЙДОВ (ОПТИМИЗИРОВАНО)
// ====================================================

export async function getRaids() {
  try {
    const raidsRef = collection(db, "raids");
    const q = query(raidsRef, orderBy("deleted", "asc"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      drop_count: docSnap.data().drop_count || 0,
    }));
  } catch (e) {
    console.error("Ошибка получения рейдов:", e);
    return [];
  }
}

// ====================================================
// СОЗДАНИЕ РЕЙДА
// ====================================================

export async function createRaid(data) {
  try {
    const raidsRef = collection(db, "raids");
    const docRef = await addDoc(raidsRef, {
      ...data,
      status: "open",
      deleted: false,
      drop_count: 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (e) {
    console.error("Ошибка создания рейда:", e);
    throw e;
  }
}

// ====================================================
// ОБНОВЛЕНИЕ РЕЙДА
// ====================================================

export async function updateRaid(raidId, data) {
  try {
    const raidRef = doc(db, "raids", raidId);
    await updateDoc(raidRef, {
      ...data,
      updated_at: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error("Ошибка обновления рейда:", e);
    throw e;
  }
}

// ====================================================
// МЯГКОЕ УДАЛЕНИЕ РЕЙДА (ФИКС 1: помечаем loot_history)
// ====================================================

export async function softDeleteRaid(raidId) {
  try {
    const raidRef = doc(db, "raids", raidId);
    await updateDoc(raidRef, {
      deleted: true,
      deleted_at: serverTimestamp(),
    });

    // Помечаем записи истории как удалённые
    const historyRef = collection(db, "loot_history");
    const q = query(historyRef, where("raid_id", "==", raidId));
    const snap = await getDocs(q);
    
    if (snap.docs.length > 0) {
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.update(d.ref, { raid_deleted: true }));
      await batch.commit();
    }

    return true;
  } catch (e) {
    console.error("Ошибка удаления рейда:", e);
    throw e;
  }
}

// ====================================================
// ВОССТАНОВЛЕНИЕ РЕЙДА (ФИКС 2: восстанавливаем loot_history)
// ====================================================

export async function restoreRaid(raidId) {
  try {
    const raidRef = doc(db, "raids", raidId);
    await updateDoc(raidRef, {
      deleted: false,
      deleted_at: null,
    });

    // Восстанавливаем записи истории
    const historyRef = collection(db, "loot_history");
    const q = query(historyRef, where("raid_id", "==", raidId));
    const snap = await getDocs(q);
    
    if (snap.docs.length > 0) {
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.update(d.ref, { raid_deleted: false }));
      await batch.commit();
    }

    return true;
  } catch (e) {
    console.error("Ошибка восстановления рейда:", e);
    throw e;
  }
}

// ====================================================
// ПОЛНОЕ УДАЛЕНИЕ РЕЙДА (ФИКС 3: удаляем loot_history)
// ====================================================

export async function hardDeleteRaid(raidId) {
  try {
    // 1. Удаляем записи истории лута
    const historyRef = collection(db, "loot_history");
    const hq = query(historyRef, where("raid_id", "==", raidId));
    const hSnap = await getDocs(hq);
    
    if (hSnap.docs.length > 0) {
      const hBatch = writeBatch(db);
      hSnap.docs.forEach(d => hBatch.delete(d.ref));
      await hBatch.commit();
    }

    // 2. Удаляем все траи и дропы
    const triesRef = collection(db, "raids", raidId, "tries");
    const triesSnap = await getDocs(triesRef);
    
    for (const tryDoc of triesSnap.docs) {
      const dropsRef = collection(db, "raids", raidId, "tries", tryDoc.id, "drops");
      const dropsSnap = await getDocs(dropsRef);
      
      for (const dropDoc of dropsSnap.docs) {
        await deleteDoc(dropDoc.ref);
      }
      
      await deleteDoc(tryDoc.ref);
    }
    
    // 3. Удаляем сам рейд
    const raidRef = doc(db, "raids", raidId);
    await deleteDoc(raidRef);
    
    return true;
  } catch (e) {
    console.error("Ошибка полного удаления рейда:", e);
    throw e;
  }
}

// ====================================================
// ПОЛУЧЕНИЕ ТРАЕВ РЕЙДА
// ====================================================

export async function getRaidTries(raidId) {
  try {
    const triesRef = collection(db, "raids", raidId, "tries");
    const q = query(triesRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    console.error("Ошибка получения траев:", e);
    return [];
  }
}

// ====================================================
// ДОБАВЛЕНИЕ ТРАЯ
// ====================================================

export async function addTry(raidId, data) {
  try {
    const triesRef = collection(db, "raids", raidId, "tries");
    const docRef = await addDoc(triesRef, {
      ...data,
      attended_player_ids: [],
      created_at: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (e) {
    console.error("Ошибка добавления трая:", e);
    throw e;
  }
}

// ====================================================
// ОЧИСТКА СЛЕДОВ ПОБЕДЫ ПРИ УДАЛЕНИИ ДРОПА/ТРАЯ
// ====================================================
// Удаление дропа/трая раньше не трогало:
//   - won_items на карточке персонажа (слот оставался залоченным навсегда)
//   - записи в loot_history (drop продолжал считаться выигранным в этом рейде)
// Эта функция подчищает оба места ПЕРЕД тем, как сам дроп будет удалён.

async function cleanupWinnerRecords(raidId, tryId, dropId, drop) {
  if (!drop || !drop.winner_player_id) return;

  // 1. Удаляем записи в loot_history, относящиеся именно к этому дропу
  try {
    const historyRef = collection(db, "loot_history");
    const hq = query(
      historyRef,
      where("raid_id", "==", raidId),
      where("try_id", "==", tryId),
      where("drop_id", "==", dropId)
    );
    const hSnap = await getDocs(hq);
    if (hSnap.docs.length > 0) {
      const batch = writeBatch(db);
      hSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (e) {
    console.warn("Не удалось очистить loot_history для дропа:", e);
  }

  // 2. Снимаем блокировку слота у персонажа — удаляем ключ(и) won_items,
  // указывающие на этот предмет
  if (drop.item_id) {
    try {
      const charRef = doc(db, "characters", drop.winner_player_id);
      const charSnap = await getDoc(charRef);
      if (charSnap.exists()) {
        const won = charSnap.data().won_items || {};
        const keysToClear = Object.keys(won).filter(k => won[k] === drop.item_id);
        if (keysToClear.length) {
          const updates = {};
          keysToClear.forEach(k => { updates[`won_items.${k}`] = deleteField(); });
          await updateDoc(charRef, updates);
        }
      }
    } catch (e) {
      console.warn("Не удалось очистить won_items у персонажа:", e);
    }
  }
}

// ====================================================
// УДАЛЕНИЕ ТРАЯ
// ====================================================

export async function deleteTry(raidId, tryId) {
  try {
    // Удаляем все дропы трая (с подчисткой следов победы у каждого)
    const dropsRef = collection(db, "raids", raidId, "tries", tryId, "drops");
    const dropsSnap = await getDocs(dropsRef);
    
    for (const dropDoc of dropsSnap.docs) {
      await cleanupWinnerRecords(raidId, tryId, dropDoc.id, dropDoc.data());
      await deleteDoc(dropDoc.ref);
    }
    
    // Удаляем сам трай
    const tryRef = doc(db, "raids", raidId, "tries", tryId);
    await deleteDoc(tryRef);
    
    // Обновляем счетчик дропов в рейде
    await updateRaidDropCount(raidId);
    
    return true;
  } catch (e) {
    console.error("Ошибка удаления трая:", e);
    throw e;
  }
}

// ====================================================
// ПОЛУЧЕНИЕ ДРОПОВ ТРАЯ
// ====================================================

export async function getTryDrops(raidId, tryId) {
  try {
    const dropsRef = collection(db, "raids", raidId, "tries", tryId, "drops");
    const snapshot = await getDocs(dropsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    console.error("Ошибка получения дропов:", e);
    return [];
  }
}

// ====================================================
// ДОБАВЛЕНИЕ ДРОПА
// ====================================================

export async function addDrop(raidId, tryId, data) {
  try {
    const dropsRef = collection(db, "raids", raidId, "tries", tryId, "drops");
    const docRef = await addDoc(dropsRef, {
      ...data,
      participants: [],
      rolling: false,
      roll_results: null,
      pending_winner: null,
      created_at: serverTimestamp(),
    });
    
    await updateRaidDropCount(raidId);
    
    return docRef.id;
  } catch (e) {
    console.error("Ошибка добавления дропа:", e);
    throw e;
  }
}

// ====================================================
// УДАЛЕНИЕ ДРОПА (с подчисткой won_items / loot_history)
// ====================================================

export async function deleteDrop(raidId, tryId, dropId) {
  try {
    const dropRef = doc(db, "raids", raidId, "tries", tryId, "drops", dropId);

    // Подтягиваем сам дроп, чтобы знать, был ли у него победитель
    const dropSnap = await getDoc(dropRef);
    if (dropSnap.exists()) {
      await cleanupWinnerRecords(raidId, tryId, dropId, dropSnap.data());
    }

    await deleteDoc(dropRef);
    
    await updateRaidDropCount(raidId);
    
    return true;
  } catch (e) {
    console.error("Ошибка удаления дропа:", e);
    throw e;
  }
}

// ====================================================
// ОБНОВЛЕНИЕ СЧЕТЧИКА ДРОПОВ В РЕЙДЕ
// ====================================================

async function updateRaidDropCount(raidId) {
  try {
    const triesRef = collection(db, "raids", raidId, "tries");
    const triesSnap = await getDocs(triesRef);
    
    let dropCount = 0;
    for (const tryDoc of triesSnap.docs) {
      const dropsRef = collection(db, "raids", raidId, "tries", tryDoc.id, "drops");
      const dropsSnap = await getDocs(dropsRef);
      dropCount += dropsSnap.size;
    }
    
    const raidRef = doc(db, "raids", raidId);
    await updateDoc(raidRef, {
      drop_count: dropCount,
      updated_at: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Ошибка обновления счетчика дропов:", e);
  }
}

// ====================================================
// ОБНОВЛЕНИЕ СТАТУСА РЕЙДА
// ====================================================

export async function updateRaidStatus(raidId, status) {
  try {
    const raidRef = doc(db, "raids", raidId);
    await updateDoc(raidRef, {
      status: status,
      updated_at: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error("Ошибка обновления статуса рейда:", e);
    throw e;
  }
}

// ====================================================
// ОБНОВЛЕНИЕ ПОБЕДИТЕЛЯ ДРОПА
// ====================================================

export async function updateDropWinner(raidId, tryId, dropId, winnerPlayerId, winnerNickname, rollType) {
  try {
    const dropRef = doc(db, "raids", raidId, "tries", tryId, "drops", dropId);
    await updateDoc(dropRef, {
      winner_player_id: winnerPlayerId,
      winner_nickname: winnerNickname,
      roll_type: rollType,
      updated_at: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error("Ошибка обновления победителя:", e);
    throw e;
  }
}

// ====================================================
// ОБНОВЛЕНИЕ УЧАСТИЯ В ТРАЕ
// ====================================================

export async function updateTryAttendance(raidId, tryId, attendedPlayerIds) {
  try {
    const tryRef = doc(db, "raids", raidId, "tries", tryId);
    await updateDoc(tryRef, {
      attended_player_ids: attendedPlayerIds,
      updated_at: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error("Ошибка обновления участия:", e);
    throw e;
  }
}

// ====================================================
// ЗАКРЫТИЕ РЕЙДА
// ====================================================

export async function closeRaid(raidId, attendedIds, allPlayerIds) {
  try {
    const batch = writeBatch(db);
    
    // Обновляем статус рейда
    const raidRef = doc(db, "raids", raidId);
    batch.update(raidRef, {
      status: "closed",
      closed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    
    // Создаем записи в истории лута для победителей
    const tries = await getRaidTries(raidId);
    
    for (const tryData of tries) {
      const drops = await getTryDrops(raidId, tryData.id);
      
      for (const drop of drops) {
        if (drop.winner_player_id && drop.winner_nickname) {
          const historyRef = collection(db, "loot_history");
          const historyDocRef = doc(historyRef);
          
          batch.set(historyDocRef, {
            raid_id: raidId,
            try_id: tryData.id,
            drop_id: drop.id,
            player_id: drop.winner_player_id,
            player_nickname: drop.winner_nickname,
            item_id: drop.item_id,
            item_name: drop.item_name,
            item_slot: drop.item_slot,
            roll_type: drop.roll_type || "main",
            won_at: serverTimestamp(),
            raid_deleted: false,
          });
        }
      }
    }
    
    await batch.commit();
    return true;
  } catch (e) {
    console.error("Ошибка закрытия рейда:", e);
    throw e;
  }
}
