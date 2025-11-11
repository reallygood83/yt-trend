import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

let app: admin.app.App | undefined;

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      // eslint-disable-next-line no-console
      console.log('Firebase Admin SDK initialized');
    } catch (error) {
      console.error('Firebase Admin 초기화 실패:', error);
    }
  }
} else {
  app = admin.apps[0];
}

export const adminApp = app ?? null;
export const adminDb = adminApp ? admin.firestore(adminApp) : null;
export const getAdminTimestamp = () => admin.firestore.Timestamp.now();
