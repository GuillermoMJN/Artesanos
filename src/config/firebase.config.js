import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Configuración de credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCUGHYFtVmXweGGK7tNfUIhmE_hFr4J_QA",
  authDomain: "artesanos-2a706.firebaseapp.com",
  projectId: "artesanos-2a706",
  storageBucket: "artesanos-2a706.firebasestorage.app",
  messagingSenderId: "514399575895",
  appId: "1:514399575895:web:7f59c0d5b23005b4a7e812",
  measurementId: "G-RXEYMVJBC0"
};

// Inicialización de servicios
let app = null;
let db = null;
let auth = null;
let storage = null;

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export {
  app,
  db,
  auth,
  storage,
  // Firestore exports
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  // Auth exports
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  // Storage exports
  ref,
  uploadBytes,
  getDownloadURL
};
