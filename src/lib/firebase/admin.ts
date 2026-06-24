/**
 * Firebase Admin SDK — singleton (SERVER-ONLY).
 *
 * Used by the seed script and (later) server-side ID-token verification in the
 * Proxy / Server Actions. NEVER import this from a client component — the
 * credentials it reads are private and must never reach the browser.
 *
 * Credentials are resolved in this order:
 *   1. FIREBASE_SERVICE_ACCOUNT — the full service-account JSON as a string
 *      (best for Vercel: paste the JSON into an env var).
 *   2. ./service-account.json   — a local file in the project root
 *      (best for local dev / seeding). MUST be gitignored.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function loadServiceAccount(): ServiceAccount {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inline) {
    try {
      return JSON.parse(inline) as ServiceAccount;
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON.'
      );
    }
  }

  const path = join(process.cwd(), 'service-account.json');
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as ServiceAccount;
  } catch {
    throw new Error(
      'No Firebase Admin credentials found. Either set FIREBASE_SERVICE_ACCOUNT ' +
        '(the service-account JSON as a string) or place service-account.json in ' +
        'the project root (gitignored).'
    );
  }
}

export const adminApp: App =
  getApps().length > 0
    ? getApp()
    : initializeApp({ credential: cert(loadServiceAccount()) });

export const adminAuth: Auth = getAuth(adminApp);

export const adminDb: Firestore = getFirestore(adminApp);

// Mock data carries explicit `undefined` fields (e.g. user.photoUrl,
// table.zoneId). Firestore rejects undefined unless we opt in to ignoring it.
try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch {
  // settings() throws if Firestore was already used/configured — safe to ignore.
}
