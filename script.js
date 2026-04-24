// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 DEBUG: confirm correct file is running
console.log("JS LOADED");

// Firebase Config (MAKE SURE THIS IS CORRECT)
const firebaseConfig = {
  apiKey: "AIzaSyAVdShKA_7l7TqpZ5O1KbjQ0rYkdb-lZ-c",
  authDomain: "expense-management-syste-8f2b9.firebaseapp.com",
  projectId: "expense-management-syste-8f2b9",
  storageBucket: "expense-management-syste-8f2b9.firebasestorage.app",
  messagingSenderId: "791275373780",
  appId: "1:791275373780:web:5897817f108b11360a2741",
  measurementId: "G-5EBB2D40Y4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// ================= AUTH =================

// Register
async function register(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Registered successfully");
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Login
async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful");
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Logout
async function logout() {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}



// ================= EXPENSE =================

// Add Expense
async function addExpense(title, amount, date, category) {
  if (!currentUser) {
    alert("User not logged in");
    return;
  }

  try {
    await addDoc(collection(db, "expenses"), {
      userId: currentUser.uid,
      title: title,
      amount: Number(amount),
      date: date,
      category: category
    });

    alert("Expense added");
    clearForm("title", "amount", "date");
    loadExpenses();

  } catch (err) {
    console.error("Add error:", err);
    alert(err.message);
  }
}

// Load Expenses
async function loadExpenses() {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");

  if (!list || !currentUser) return;

  try {
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);

    list.innerHTML = "";
    let total = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      const li = document.createElement("li");
      li.innerHTML = `
        ${data.title} - ₹${data.amount} (${data.category}) - ${data.date}
      `;

      list.appendChild(li);
      total += data.amount;
    });

    totalEl.textContent = `₹${total}`;

  } catch (err) {
    console.error("Load error:", err);
  }
}

// ================= UTIL =================

function clearForm(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// ================= EVENTS =================

function setupEventListeners() {

  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");
  const addBtn = document.getElementById("addBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      register(
        document.getElementById("email").value,
        document.getElementById("password").value
      );
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      login(
        document.getElementById("loginEmail").value,
        document.getElementById("loginPassword").value
      );
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value;
      const amount = document.getElementById("amount").value;
      const date = document.getElementById("date").value;
      const category = document.getElementById("category").value;

      if (!title || !amount || !date || !category) {
        alert("Fill all fields");
        return;
      }

      addExpense(title, amount, date, category);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// ================= AUTH STATE =================

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  console.log("Auth state:", user);

  const dashboard = document.getElementById("dashboard");

  if (dashboard) {
    if (user) {
      dashboard.style.display = "block";
      loadExpenses();
    } else {
      window.location.href = "index.html";
    }
  }

  setupEventListeners();
});
