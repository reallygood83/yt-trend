import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAGe9vGD4mzVVkCHfJwojxM6kxVRLpAZlQ",
  authDomain: "youtube-trend-explorer-2025.firebaseapp.com",
  projectId: "youtube-trend-explorer-2025",
  storageBucket: "youtube-trend-explorer-2025.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;