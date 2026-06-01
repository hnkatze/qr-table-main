import type { Plan } from '@/types/plan';
import type { User } from '@/types/user';
import type { SubscriptionStatus } from '@/types/subscription';
import type { CommerceRow, PlatformUserRow, PlanFields } from '@/features/platform/types';
import {
  MOCK_RESTAURANTS,
  MOCK_PLANS,
  MOCK_USERS,
  getPlanById,
  getMembersForRestaurant,
  getMembershipsForUser,
} from '@/lib/mock-data';
import { getTablesSnapshot } from '@/features/tables/services/tables.service';
import {
  toCommerceRow,
  sortCommerceRows,
} from '@/features/platform/mappers/commerce-row.mapper';
import {
  toPlatformUserRow,
  sortPlatformUserRows,
} from '@/features/platform/mappers/platform-user-row.mapper';
import { MOCK_WRITE_DELAY_MS } from '@/features/platform/constants';

/**
 * Platform service — the future Firestore boundary for the SaaS-owner panel.
 *
 * Unlike the tenant-scoped services, this reads ACROSS all tenants. Today it
 * joins mock data; reads are synchronous snapshots used to seed the hooks
 * without a loading flash. Mutations are async no-ops with a TODO seam.
 *
 * TODO seams:
 *   - getCommerces → Firestore: read all restaurants + join owner + counts
 *   - setCommerceStatus → Firestore: updateDoc restaurant subscription.status
 *   - getPlans / createPlan / updatePlan / setPlanActive → Firestore: `plans` collection
 *   - getPlatformUsers → Firestore: read all users + their memberships
 */

// ─── Lookups ────────────────────────────────────────────────────────────────

function buildUsersById(): Record<string, User> {
  return Object.fromEntries(MOCK_USERS.map((u) => [u.id, u]));
}

// ─── Commerces ────────────────────────────────────────────────────────────────

/**
 * Synchronous snapshot of all commerces (tenants) joined with plan, owner and
 * usage counts. Used to seed the commerces hook.
 * TODO: Firestore — replace with a real query + onSnapshot subscription.
 */
export function getCommercesSnapshot(): CommerceRow[] {
  const usersById = buildUsersById();
  const rows = MOCK_RESTAURANTS.map((restaurant) =>
    toCommerceRow({
      restaurant,
      plan: getPlanById(restaurant.subscription.planId),
      members: getMembersForRestaurant(restaurant.id),
      usersById,
      // Live count from the tables store (reflects tables created at runtime).
      tableCount: getTablesSnapshot(restaurant.id).length,
    })
  );
  return sortCommerceRows(rows);
}

/**
 * Changes a commerce's subscription status (e.g. suspend → 'canceled',
 * reactivate → 'active'). Today: no-op; the hook applies the change locally.
 * TODO: Firestore — updateDoc(restaurantRef, { 'subscription.status': status }).
 */
export async function setCommerceStatus(
  _restaurantId: string,
  _status: SubscriptionStatus
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — persist subscription status change
}

// ─── Plans ──────────────────────────────────────────────────────────────────

/**
 * Synchronous snapshot of the plan catalog.
 * TODO: Firestore — query the `plans` collection.
 */
export function getPlansSnapshot(): Plan[] {
  return [...MOCK_PLANS].sort((a, b) => a.priceMonthly - b.priceMonthly);
}

/**
 * Creates a new plan. Today: no-op (hook applies optimistically with a generated id).
 * TODO: Firestore — addDoc(collection(db, 'plans'), { ... }).
 */
export async function createPlan(_fields: PlanFields): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — persist new plan
}

/**
 * Updates an existing plan. Today: no-op (hook applies optimistically).
 * TODO: Firestore — updateDoc(doc(db, 'plans', planId), { ... }).
 */
export async function updatePlan(_planId: string, _fields: PlanFields): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — persist plan update
}

/**
 * Archives / reactivates a plan (soft toggle of isActive). Existing subscribers
 * keep an archived plan; it just can't be assigned to new commerces.
 * TODO: Firestore — updateDoc(doc(db, 'plans', planId), { isActive }).
 */
export async function setPlanActive(_planId: string, _isActive: boolean): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — persist isActive toggle
}

// ─── Platform users ───────────────────────────────────────────────────────────

/**
 * Synchronous snapshot of every platform user with their cross-restaurant
 * memberships. Platform admins are surfaced first.
 * TODO: Firestore — read all users + join memberships.
 */
export function getPlatformUsersSnapshot(): PlatformUserRow[] {
  const rows = MOCK_USERS.map((user) =>
    toPlatformUserRow(user, getMembershipsForUser(user.id))
  );
  return sortPlatformUserRows(rows);
}
