import type { User } from '@/types/user';
export type { Role } from '@/types/membership';

/**
 * View-model for a single row in the members table.
 * Derived by joining a Membership with its User in the mapper layer.
 */
export interface MemberRow {
  membershipId: string;
  userId: string;
  role: import('@/types/membership').Role;
  createdAt: number;
  user: User;
}
