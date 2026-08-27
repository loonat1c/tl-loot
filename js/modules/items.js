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

export async function addItem({ 
  name, 
  slot, 
  quality, 
  description, 
  image,
  boss_id,
  boss_name,
  weapon_type = null,
  level = null,
  damage_min = null,
  damage_max = null,
  stats = [],
  effect = {},
  set_bonus = {},
  properties = []
}) {
  const ref = await addDoc(COL(), {
    name,
    slot,
    quality:     quality || "epic",
    description: description || "",
    image:       image || null,
    boss_id:     boss_id || null,
    boss_name:   boss_name || "",
    weapon_type: weapon_type || null,
    level:       level || null,
    damage_min:  damage_min || null,
    damage_max:  damage_max || null,
    stats:       stats || [],
    effect:      effect || {},
    set_bonus:   set_bonus || {},
    properties:  properties || [],
    created_at:  new Date().toISOString(),
  });
  return ref.id;
}

export async function updateItem(id, data) {
  const cleanData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }
  await updateDoc(doc(db, "items", id), cleanData);
}

export async function deleteItem(id) {
  await deleteDoc(doc(db, "items", id));
}
