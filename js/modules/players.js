// ====================================================
// players.js — CRUD для игроков
// ====================================================

import { db } from "../firebase.js";
import {
  collection, doc, addDoc, updateDoc,
  deleteDoc, getDocs, getDoc, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const COL = () => collection(db, "players");

export async function getPlayers() {
  const snap = await getDocs(query(COL(), orderBy("nickname")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPlayer(id) {
  const snap = await getDoc(doc(db, "players", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addPlayer({ nickname, name, role, rank, weapon_pair }) {
  const ref = await addDoc(COL(), {
    nickname, name,
    role, rank: rank || "member",
    weapon_pair,
    created_at:     new Date().toISOString(),
    raids_attended: 0,
    raids_total:    0,
  });
  return ref.id;
}

export async function updatePlayer(id, data) {
  await updateDoc(doc(db, "players", id), data);
}

export async function deletePlayer(id) {
  await deleteDoc(doc(db, "players", id));
}

export function getAttendancePct(player) {
  if (!player.raids_total) return 0;
  return Math.round((player.raids_attended / player.raids_total) * 100);
}
