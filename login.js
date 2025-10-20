// login.js — untuk halaman index.html (Login & Register)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔧 Firebase config (pakai project lama)
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

// ===================== 🔥 FORM HANDLER =====================
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// 🚪 LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login sukses:", email);
      window.location.href = "dashboard.html";
    } catch (err) {
      alert("Login gagal: " + err.message);
    }
  });
}

// 🧾 REGISTER (buat user baru di Firestore juga)
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("registerConfirmPassword").value;

    if (password !== confirm) return alert("Konfirmasi password tidak cocok!");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // cek apakah sudah ada doc user (hindari dobel)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const isAdmin = email === "admin@company.com";
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: name || user.email.split("@")[0],
          role: isAdmin ? "admin" : "staff",
          canEdit: isAdmin,
          createdAt: serverTimestamp(),
        });
      }

      alert("✅ Registrasi berhasil! Silakan login.");
      registerForm.reset();
      window.location.reload(); // balik ke form login
    } catch (err) {
      alert("Gagal daftar: " + err.message);
    }
  });
}

// ===================== 🔁 CEK LOGIN =====================
// kalau user sudah login & saat ini di index.html, arahkan ke dashboard
onAuthStateChanged(auth, (user) => {
  if (user && !window.location.href.includes("dashboard.html")) {
    console.log("🔁 Sudah login, langsung ke dashboard:", user.email);
    window.location.href = "dashboard.html";
  }
});
