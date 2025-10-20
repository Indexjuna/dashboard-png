import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyClRE2w0JeSj81gkccPC1au3hG8lQYbLzw",
  authDomain: "dashboard-png.firebaseapp.com",
  projectId: "dashboard-png",
  storageBucket: "dashboard-png.appspot.com",
  messagingSenderId: "121187805643",
  appId: "1:121187805643:web:6c67dd587abbe09f782e4e",
  measurementId: "G-N5MV2N5X33"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 Cek login user
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("userName").textContent = user.email.split("@")[0];
    document.getElementById("userAvatar").src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split("@")[0])}&background=0366d6&color=fff`;

    initDashboard();
  }
});

async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}

// 🧭 Sidebar Navigation fix
function initDashboard() {
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".content-section");
  const pageTitle = document.getElementById("pageTitle");
  const sidebar = document.querySelector(".sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const target = item.dataset.content;
      sections.forEach((sec) => sec.classList.remove("active"));
      document.getElementById(`${target}-content`).classList.add("active");

      pageTitle.textContent = item.querySelector("span").textContent;
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  console.log("✅ Dashboard aktif & menu berfungsi");
}
