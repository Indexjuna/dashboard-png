import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");
const userName = document.getElementById("userName");
const content = document.getElementById("contentArea");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  userEmail.textContent = user.email;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const userData = snap.exists() ? snap.data() : {};
  userName.textContent = userData.username || user.email.split("@")[0];

  const isAdmin = userData.role === "admin";
  content.innerHTML = isAdmin
    ? `<h2>👑 Selamat datang, Admin!</h2><p>Anda dapat mengedit semua data staff.</p>`
    : `<h2>👋 Hai, ${userData.username || "Staff"}!</h2><p>Anda hanya dapat melihat data yang diizinkan admin.</p>`;
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "index.html";
});
