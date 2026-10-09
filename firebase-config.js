// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOfbi23sVHpexkESPsmTlbuxbKcRgh2wo",
  authDomain: "ayya-25562.firebaseapp.com",
  projectId: "ayya-25562",
  storageBucket: "ayya-25562.firebasestorage.app",
  messagingSenderId: "317439048144",
  appId: "1:317439048144:web:d304d450842a09bc13e1d5",
  measurementId: "G-79VQJQX5YN"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);