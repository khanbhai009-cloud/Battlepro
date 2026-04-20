import * as admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

export function getAdminApp() {
  if (!adminApp) {
    if (admin.apps.length > 0) {
      adminApp = admin.apps[0];
    } else {
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!serviceAccountStr) {
        console.warn("FIREBASE_SERVICE_ACCOUNT not set. Firebase Admin features will fail.");
        return null;
      }
      try {
        const serviceAccount = JSON.parse(serviceAccountStr);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (e) {
        console.error("Firebase Admin Init Error:", e);
        return null;
      }
    }
  }
  return adminApp;
}

export function getAdminDb(): admin.firestore.Firestore {
  const app = getAdminApp();
  if (!app) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not set. Check your environment variables.");
  }
  return admin.firestore(app);
}

export function getAdminAuth(): admin.auth.Auth {
  const app = getAdminApp();
  if (!app) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not set. Check your environment variables.");
  }
  return admin.auth(app);
}

export { admin };
