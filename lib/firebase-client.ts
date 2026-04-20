import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvNrJ0ZqlR2QBhfRBcv2wPISaZjzNwUsg",
  authDomain: "tournament-app-41636.firebaseapp.com",
  databaseURL: "https://tournament-app-41636-default-rtdb.firebaseio.com",
  projectId: "tournament-app-41636",
  storageBucket: "tournament-app-41636.firebasestorage.app",
  messagingSenderId: "262504693288",
  appId: "1:262504693288:web:70883aa0ee6a3d13887f1d"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with Persistent Local Cache for Zero-Cost Scaling
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
