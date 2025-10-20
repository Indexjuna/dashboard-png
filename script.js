// ==================== 🔥 script.js — Dashboard utama ====================
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
let currentUserDoc = null;
let canEdit = false;

// ==================== 👤 Auth Listener ====================
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "index.html");

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return alert("User tidak ditemukan di database!");

    currentUserDoc = snap.data();
    canEdit = currentUserDoc.role === "admin" || currentUserDoc.canEdit === true;

    // Update UI user
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("userName").textContent =
      currentUserDoc.username || user.email.split("@")[0];

    document.getElementById(
      "userAvatar"
    ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      currentUserDoc.username || "User"
    )}&background=0366d6&color=fff`;

    // Load data
    initDashboardEvents();
    loadAllStaff();
    applyPermissionsUI();
  } catch (err) {
    console.error("Gagal ambil user:", err.message);
  }
});

// ==================== 🚪 Logout ====================
async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}
document.getElementById("logoutBtn")?.addEventListener("click", logout);

// ==================== 🧭 Navigasi ====================
function initDashboardEvents() {
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".menu-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const target = item.dataset.content;
      document
        .querySelectorAll(".content-section")
        .forEach((sec) => sec.classList.remove("active"));
      document.getElementById(`${target}-content`)?.classList.add("active");

      document.getElementById("pageTitle").textContent =
        item.querySelector("span").textContent;
    });
  });

  document
    .getElementById("menuToggle")
    ?.addEventListener("click", () =>
      document.querySelector(".sidebar").classList.toggle("collapsed")
    );
}

// ==================== 🔒 Permissions ====================
function applyPermissionsUI() {
  const editableBtns = document.querySelectorAll(".btn-edit, .btn-delete");
  editableBtns.forEach((btn) => {
    btn.style.display = canEdit ? "inline-block" : "none";
  });

  const adminSections = document.querySelectorAll(".admin-only");
  adminSections.forEach((sec) => {
    sec.style.display = canEdit ? "block" : "none";
  });
}

// ==================== 📋 Staff CRUD ====================
async function loadAllStaff() {
  try {
    const snap = await getDocs(query(collection(db, "staff")));
    const staff = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const tbody = document.getElementById("hatoribetTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    staff.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name || ""}</td>
        <td>${item.inisial || ""}</td>
        <td>${item.department || ""}</td>
        <td>${item.email || ""}</td>
        <td>
          <button class="btn btn-detail">Detail</button>
          <button class="btn btn-edit" style="display:${canEdit ? "inline" : "none"}">Edit</button>
          <button class="btn btn-delete" style="display:${canEdit ? "inline" : "none"}">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Gagal memuat data staff:", err.message);
  }
}
