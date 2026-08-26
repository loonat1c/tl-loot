// ====================================================
// items.js — CRUD для шмоток
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
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const COL = () => collection(db, "items");

// ── Получить все шмотки ───────────────────────────────
export async function getItems() {
  const snap = await getDocs(query(COL(), orderBy("name")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Получить одну шмотку ──────────────────────────────
export async function getItem(id) {
  const snap = await getDoc(doc(db, "items", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Добавить шмотку ───────────────────────────────────
export async function addItem({ name, slot, quality, boss_name, description, image, lucent_value }) {
  const ref = await addDoc(COL(), {
    name,
    slot,
    quality,
    boss_name,
    description:   description || "",
    image:         image || null,
    lucent_value:  lucent_value || 0,
    created_at:    new Date().toISOString(),
  });
  return ref.id;
}

// ── Обновить шмотку ───────────────────────────────────
export async function updateItem(id, data) {
  await updateDoc(doc(db, "items", id), data);
}

// ── Удалить шмотку ────────────────────────────────────
export async function deleteItem(id) {
  await deleteDoc(doc(db, "items", id));
}

// ── Обновить стоимость в люцентах ────────────────────
export async function updateLucentValue(id, value) {
  await updateDoc(doc(db, "items", id), {
    lucent_value: Number(value),
    lucent_updated_at: new Date().toISOString(),
  });
}
