import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBl2XDjDUIceRjR4YODyXj0fwbS_CYJarE",
  authDomain: "class-nest-2ed63.firebaseapp.com",
  databaseURL: "https://class-nest-2ed63-default-rtdb.firebaseio.com",
  projectId: "class-nest-2ed63",
  storageBucket: "class-nest-2ed63.appspot.com",
  messagingSenderId: "873984758507",
  appId: "1:873984758507:web:6efded8083fe019bcfa4ae"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services and export them
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
