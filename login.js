// login.js — untuk halaman index.html
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

// 🧠 Form login/register
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toggleLogin = document.getElementById("toggleLogin");
const toggleRegister = document.getElementById("toggleRegister");

// 🔁 Ganti antara form login & register
if (toggleRegister) toggleRegister.addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});
if (toggleLogin) toggleLogin.addEventListener("click", () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

// 🚪 LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // simpan user ke koleksi "users"
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: user.email.split("@")[0],
        role: "staff",
        canEdit: false,
        createdAt: serverTimestamp(),
      });

      alert("Registrasi berhasil! Silakan login.");
      registerForm.reset();
      registerForm.style.display = "none";
      loginForm.style.display = "block";
    } catch (err) {
      alert("Gagal daftar: " + err.message);
    }
  });
}

// 🔄 Auto redirect jika user sudah login
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});
