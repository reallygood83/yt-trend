import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Clean environment variables by removing any whitespace or newline characters
const cleanEnvVar = (value: string | undefined): string => {
  if (!value) return "";
  // Remove any whitespace, newlines, and quotes
  return value.trim().replace(/[\n\r"']/g, '');
};

const firebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

// Log config for debugging (remove in production)
if (typeof window !== 'undefined') {
  console.log('Firebase Config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'NOT SET' // Only log partial API key
  });
}

// Check if Firebase config is valid
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

// Initialize Firebase only if not already initialized and config is valid
const app = hasValidConfig
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : null;

// Initialize Firebase Authentication and get a reference to the service (null if no valid config)
export const auth = app ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);

// Initialize Firestore (null if no valid config)
export const db = app ? getFirestore(app) : (null as unknown as ReturnType<typeof getFirestore>);

export default app;