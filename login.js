// login.js — fix redirect loop final 🔥
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔧 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyClRE2w0JeSj81gkccPC1au3hG8lQYbLzw",
  authDomain: "dashboard-png.firebaseapp.com",
  projectId: "dashboard-png",
  storageBucket: "dashboard-png.firebasestorage.app",
  messagingSenderId: "121187805643",
  appId: "1:121187805643:web:6c67dd587abbe09f782e4e",
  measurementId: "G-N5MV2N5X33",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🧾 Login form
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// 🚪 LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(res.user);
      sessionStorage.setItem("fromLogin", "true");
      window.location.href = "dashboard.html";
    } catch (err) {
      alert("❌ Login gagal: " + err.message);
    }
  });
}

// 🧾 REGISTER
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const name = document.getElementById("registerName").value.trim();

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(res.user, name);
      sessionStorage.setItem("fromLogin", "true");
      window.location.href = "dashboard.html";
    } catch (err) {
      alert("❌ Gagal daftar: " + err.message);
    }
  });
}

// 🔥 Pastikan dokumen user di Firestore
async function ensureUserDoc(user, name = null) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const isAdmin = user.email === "admin@company.com";
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      username: name || user.email.split("@")[0],
      role: isAdmin ? "admin" : "staff",
      canEdit: isAdmin,
      createdAt: serverTimestamp(),
    });
  }
}

// 🚫 FIX: Jangan auto-redirect kalau cuma refresh index.html
onAuthStateChanged(auth, (user) => {
  const currentPage = window.location.pathname.split("/").pop();

  // Kalau user di dashboard tapi belum login → balik ke login
  if (!user && currentPage === "dashboard.html") {
    window.location.href = "index.html";
  }

  // Kalau user login tapi sedang di index.html → redirect cuma kalau habis login/register
  if (user && currentPage === "index.html") {
    const fromLogin = sessionStorage.getItem("fromLogin");
    if (fromLogin === "true") {
      sessionStorage.removeItem("fromLogin");
      window.location.href = "dashboard.html";
    }
  }
});
