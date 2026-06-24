import type { PlatformRole } from './platform';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  /**
   * Optional GLOBAL platform role (e.g. 'superadmin' for the SaaS owner).
   * Absent for the vast majority of users — a regular restaurant owner/staff
   * has no platformRole. This is the plane ABOVE tenants; do NOT confuse it
   * with a Membership role. See `platform.ts`.
   */
  platformRole?: PlatformRole;
  /**
   * When true the account is administratively disabled and the user cannot
   * sign in. Absent or false = active account. Managed exclusively via the
   * platform admin panel — never set by the user themselves.
   * TODO: Firestore — persist as `isDisabled` on the user document; use
   * Firebase Auth `updateUser(uid, { disabled: true })` to block sign-in.
   */
  isDisabled?: boolean;
}
