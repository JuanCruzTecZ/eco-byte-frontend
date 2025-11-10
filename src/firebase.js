
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8v6ix3WE34J59hqPoXaEvwSyks3GEQ9s",
  authDomain: "ecobyte-v2.firebaseapp.com",
  projectId: "ecobyte-v2",
  storageBucket: "ecobyte-v2.firebasestorage.app",
  messagingSenderId: "712033866883",
  appId: "1:712033866883:web:65d2096e71fc09cd4a77b6",
  measurementId: "G-M5CRR9R4M5"
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que usaremos en la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
