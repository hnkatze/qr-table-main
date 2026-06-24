/**
 * Server-side session helpers (server-only).
 *
 * Reusable authorization primitives for Server Actions across every feature
 * service. They read the verified Firebase session cookie and check the user's
 * membership in a restaurant, so feature services never trust a client-supplied
 * identity and Firestore can stay locked (all writes go through the Admin SDK).
 */

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { SESSION_COOKIE } from './session-constants';
import type { Role } from '@/types/membership';

/** Resolve the authenticated uid from the verified session cookie, or null. */
export async function getSessionUid(): Promise<string | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

export interface MembershipContext {
  uid: string;
  role: Role;
}

/**
 * Require that the current user is a member of `restaurantId`. Throws if there
 * is no valid session or no membership. Returns the uid + role so callers can
 * apply finer-grained authorization (e.g. owner-only operations).
 */
export async function requireMembership(
  restaurantId: string
): Promise<MembershipContext> {
  const uid = await getSessionUid();
  if (!uid) throw new Error('No autenticado.');

  const snap = await adminDb
    .collection('memberships')
    .where('userId', '==', uid)
    .where('restaurantId', '==', restaurantId)
    .limit(1)
    .get();

  if (snap.empty) throw new Error('No autorizado para este comercio.');

  const role = snap.docs[0]?.get('role') as Role;
  return { uid, role };
}
