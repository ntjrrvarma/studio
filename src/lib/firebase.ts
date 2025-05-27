
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, setLogLevel } from 'firebase/firestore';
import { getFirebaseConfigJson } from '@/config/app-config';

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;

let firebaseConfigString: string = '{}'; // Default to an empty, parsable JSON string

if (typeof window !== 'undefined') {
  // Client-side: Exclusively rely on window.__firebase_config
  const configFromWindow = (window as any).__firebase_config;

  if (configFromWindow) {
    if (typeof configFromWindow === 'string') {
      // Attempt to parse to ensure it's valid JSON and not just an empty string literal like "{}"
      try {
        const parsed = JSON.parse(configFromWindow);
        if (Object.keys(parsed).length > 0) {
          firebaseConfigString = configFromWindow;
        } else {
          console.warn("window.__firebase_config is an empty JSON object string. Firebase features will be disabled.");
        }
      } catch (e) {
        console.warn("window.__firebase_config is not a valid JSON string. Firebase features will be disabled.", e);
        // firebaseConfigString remains '{}'
      }
    } else if (typeof configFromWindow === 'object' && Object.keys(configFromWindow).length > 0) {
      firebaseConfigString = JSON.stringify(configFromWindow);
    } else {
      console.warn("window.__firebase_config is present but not a usable string or non-empty object. Firebase features will be disabled.");
      // firebaseConfigString remains '{}'
    }
  } else {
    console.warn("window.__firebase_config not found on client. Firebase features will be disabled.");
    // firebaseConfigString remains '{}'
  }
} else {
  // NOT client-side (e.g., server-side rendering, build process):
  // Attempt to use getFirebaseConfigJson which relies on process.env
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
    console.warn("Firebase config is effectively empty after attempting all sources. Firebase features will be disabled.");
  }
} catch (error) {
  console.error("Error parsing final Firebase config string or initializing Firebase:", error, "Final config string used for parsing:", firebaseConfigString);
}

export { app, auth, db };
