import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOwiC-UjjYXDZ3rymcSh0gN3bhsfmUiZo",
  authDomain: "battlefire-arena.firebaseapp.com",
  databaseURL: "https://battlefire-arena-default-rtdb.firebaseio.com",
  projectId: "battlefire-arena",
  storageBucket: "battlefire-arena.firebasestorage.app",
  messagingSenderId: "571922400958",
  appId: "1:571922400958:web:662de92861b7680251c0ef"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with Persistent Local Cache for Zero-Cost Scaling
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
