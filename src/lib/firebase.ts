import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Clean environment variables by removing any whitespace or newline characters
const cleanEnvVar = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  // Remove any whitespace, newlines, and quotes
  return value.trim().replace(/[\n\r"']/g, '');
};

const firebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "AIzaSyBOE1xIPeG_AEEfImnw7PtmJ02kPkpmDW0"),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, "realtime-vote-4f9c7.firebaseapp.com"),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "realtime-vote-4f9c7"),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, "realtime-vote-4f9c7.firebasestorage.app"),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, "766576329227"),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "1:766576329227:web:a445052f7e122e9cb03d0e")
};

// Log config for debugging (remove in production)
if (typeof window !== 'undefined') {
  console.log('Firebase Config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey.substring(0, 10) + '...' // Only log partial API key
  });
}

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;