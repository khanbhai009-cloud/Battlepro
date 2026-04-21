import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  Firestore
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

let _app: FirebaseApp;
let _db: Firestore;
let _auth: Auth;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return _app;
}

function getDb(): Firestore {
  if (!_db) {
    const app = getFirebaseApp();
    try {
      _db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      _db = getFirestore(app);
    }
  }
  return _db;
}

function getAuthInstance(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

export const db = getDb();
export const auth = getAuthInstance();

export async function getFirebaseClient(): Promise<{ db: Firestore; auth: Auth }> {
  return { db: getDb(), auth: getAuthInstance() };
}
