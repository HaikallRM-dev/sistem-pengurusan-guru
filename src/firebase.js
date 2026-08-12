// LOCAL BACKEND — ganti Firebase.
// Semua data simpan di localStorage (browser). Tak perlu server / Firebase config.
// API direka serasi dengan Firebase supaya file lain TAK perlu ubah logic.

const DB_KEY = 'eguru_db';
const USER_KEY = 'eguru_user';
const listeners = [];

function readDb() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; }
  catch { return {}; }
}
function writeDb(d) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(d)); } catch {}
}

// ---- AUTH (serasi firebase/auth) ----
export const auth = { _local: true };

export function onAuthStateChanged(_auth, cb) {
  const cur = localStorage.getItem(USER_KEY);
  if (cur) { try { cb(JSON.parse(cur)); } catch { cb(null); } }
  else cb(null);
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

function notify(user) {
  listeners.forEach((cb) => cb(user));
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  const d = readDb();
  const users = d._users || {};
  const u = users[email];
  if (!u || u.password !== password) {
    const err = new Error('Email atau kata laluan salah.');
    err.code = 'auth/wrong-password';
    throw err;
  }
  const session = { uid: u.uid, email };
  localStorage.setItem(USER_KEY, JSON.stringify(session));
  notify(session);
  return { user: session };
}

export async function createUserWithEmailAndPassword(_auth, email, password) {
  const d = readDb();
  d._users = d._users || {};
  if (d._users[email]) {
    const err = new Error('Email sudah berdaftar.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }
  const uid = 'u_' + Date.now().toString(36);
  d._users[email] = { uid, email, password };
  d.guru = d.guru || {};
  if (!d.guru[uid]) d.guru[uid] = { uid, email, peranan: 'guru' };
  writeDb(d);
  const session = { uid, email };
  localStorage.setItem(USER_KEY, JSON.stringify(session));
  notify(session);
  return { user: session };
}

export function signOut(_auth) {
  localStorage.removeItem(USER_KEY);
  notify(null);
}

// ---- FIRESTORE (serasi firebase/firestore) ----
export const db = {};

export function doc(_db, collection, id) {
  return { _c: collection, _id: id };
}

export async function getDoc(ref) {
  const d = readDb();
  const val = (d[ref._c] || {})[ref._id];
  return {
    exists() { return !!val; },
    data() { return val || {}; },
    id: ref._id,
  };
}

export async function setDoc(ref, data, opts) {
  const d = readDb();
  d[ref._c] = d[ref._c] || {};
  if (opts && opts.merge && d[ref._c][ref._id]) {
    d[ref._c][ref._id] = { ...d[ref._c][ref._id], ...data };
  } else {
    d[ref._c][ref._id] = { ...data };
  }
  writeDb(d);
}

export async function updateDoc(ref, data) {
  const d = readDb();
  d[ref._c] = d[ref._c] || {};
  d[ref._c][ref._id] = { ...(d[ref._c][ref._id] || {}), ...data };
  writeDb(d);
}

export function collection(_db, name) {
  return { _c: name };
}

export function where(field, op, val) {
  return { field, op, val };
}

export function query(colRef, ...wheres) {
  return { _c: colRef._c, _wheres: wheres };
}

export async function getDocs(qOrCol) {
  const d = readDb();
  const col = d[qOrCol._c] || {};
  let arr = Object.entries(col).map(([id, v]) => ({
    id, _id: id, ...v,
    data() { return v; },
    exists() { return !!v; },
  }));
  if (qOrCol._wheres) {
    for (const w of qOrCol._wheres) {
      arr = arr.filter((r) => r[w.field] === w.val);
    }
  }
  return {
    forEach(cb) { arr.forEach(cb); },
    docs: arr,
    empty: arr.length === 0,
    size: arr.length,
  };
}

// ---- compat untuk firebase.js lama (initializeApp dll) ----
export function initializeApp() { return {}; }
export function getFirestore() { return db; }
export function getAuth() { return auth; }
