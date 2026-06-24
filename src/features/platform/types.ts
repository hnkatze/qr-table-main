import type { Restaurant } from '@/types/restaurant';
import type { User } from '@/types/user';
import type { Plan } from '@/types/plan';
import type { SubscriptionStatus } from '@/types/subscription';
import type { Role } from '@/types/membership';

/**
 * View-model for one commerce (tenant) row in the platform commerces table.
 * Joins a restaurant with its plan, owner and usage counts — derived in a
 * mapper, never inline in the .tsx.
 */
export interface CommerceRow {
  restaurant: Restaurant;
  /** Resolved plan; null if the subscription points to a removed plan. */
  plan: Plan | null;
  status: SubscriptionStatus;
  /** Primary owner (first membership with role 'owner'); null if none. */
  owner: User | null;
  ownerCount: number;
  memberCount: number;
  tableCount: number;
}

/** One restaurant a platform user belongs to, with their role there. */
export interface PlatformUserMembership {
  restaurantId: string;
  restaurantName: string;
  role: Role;
}

/**
 * View-model for one user row in the platform users table.
 * A user is shown ONCE with all the restaurants they belong to.
 */
export interface PlatformUserRow {
  user: User;
  isPlatformAdmin: boolean;
  /** Mirror of User.isDisabled — surfaced here so the mapper controls it. */
  isDisabled: boolean;
  memberships: PlatformUserMembership[];
}

/** Discriminated union for an async commerce mutation (suspend/reactivate). */
export type CommerceActionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string };

/** Discriminated union for an async platform-user mutation. */
export type UserActionState =
  | { status: 'idle' }
  | { status: 'submitting'; userId: string }
  | { status: 'error'; message: string };

/** Form fields for creating/editing a plan (strings — parsed on submit). */
export interface PlanFields {
  name: string;
  priceMonthly: string;
  description: string;
  maxTables: string;
  maxMenuItems: string;
  isActive: boolean;
}

/**
 * One member row for the commerce detail page.
 * Shows the user's name + email + their role in that restaurant.
 */
export interface CommerceMemberRow {
  userId: string;
  displayName: string;
  email: string;
  role: Role;
  createdAt: number;
}

/**
 * Full view-model for the commerce drill-down page.
 * Extends the list view with member rows, product count, and per-limit usage.
 */
export interface CommerceDetail {
  restaurant: Restaurant;
  plan: Plan | null;
  status: SubscriptionStatus;
  /** Primary owner user (earliest-joined membership with role 'owner'); null if none. */
  owner: User | null;
  tableCount: number;
  productCount: number;
  members: CommerceMemberRow[];
}

/**
 * Discriminated union for the plan-assignment action (change-plan dialog).
 * Tracks whether the superadmin is picking a plan or confirming it.
 */
export type ChangePlanDialogState =
  | { phase: 'closed' }
  | { phase: 'picking'; selectedPlanId: string }
  | { phase: 'confirming'; selectedPlanId: string }
  | { phase: 'submitting'; selectedPlanId: string };

/** Discriminated union for async commerce-detail mutations. */
export type CommerceDetailActionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string };
