// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, setLogLevel } from 'firebase/firestore';
import { getFirebaseConfigJson } from '@/config/app-config';

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;

const firebaseConfigString = getFirebaseConfigJson(); // Call this once

try {
  const parsedFirebaseConfig = JSON.parse(firebaseConfigString);
  if (Object.keys(parsedFirebaseConfig).length > 0) {
    if (!getApps().length) {
      app = initializeApp(parsedFirebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    // setLogLevel('debug'); // Uncomment for Firestore debug logging if needed
  } else {
    console.warn("Firebase config is empty or invalid. Firebase features will be disabled.");
  }
} catch (error) {
  console.error("Error parsing Firebase config or initializing Firebase:", error);
}

export { app, auth, db };
