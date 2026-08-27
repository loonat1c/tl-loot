// ====================================================
// bosses.js — CRUD для боссов
// ====================================================

import { db } from "../firebase.js";
import {
  collection, doc, addDoc, updateDoc,
  deleteDoc, getDocs, getDoc, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const COL = () => collection(db, "bosses");

export async function getBosses() {
  const snap = await getDocs(query(COL(), orderBy("name")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getBoss(id) {
  const snap = await getDoc(doc(db, "bosses", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addBoss({ name, level, boss_class, description, item_ids }) {
  const ref = await addDoc(COL(), {
    name,
    level:       level || "",
    boss_class:  boss_class || "",
    description: description || "",
    item_ids:    item_ids || [],
    created_at:  new Date().toISOString(),
  });
  return ref.id;
}

export async function updateBoss(id, data) {
  await updateDoc(doc(db, "bosses", id), data);
}

export async function deleteBoss(id) {
  await deleteDoc(doc(db, "bosses", id));
}
