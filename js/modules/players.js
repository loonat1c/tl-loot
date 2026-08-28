// ====================================================
// players.js — CRUD для игроков (персонажей)
// ====================================================

import { db } from "../firebase.js";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const playerCol = () => collection(db, "players");

export async function getPlayers() {
  try {
    const snap = await getDocs(query(playerCol(), orderBy("nickname")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Ошибка получения игроков:', e);
    return [];
  }
}

export async function getPlayer(id) {
  try {
    const snap = await getDoc(doc(db, "players", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    console.error('Ошибка получения игрока:', e);
    return null;
  }
}

export async function getPlayersByUser(userId) {
  try {
    const snap = await getDocs(query(playerCol(), where("user_id", "==", userId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Ошибка получения игроков по пользователю:', e);
    return [];
  }
}

export async function addPlayer(data) {
  if (!data.user_id) {
    throw new Error('user_id обязателен для создания персонажа');
  }
  try {
    const ref = await addDoc(playerCol(), data);
    return ref.id;
  } catch (e) {
    console.error('Ошибка добавления игрока:', e);
    throw e;
  }
}

export async function updatePlayer(id, data) {
  // При обновлении нельзя менять user_id
  delete data.user_id;
  try {
    await updateDoc(doc(db, "players", id), data);
  } catch (e) {
    console.error('Ошибка обновления игрока:', e);
    throw e;
  }
}

export async function deletePlayer(id) {
  try {
    await deleteDoc(doc(db, "players", id));
  } catch (e) {
    console.error('Ошибка удаления игрока:', e);
    throw e;
  }
}

// Обновить желаемый лут игрока
export async function updatePlayerWishlist(playerId, wishlist) {
  try {
    await updateDoc(doc(db, "players", playerId), {
      wishlist: wishlist,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Ошибка обновления желаемого лута:', e);
    throw e;
  }
}
