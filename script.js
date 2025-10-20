// ==================== 🔥 Integrasi Firebase Login ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyClRE2w0JeSj81gkccPC1au3hG8lQYbLzw",
  authDomain: "dashboard-png.firebaseapp.com",
  projectId: "dashboard-png",
  storageBucket: "dashboard-png.firebasestorage.app",
  messagingSenderId: "121187805643",
  appId: "1:121187805643:web:6c67dd587abbe09f782e4e",
  measurementId: "G-N5MV2N5X33"
};

// 🔹 Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 Cek status login via Firebase
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // Balik ke login kalau belum login
  } else {
    console.log("✅ Login terdeteksi:", user.email);
    const userData = {
      username: user.email.split("@")[0],
      email: user.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split("@")[0])}&background=0366d6&color=fff`
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));
    initDashboard(); // Jalankan dashboard setelah user login
  }
});

// 🔹 Fungsi logout global
async function logout() {
  await signOut(auth);
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// ==================== 🧩 DASHBOARD LOGIC ====================
function initDashboard() {
  document.addEventListener("DOMContentLoaded", function () {
    const userData = JSON.parse(localStorage.getItem("currentUser"));

    // Kalau masih belum ada data user, logout paksa
    if (!userData) {
      logout();
      return;
    }

    // Elemen DOM
    const menuItems = document.querySelectorAll(".menu-item");
    const contentSections = document.querySelectorAll(".content-section");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const pageTitle = document.getElementById("pageTitle");

    const userProfileImg = document.querySelector(".user-profile img");
    const userProfileName = document.querySelector(".user-profile span");
    const logoutBtn = document.getElementById("logoutBtn");

    if (userProfileImg && userData.avatar) {
      userProfileImg.src = userData.avatar;
    }
    if (userProfileName) {
      userProfileName.textContent = userData.username;
    }
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }

    // Event: Navigasi menu
    menuItems.forEach((item) => {
      item.addEventListener("click", function () {
        const targetContent = this.getAttribute("data-content");

        menuItems.forEach((mi) => mi.classList.remove("active"));
        this.classList.add("active");

        contentSections.forEach((section) => {
          section.classList.remove("active");
          if (section.id === `${targetContent}-content`) {
            section.classList.add("active");
          }
        });

        pageTitle.textContent = this.querySelector("span").textContent;
      });
    });

    // Event: Sidebar toggle
    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("collapsed");
      });
    }

    // Data dummy sementara
    const staffHatoribetCount = document.getElementById("staffHatoribetCount");
    const staffLivitotoCount = document.getElementById("staffLivitotoCount");
    const staffHmd29Count = document.getElementById("staffHmd29Count");
    const totalStaff = document.querySelector(".stat-number");

    if (staffHatoribetCount) staffHatoribetCount.textContent = "5";
    if (staffLivitotoCount) staffLivitotoCount.textContent = "7";
    if (staffHmd29Count) staffHmd29Count.textContent = "4";
    if (totalStaff) totalStaff.textContent = "16";

    console.log("✅ Dashboard siap digunakan");
  });
}
