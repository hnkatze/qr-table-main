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
}
