// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// config same as index/dashboard
const firebaseConfig = {
  apiKey: "AIzaSyClRE2w0JeSj81gkccPC1au3hG8lQYbLzw",
  authDomain: "dashboard-png.firebaseapp.com",
  projectId: "dashboard-png",
  storageBucket: "dashboard-png.firebasestorage.app",
  messagingSenderId: "121187805643",
  appId: "1:121187805643:web:6c67dd587abbe09f782e4e",
  measurementId: "G-N5MV2N5X33"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI refs
const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');

const userEmailEl = document.getElementById('userEmail');
const userNameEl = document.getElementById('userName');
const userAvatarEl = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');

const hatoribetTable = document.querySelector('#hatoribetTable tbody');
const livitotoTable = document.querySelector('#livitotoTable tbody');
const hmd29Table = document.querySelector('#hmd29Table tbody');
const peraturanList = document.getElementById('peraturanList');
const notedList = document.getElementById('notedList');
const usersTable = document.querySelector('#usersTable tbody');

const addHatoribetBtn = document.getElementById('addHatoribetBtn');
const addLivitotoBtn = document.getElementById('addLivitotoBtn');
const addHmd29Btn = document.getElementById('addHmd29Btn');
const addPeraturanBtn = document.getElementById('addPeraturanBtn');
const addNotedBtn = document.getElementById('addNotedBtn');

// state user
let currentUserDoc = null; // will contain the user doc from 'users' collection
let isAdmin = false;
let canEdit = false;
let uid = null;

// handle sidebar navigation
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    sections.forEach(s => s.classList.remove('active'));
    const target = item.dataset.content;
    const sec = document.getElementById(`${target}-content`);
    if (sec) sec.classList.add('active');
    pageTitle.textContent = item.querySelector('span').textContent;
  });
});

if (menuToggle) menuToggle.addEventListener('click', ()=> sidebar.classList.toggle('collapsed'));

// helper: simple render row
function el(tag, txt){ const e = document.createElement(tag); if(txt) e.textContent = txt; return e; }

// --- AUTH STATE ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  uid = user.uid;
  userEmailEl.textContent = user.email;
  userNameEl.textContent = user.email.split('@')[0];
  userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=0366d6&color=fff`;

  // load user doc from 'users' by uid
  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);
  if (!userSnap.exists()) {
    // fallback: create doc if missing (default staff)
    await setDoc(userDocRef, {
      uid,
      email: user.email,
      username: user.email.split('@')[0],
      role: user.email === 'admin@company.com' ? 'admin' : 'staff',
      canEdit: user.email === 'admin@company.com',
      createdAt: serverTimestamp()
    });
    currentUserDoc = (await getDoc(userDocRef)).data();
  } else {
    currentUserDoc = userSnap.data();
  }

  isAdmin = currentUserDoc.role === 'admin';
  canEdit = !!currentUserDoc.canEdit;

  // show/hide admin-only buttons
  document.querySelectorAll('.admin-only').forEach(btn => {
    btn.style.display = (isAdmin || canEdit) ? 'inline-block' : 'none';
  });

  // load data
  await loadAllData();

  // users management view only for admin: if not admin, menu users shows message
  if (!isAdmin) {
    const usersContent = document.getElementById('users-content');
    usersContent.innerHTML = `<div style="padding:40px;text-align:center"><i class="fas fa-lock fa-3x" style="color:#e74c3c"></i><h2 style="margin-top:15px">Akses Ditolak</h2><p>Hanya admin yang dapat mengakses menu ini.</p></div>`;
  } else {
    renderUsers();
  }
});

// logout
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

// --- Load collections ---
async function loadAllData(){
  await Promise.all([loadDept('hatoribet', hatoribetTable), loadDept('livitoto', livitotoTable), loadDept('hmd29', hmd29Table), loadPeraturan(), loadNoted()]);
}

async function loadDept(collectionName, tableBody){
  tableBody.innerHTML = '<tr><td colspan="4">Memuat...</td></tr>';
  const q = query(collection(db, collectionName), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  tableBody.innerHTML = '';
  if (snap.empty) {
    tableBody.innerHTML = '<tr><td colspan="4">Belum ada data</td></tr>';
    return;
  }
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    tr.appendChild(el('td', data.nama || data.username || '—'));
    tr.appendChild(el('td', data.email || '—'));
    tr.appendChild(el('td', data.gedung || '-'));
    const aksiTd = document.createElement('td');

    // view detail (anyone)
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn';
    viewBtn.textContent = 'Lihat';
    viewBtn.addEventListener('click', ()=> alert(JSON.stringify(data,null,2)));
    aksiTd.appendChild(viewBtn);

    // edit/delete only for admin or user with canEdit
    if (isAdmin || canEdit) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-edit';
      editBtn.style.marginLeft = '6px';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', ()=> editItem(collectionName, docSnap.id, data));
      aksiTd.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-delete';
      delBtn.style.marginLeft = '6px';
      delBtn.textContent = 'Hapus';
      delBtn.addEventListener('click', ()=> removeItem(collectionName, docSnap.id));
      aksiTd.appendChild(delBtn);
    }

    tr.appendChild(aksiTd);
    tableBody.appendChild(tr);
  });
}

async function loadPeraturan(){
  peraturanList.innerHTML = 'Memuat...';
  const q = query(collection(db,'peraturan'), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  peraturanList.innerHTML = '';
  if (snap.empty) { peraturanList.innerHTML = '<li>Belum ada peraturan</li>'; return; }
  snap.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s.data().judul || '—';
    if (isAdmin || canEdit){
      const del = document.createElement('button'); del.textContent='Hapus'; del.className='btn btn-delete'; del.style.marginLeft='8px';
      del.addEventListener('click', ()=> removeItem('peraturan', s.id));
      li.appendChild(del);
    }
    peraturanList.appendChild(li);
  });
}

async function loadNoted(){
  notedList.innerHTML = 'Memuat...';
  const q = query(collection(db,'noted'), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  notedList.innerHTML = '';
  if (snap.empty) { notedList.innerHTML = '<li>Belum ada noted</li>'; return; }
  snap.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s.data().judul || '—';
    if (isAdmin || canEdit){
      const del = document.createElement('button'); del.textContent='Hapus'; del.className='btn btn-delete'; del.style.marginLeft='8px';
      del.addEventListener('click', ()=> removeItem('noted', s.id));
      li.appendChild(del);
    }
    notedList.appendChild(li);
  });
}

// --- CRUD helpers ---
async function addItem(collectionName, payload){
  await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() });
  await loadAllData();
}

async function updateItem(collectionName, id, payload){
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, payload);
  await loadAllData();
}

async function removeItem(collectionName, id){
  if (!confirm('Yakin hapus data ini?')) return;
  await deleteDoc(doc(db, collectionName, id));
  await loadAllData();
}

// --- quick UI actions (prompts) ---
if (addHatoribetBtn) addHatoribetBtn.addEventListener('click', async ()=>{
  const nama = prompt('Nama staff Hatoribet'); if (!nama) return;
  const email = prompt('Email staff'); if (!email) return;
  const gedung = prompt('Gedung (opsional)') || '';
  await addItem('hatoribet', { nama, email, gedung });
  alert('Staff ditambahkan');
});

if (addLivitotoBtn) addLivitotoBtn.addEventListener('click', async ()=>{
  const nama = prompt('Nama staff Livitoto'); if (!nama) return;
  const email = prompt('Email staff'); if (!email) return;
  const gedung = prompt('Gedung (opsional)') || '';
  await addItem('livitoto', { nama, email, gedung });
  alert('Staff ditambahkan');
});

if (addHmd29Btn) addHmd29Btn.addEventListener('click', async ()=>{
  const nama = prompt('Nama staff Hmd29'); if (!nama) return;
  const email = prompt('Email staff'); if (!email) return;
  const gedung = prompt('Gedung (opsional)') || '';
  await addItem('hmd29', { nama, email, gedung });
  alert('Staff ditambahkan');
});

if (addPeraturanBtn) addPeraturanBtn.addEventListener('click', async ()=>{
  const judul = prompt('Judul Peraturan'); if (!judul) return;
  await addItem('peraturan', { judul });
  alert('Peraturan ditambahkan');
});

if (addNotedBtn) addNotedBtn.addEventListener('click', async ()=>{
  const judul = prompt('Judul Noted'); if (!judul) return;
  await addItem('noted', { judul });
  alert('Noted ditambahkan');
});

// edit item prompt
function editItem(collectionName, id, data){
  if (!data) data = {};
  if (collectionName === 'peraturan' || collectionName === 'noted'){
    const newJudul = prompt('Edit judul', data.judul || '');
    if (!newJudul) return;
    updateItem(collectionName, id, { judul: newJudul });
    return;
  }
  // for staff collections
  const nama = prompt('Nama', data.nama || data.username || '');
  if (nama === null) return;
  const email = prompt('Email', data.email || '') || '';
  const gedung = prompt('Gedung', data.gedung || '') || '';
  updateItem(collectionName, id, { nama, email, gedung });
}

// --- Users management (admin) ---
async function renderUsers(){
  usersTable.innerHTML = 'Memuat...';
  const q = query(collection(db,'users'), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  usersTable.innerHTML = '';
  if (snap.empty) { usersTable.innerHTML = '<tr><td colspan="5">Belum ada user</td></tr>'; return; }
  snap.forEach(s => {
    const d = s.data();
    const tr = document.createElement('tr');
    tr.appendChild(el('td', d.email || ''));
    tr.appendChild(el('td', d.username || ''));
    tr.appendChild(el('td', d.role || 'staff'));
    tr.appendChild(el('td', (d.canEdit ? 'Yes' : 'No')));
    const aksiTd = document.createElement('td');

    // toggle canEdit
    const toggle = document.createElement('button');
    toggle.className = 'btn';
    toggle.textContent = d.canEdit ? 'Revoke Edit' : 'Allow Edit';
    toggle.addEventListener('click', async ()=>{
      await updateDoc(doc(db,'users', s.id), { canEdit: !d.canEdit });
      alert('Perubahan disimpan');
      renderUsers();
      loadAllData();
    });
    aksiTd.appendChild(toggle);

    // set role
    const setAdminBtn = document.createElement('button');
    setAdminBtn.className = 'btn';
    setAdminBtn.style.marginLeft = '6px';
    setAdminBtn.textContent = d.role === 'admin' ? 'Revoke Admin' : 'Set Admin';
    setAdminBtn.addEventListener('click', async ()=>{
      const newRole = d.role === 'admin' ? 'staff' : 'admin';
      await updateDoc(doc(db,'users', s.id), { role: newRole, canEdit: newRole==='admin' ? true : d.canEdit });
      alert('Role diperbarui');
      renderUsers();
      loadAllData();
    });
    aksiTd.appendChild(setAdminBtn);

    tr.appendChild(aksiTd);
    usersTable.appendChild(tr);
  });
}

// small helper used in renderUsers
function el(tag, txt){ const e = document.createElement(tag); if(txt !== undefined) e.textContent = txt; return e; }

