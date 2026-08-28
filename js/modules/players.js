// ====================================================
// players.js — CRUD для игроков
// ====================================================

import { db } from "../firebase.js";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const playerCol = () => collection(db, "players");

export async function getPlayers() {
  const snap = await getDocs(query(playerCol(), orderBy("nickname")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPlayer(id) {
  const snap = await getDoc(doc(db, "players", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addPlayer(data) {
  // Проверяем что user_id передан
  if (!data.user_id) {
    throw new Error('user_id обязателен для создания персонажа');
  }
  const ref = await addDoc(playerCol(), data);
  return ref.id;
}

export async function updatePlayer(id, data) {
  // При обновлении нельзя менять user_id
  delete data.user_id;
  await updateDoc(doc(db, "players", id), data);
}

export async function deletePlayer(id) {
  await deleteDoc(doc(db, "players", id));
}

// Получить персонажей конкретного пользователя
export async function getPlayersByUser(userId) {
  const snap = await getDocs(query(playerCol(), where("user_id", "==", userId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
