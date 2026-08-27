// ====================================================
// items.js — CRUD для предметов
// ====================================================

import { db } from "../firebase.js";
import {
  collection, doc, addDoc, updateDoc,
  deleteDoc, getDocs, getDoc, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const COL = () => collection(db, "items");

export async function getItems() {
  const snap = await getDocs(query(COL(), orderBy("name")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getItem(id) {
  const snap = await getDoc(doc(db, "items", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addItem({ name, slot, quality, description, image }) {
  const ref = await addDoc(COL(), {
    name,
    slot,
    quality:     quality || "epic",
    description: description || "",
    image:       image || null,
    created_at:  new Date().toISOString(),
  });
  return ref.id;
}

export async function updateItem(id, data) {
  await updateDoc(doc(db, "items", id), data);
}

export async function deleteItem(id) {
  await deleteDoc(doc(db, "items", id));
}
