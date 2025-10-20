// ==================== 🔥 script.js — Dashboard utama ====================
// Terhubung ke Firebase Auth + Firestore
// Pastikan dipanggil di dashboard.html dengan:
// <script type="module" src="script.js"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ==================== ⚙️ Konfigurasi Firebase ====================
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

// ==================== 🔐 State & Elemen ====================
let currentUser = null;
let currentUserDoc = null;
let isAdminOrCanEdit = false;

// UI Elements
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const pageTitle = document.getElementById('pageTitle');

const hatoribetTableBody = document.getElementById('hatoribetTableBody');
const livitotoTableBody = document.getElementById('livitotoTableBody');
const hmd29TableBody = document.getElementById('hmd29TableBody');

const staffHatoribetCount = document.getElementById('staffHatoribetCount');
const staffLivitotoCount = document.getElementById('staffLivitotoCount');
const staffHmd29Count = document.getElementById('staffHmd29Count');

const modal = document.getElementById('staffModal');
const staffForm = document.getElementById('staffForm');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const staffIdInput = document.getElementById('staffId');
const editModeInput = document.getElementById('editMode');
const activityList = document.getElementById('activityList');

// ==================== 👤 Auth Listener ====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      currentUserDoc = userSnap.data();

      // ✅ pastikan admin punya hak edit
      if (currentUserDoc.email === "admin@company.com") {
        currentUserDoc.role = "admin";
        currentUserDoc.canEdit = true;
      }

    } else {
      // buat doc baru kalau belum ada
      const defaultRole = user.email === 'admin@company.com' ? 'admin' : 'staff';
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        username: user.email.split('@')[0],
        role: defaultRole,
        canEdit: defaultRole === 'admin',
        createdAt: serverTimestamp()
      });
      currentUserDoc = { role: defaultRole, canEdit: defaultRole === 'admin' };
    }

    // ✅ baru set izin edit
    isAdminOrCanEdit =
      currentUserDoc.role === "admin" || currentUserDoc.canEdit === true;

    // update UI profile
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserDoc.username || user.email.split('@')[0])}&background=0366d6&color=fff`;
    document.querySelector('.user-profile img').src = avatar;
    document.querySelector('.user-profile span').textContent =
      currentUserDoc.username || user.email.split('@')[0];
    document.getElementById('userEmail').textContent = user.email;

    // kasih class khusus admin
    if (isAdminOrCanEdit) {
      document.body.classList.add("admin-role");
    } else {
      document.body.classList.remove("admin-role");
    }

    // Inisialisasi dashboard
    initDashboardEvents();
    await loadAllStaff();
    await loadActivities();
    applyPermissionsUI();

    console.log("✅ Login sebagai:", currentUserDoc.role, "| canEdit:", currentUserDoc.canEdit);

  } catch (err) {
    console.error("❌ Gagal ambil data user:", err.message);
  }
});

// ==================== 🚪 Logout ====================
async function logout() {
  await signOut(auth);
  window.location.href = 'index.html';
}

// ==================== 🧭 Navigasi & UI ====================
function initDashboardEvents() {
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const target = item.dataset.content;
      contentSections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(`${target}-content`)?.classList.add('active');
      pageTitle.textContent = item.querySelector('span').textContent;

      localStorage.setItem('activeMenu', target);
    });
  });

  menuToggle?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  // restore menu terakhir
  const saved = localStorage.getItem('activeMenu');
  if (saved) document.querySelector(`.menu-item[data-content="${saved}"]`)?.click();
}

// ==================== 🔒 Permissions ====================
function applyPermissionsUI() {
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdminOrCanEdit ? '' : 'none';
  });
  document.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => {
    btn.style.display = isAdminOrCanEdit ? '' : 'none';
  });
}

// ==================== 👥 Firestore: CRUD Staff ====================
async function addStaffToFirestore(data) {
  data.createdAt = serverTimestamp();
  return (await addDoc(collection(db, 'staff'), data)).id;
}

async function updateStaffInFirestore(id, data) {
  await updateDoc(doc(db, 'staff', id), { ...data, updatedAt: serverTimestamp() });
}

async function deleteStaffFromFirestore(id) {
  await deleteDoc(doc(db, 'staff', id));
}

// ==================== 📋 Load Staff ====================
async function loadAllStaff() {
  try {
    const snap = await getDocs(query(collection(db, 'staff')));
    const staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const hatoribet = staff.filter(s => s.department === 'hatoribet');
    const livitoto = staff.filter(s => s.department === 'livitoto');
    const hmd29 = staff.filter(s => s.department === 'hmd29');

    renderStaffTable(hatoribetTableBody, hatoribet);
    renderStaffTable(livitotoTableBody, livitoto);
    renderStaffTable(hmd29TableBody, hmd29);

    staffHatoribetCount.textContent = hatoribet.length;
    staffLivitotoCount.textContent = livitoto.length;
    staffHmd29Count.textContent = hmd29.length;

    const total = hatoribet.length + livitoto.length + hmd29.length;
    document.querySelector('.stat-number').textContent = total;

    applyPermissionsUI();
  } catch (err) {
    console.error('❌ Gagal load staff:', err.message);
  }
}

// ==================== 🧾 Render Tabel ====================
function renderStaffTable(tbody, list) {
  if (!tbody) return;
  tbody.innerHTML = '';
  list.forEach(item => {
    const tr = document.createElement('tr');
    const cells = [
      item.name, item.inisial, item.tanggalJoin, item.idAdmin,
      item.gmail || item.email, item.bank, item.noRekGaji,
      item.namaRekGaji, item.tanggalLahir, item.gedung,
      item.noKamar, item.masaKerja
    ];
    cells.forEach(text => {
      const td = document.createElement('td');
      td.textContent = text || '';
      tr.appendChild(td);
    });

    const aksi = document.createElement('td');
    aksi.innerHTML = `
      <button class="btn btn-detail">Detail</button>
      <button class="btn btn-edit" style="margin-left:6px;">Edit</button>
      <button class="btn btn-delete" style="margin-left:6px;">Hapus</button>
    `;

    aksi.querySelector('.btn-delete').addEventListener('click', async () => {
      if (!isAdminOrCanEdit) return alert('❌ Tidak diizinkan.');
      if (!confirm('Hapus data staff ini?')) return;
      await deleteStaffFromFirestore(item.id);
      await loadAllStaff();
      alert('✅ Data dihapus.');
    });

    tbody.appendChild(tr);
    tr.appendChild(aksi);
  });
}

// ==================== 🗓️ Activities ====================
async function loadActivities() {
  try {
    const snap = await getDocs(query(collection(db, 'activities')));
    const items = snap.docs.map(d => d.data());
    if (!activityList) return;
    activityList.innerHTML = items.slice(0, 10).map(it => `
      <div class="activity-item">
        ${it.text || JSON.stringify(it)} (${it.createdAt ? new Date(it.createdAt.seconds * 1000).toLocaleString() : ''})
      </div>
    `).join('');
  } catch {
    if (activityList) activityList.innerHTML = '<p>Tidak ada aktivitas.</p>';
  }
}
