'use server';

/**
 * Mock session helpers — Server Actions.
 *
 * These are intentionally thin: they only set/clear a cookie whose presence
 * the Proxy checks for optimistic route protection.
 *
 * Firebase seam: replace the body of each function once Firebase Auth is wired.
 */

import { cookies } from 'next/headers';
import { SESSION_COOKIE } from './session-constants';

// Mock token value — throwaway until Firebase issues real session cookies.
const MOCK_SESSION_TOKEN = 'mock-session-token-v1';

/**
 * Set the session cookie after a successful (mock) sign-in.
 *
 * TODO: replace with Firebase session cookie:
 *   - Verify the Firebase ID token server-side (admin SDK).
 *   - Call admin.auth().createSessionCookie(idToken, { expiresIn }).
 *   - Store that verified session cookie here instead of MOCK_SESSION_TOKEN.
 */
export async function createMockSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, MOCK_SESSION_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  console.log('[session] createMockSession — cookie SET');
}

/**
 * Delete the session cookie on sign-out.
 *
 * TODO: also revoke the Firebase session / sign out server-side:
 *   - admin.auth().revokeRefreshTokens(uid)
 *   - Or call admin.auth().verifySessionCookie(cookie, true) to check before revoking.
 */
export async function clearMockSession(): Promise<void> {
  const store = await cookies();
  console.log(
    '[session] clearMockSession — present before delete:',
    store.has(SESSION_COOKIE)
  );
  // Delete with explicit name+path to guarantee it matches the cookie we set
  // (set with path '/'); a name-only delete can miss if the path differs.
  store.delete({ name: SESSION_COOKIE, path: '/' });
  console.log('[session] clearMockSession — delete() called (path /)');
}

/**
 * Convenience helper — returns true if a session cookie is present.
 * Use in Server Components or Server Actions that need a quick presence check.
 * For real authorization, verify the token value server-side.
 */
export async function hasSession(): Promise<boolean> {
  return (await cookies()).has(SESSION_COOKIE);
}
