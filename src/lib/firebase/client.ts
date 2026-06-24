/**
 * Firebase client SDK — singleton initialization.
 *
 * Reads configuration from NEXT_PUBLIC_FIREBASE_* env vars. These are NOT
 * secrets: Firebase exposes them to the browser by design. Real security is
 * enforced by Firestore Security Rules, not by hiding this config.
 *
 * The app is initialized once and reused (getApps() guard) so Next.js HMR and
 * multiple imports never trigger a "Firebase App named '[DEFAULT]' already
 * exists" error.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ─── Config ─────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

// Fail fast in development if the essential config is missing — a missing
// projectId/apiKey produces cryptic runtime errors deep inside the SDK.
if (process.env.NODE_ENV !== 'production') {
  const missing = (['apiKey', 'authDomain', 'projectId', 'appId'] as const).filter(
    (key) => !firebaseConfig[key]
  );
  if (missing.length > 0) {
    console.warn(
      `[firebase] Missing required NEXT_PUBLIC_FIREBASE_* env vars: ${missing
        .map((k) => k.toUpperCase())
        .join(', ')}. Check your .env.local.`
    );
  }
}

// ─── Singletons ───────────────────────────────────────────────────────────────

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);
export const firebaseDb: Firestore = getFirestore(firebaseApp);
