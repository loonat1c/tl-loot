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
    // Удаляем все дропы в трае
    const dropsRef = dropCol(raidId, tryId);
    const dropsSnap = await getDocs(dropsRef);
    const batch = writeBatch(db);
    dropsSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();
    
    // Удаляем сам трай
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

// ── ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ВСЕХ ДРОПОВ ──
async function getAllDrops(raidId) {
  const allDrops = [];
  try {
    const triesRef = tryCol(raidId);
    const triesSnap = await getDocs(triesRef);
    
    for (const tryDoc of triesSnap.docs) {
      const dropsRef = dropCol(raidId, tryDoc.id);
      const dropsSnap = await getDocs(dropsRef);
      dropsSnap.forEach(doc => {
        allDrops.push({ id: doc.id, ...doc.data() });
      });
    }
  } catch (e) {
    console.error('❌ getAllDrops:', e);
  }
  
  return allDrops;
}

// ── Закрыть рейд (ИСПРАВЛЕННАЯ) ──────────────────────
export async function closeRaid(raidId, attendedIds, allCharacterIds) {
  if (!Array.isArray(attendedIds) || !Array.isArray(allCharacterIds)) {
    throw new Error('Неверные данные для закрытия рейда');
  }
  
  try {
    console.log('📦 Закрытие рейда:', raidId);
    console.log('👥 Присутствовали:', attendedIds);
    
    // Получаем все дропы в рейде для истории лута
    const drops = await getAllDrops(raidId);
    console.log('📊 Дропов в рейде:', drops.length);
    
    const batch = writeBatch(db);
    
    // ── 1. Сохраняем историю лута ──
    for (const drop of drops) {
      if (drop.winner_player_id && drop.winner_nickname) {
        try {
          const lootRef = doc(collection(db, 'loot_history'));
          batch.set(lootRef, {
            raid_id: raidId,
            raid_date: null, // будет обновлено позже
            player_id: drop.winner_player_id,
            player_name: drop.winner_nickname,
            item_id: drop.item_id,
            item_name: drop.item_name,
            item_slot: drop.item_slot,
            boss_id: drop.boss_id || null,
            boss_name: drop.boss_name || null,
            lucent_value: drop.lucent_value_snapshot || 0,
            roll_type: drop.roll_type || 'main',
            property: drop.property || null,
            created_at: new Date().toISOString()
          });
          console.log(`✅ История лута: ${drop.item_name} → ${drop.winner_nickname}`);
        } catch (e) {
          console.error(`❌ Ошибка сохранения истории для ${drop.item_name}:`, e);
        }
      }
    }
    
    // ── 2. Обновляем персонажей (characters) ──
    const playersWithLoot = new Set(
      drops
        .filter(d => d.winner_player_id)
        .map(d => d.winner_player_id)
    );
    
    console.log('🏆 Игроки с лутом:', [...playersWithLoot]);
    
    for (const charId of attendedIds) {
      try {
        const charRef = doc(db, "characters", charId);
        const charSnap = await getDoc(charRef);
        
        if (charSnap.exists()) {
          const charData = charSnap.data();
          const hasLoot = playersWithLoot.has(charId);
          
          const updates = {
            raids_attended: (charData.raids_attended || 0) + 1,
            last_raid_date: new Date().toISOString().split('T')[0]
          };
          
          if (hasLoot) {
            updates.loot_received = (charData.loot_received || 0) + 1;
          }
          
          batch.update(charRef, updates);
          console.log(`✅ Обновлён персонаж ${charId}: +1 рейд${hasLoot ? ', +1 лут' : ''}`);
        } else {
          console.warn(`⚠️ Персонаж ${charId} не найден`);
        }
      } catch (e) {
        console.error(`❌ Ошибка обновления персонажа ${charId}:`, e);
      }
    }
    
    // ── 3. Обновляем статус рейда ──
    const raidRef = doc(db, "raids", raidId);
    const raidSnap = await getDoc(raidRef);
    const raidData = raidSnap.exists() ? raidSnap.data() : {};
    
    batch.update(raidRef, {
      status: "closed",
      closed_at: new Date().toISOString(),
      attended_player_ids: attendedIds,
      closed_by: localStorage.getItem('tl_user_id') || 'unknown',
    });
    
    // ── 4. Обновляем дату в истории лута (если есть дропы) ──
    // Это делается отдельно, так как мы не можем обновить batch после set
    // Но историю мы уже сохранили выше с raid_date = null
    
    await batch.commit();
    console.log('✅ Рейд закрыт');
    
    // ── 5. Дополнительно обновляем raid_date в истории лута ──
    if (drops.some(d => d.winner_player_id)) {
      try {
        const historyRef = collection(db, 'loot_history');
        const q = query(historyRef, where('raid_id', '==', raidId));
        const historySnap = await getDocs(q);
        for (const doc of historySnap.docs) {
          await updateDoc(doc.ref, {
            raid_date: raidData.date || new Date().toISOString().split('T')[0]
          });
        }
      } catch (e) {
        console.warn('⚠️ Не удалось обновить raid_date в истории:', e);
      }
    }
    
    return { success: true };
    
  } catch (e) {
    console.error('❌ Ошибка закрытия рейда:', e);
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
