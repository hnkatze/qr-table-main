'use server';

/**
 * Authentication Server Actions — the real (Firebase) replacement for the mock
 * session helpers.
 *
 * The whole sign-in happens server-side:
 *   1. Resolve username → email via Firestore (Admin SDK) — the users collection
 *      is never exposed to the client.
 *   2. Verify the password through Firebase's Identity Toolkit REST endpoint
 *      (Admin SDK cannot verify passwords; the client SDK is not involved so the
 *      password never travels through client auth state).
 *   3. Mint a verified Firebase SESSION COOKIE and store it httpOnly.
 *
 * The profile (user + memberships) is read from Firestore by getCurrentUser(),
 * which the AuthProvider calls on mount.
 */

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { SESSION_COOKIE } from './session-constants';
import type { User } from '@/types/user';
import type { Restaurant } from '@/types/restaurant';
import type { Membership, RestaurantMembership } from '@/types/membership';

// Session cookie lifetime — 8 hours (Firebase allows up to 14 days).
const SESSION_EXPIRES_IN_MS = 60 * 60 * 8 * 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

type SignInResult = { ok: true } | { ok: false; error: string };

export type CurrentUserResult = {
  user: User;
  memberships: RestaurantMembership[];
};

// ─── Helpers (server-only, not exported as actions) ─────────────────────────────

/** Look up a user's email by their unique username. Null if not found. */
async function resolveUsernameToEmail(username: string): Promise<string | null> {
  const snap = await adminDb
    .collection('users')
    .where('username', '==', username)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const email = snap.docs[0]?.get('email');
  return typeof email === 'string' ? email : null;
}

/**
 * Verify email + password against Firebase Identity Toolkit. Returns the ID
 * token on success, or null on bad credentials.
 */
async function verifyPassword(
  email: string,
  password: string
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not set.');

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  if (!res.ok) return null;
  const data: { idToken?: string } = await res.json();
  return data.idToken ?? null;
}

/** Read every restaurant referenced by a set of memberships, enriched. */
async function enrichMemberships(
  memberships: Membership[]
): Promise<RestaurantMembership[]> {
  const enriched: RestaurantMembership[] = [];
  for (const membership of memberships) {
    const snap = await adminDb
      .collection('restaurants')
      .doc(membership.restaurantId)
      .get();
    const restaurant = snap.data() as Restaurant | undefined;
    if (restaurant) enriched.push({ ...membership, restaurant });
  }
  return enriched;
}

// ─── Server Actions ─────────────────────────────────────────────────────────────

/**
 * Sign in with username + password. On success an httpOnly session cookie is
 * set and the caller can navigate to the dashboard.
 */
export async function signInWithUsername(
  username: string,
  password: string
): Promise<SignInResult> {
  const email = await resolveUsernameToEmail(username.trim());
  // Same generic error whether the username or the password is wrong — avoids
  // leaking which usernames exist.
  const invalid: SignInResult = {
    ok: false,
    error: 'Usuario o contraseña incorrectos.',
  };
  if (!email) return invalid;

  const idToken = await verifyPassword(email, password);
  if (!idToken) return invalid;

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return { ok: true };
}

/**
 * Resolve the currently authenticated user from the verified session cookie,
 * along with their commerces (memberships). Returns null if there is no valid
 * session or the profile no longer exists.
 */
export async function getCurrentUser(): Promise<CurrentUserResult | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  let uid: string;
  try {
    // checkRevoked=true rejects sessions whose refresh tokens were revoked.
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    uid = decoded.uid;
  } catch {
    return null;
  }

  const userSnap = await adminDb.collection('users').doc(uid).get();
  const user = userSnap.data() as User | undefined;
  if (!user || user.isDisabled === true) return null;

  const memSnap = await adminDb
    .collection('memberships')
    .where('userId', '==', uid)
    .get();
  const memberships = memSnap.docs.map((d) => d.data() as Membership);

  return { user, memberships: await enrichMemberships(memberships) };
}

/** Clear the session cookie on sign-out. */
export async function signOutAction(): Promise<void> {
  const store = await cookies();
  store.delete({ name: SESSION_COOKIE, path: '/' });
}
