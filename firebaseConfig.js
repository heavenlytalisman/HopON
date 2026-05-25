import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDz5-IddLxqcLHmEBTsRXehS5s6hIrOW70",
  authDomain: "hopon-48671.firebaseapp.com",
  projectId: "hopon-48671",
  storageBucket: "hopon-48671.firebasestorage.app",
  messagingSenderId: "844079218774",
  appId: "1:844079218774:web:cb466c4832dd4a7725bbf7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
