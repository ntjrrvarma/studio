// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, setLogLevel } from 'firebase/firestore';
import { getFirebaseConfigJson } from '@/config/app-config';

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;

let firebaseConfigString: string;

// Check for client-side environment and window.__firebase_config first
if (typeof window !== 'undefined' && (window as any).__firebase_config) {
  const configFromWindow = (window as any).__firebase_config;
  if (typeof configFromWindow === 'string' && configFromWindow.trim() !== '' && configFromWindow.trim() !== '{}') {
    try {
      // Validate if it's a parsable JSON string
      JSON.parse(configFromWindow);
      firebaseConfigString = configFromWindow;
    } catch (e) {
      console.warn("window.__firebase_config is not a valid JSON string, falling back.", e);
      firebaseConfigString = getFirebaseConfigJson(); // Fallback
    }
  } else if (typeof configFromWindow === 'object' && Object.keys(configFromWindow).length > 0) {
    firebaseConfigString = JSON.stringify(configFromWindow);
  } else {
    if (typeof configFromWindow !== 'string' && typeof configFromWindow !== 'object') {
        console.warn(`window.__firebase_config is of unexpected type (${typeof configFromWindow}), falling back.`);
    } else {
        console.warn("window.__firebase_config is empty or invalid, falling back.");
    }
    firebaseConfigString = getFirebaseConfigJson(); // Fallback
  }
} else {
  // Fallback for server-side or if window.__firebase_config is not present/applicable
  if (typeof window !== 'undefined') {
    console.warn("window.__firebase_config not found or not applicable, falling back to getFirebaseConfigJson().");
  }
  firebaseConfigString = getFirebaseConfigJson();
}

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
    console.warn("Firebase config (after attempting window.__firebase_config or fallback) is effectively empty. Firebase features will be disabled.");
  }
} catch (error) {
  console.error("Error parsing Firebase config string or initializing Firebase:", error, "Config string used:", firebaseConfigString);
}

export { app, auth, db };
