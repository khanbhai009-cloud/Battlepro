import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  
  if (serviceAccount.project_id) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback for local development if needed, or throw error in production
    console.warn("FIREBASE_SERVICE_ACCOUNT not set. Firebase Admin features will fail.");
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export { admin };
