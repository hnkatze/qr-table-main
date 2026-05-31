/**
 * Shared session constants — NOT a server action file.
 * Imported by both proxy.ts (edge-adjacent, Node.js runtime) and session.ts
 * ('use server' file) so they agree on the cookie name without bundling issues.
 */

/** Name of the httpOnly session cookie set by createMockSession(). */
export const SESSION_COOKIE = 'mesa_session';
