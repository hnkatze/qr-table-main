import type { SubscriptionStatus } from '@/types/subscription';
import type { SubscriptionViewModel } from '@/features/subscription/types';
import { getPlanById } from '@/lib/mock-data';
import { MOCK_PRODUCTS_BY_RESTAURANT } from '@/features/menu/services/menu-mock-data';
import { getTablesSnapshot } from '@/features/tables/services/tables.service';
import { deriveUsage } from '@/features/subscription/mappers/usage.mapper';
import { MOCK_WRITE_DELAY_MS } from '@/features/subscription/constants';
import type { Restaurant } from '@/types/restaurant';

/**
 * Subscription service — the future Firestore boundary for the tenant
 * subscription/upgrade page.
 *
 * Reads join Restaurant.subscription + Plan catalog + live usage counts.
 * Mutations are async stubs today; the hook applies changes locally (optimistic).
 *
 * TODO seams:
 *   - getSubscriptionSnapshot → Firestore: getDoc restaurant + getDoc plan
 *   - switchPlan → Firestore: updateDoc restaurant { subscription.planId }
 *   - activatePlan → Firestore: updateDoc restaurant { subscription.status: 'active' }
 *     + trigger payment flow (Stripe, etc.)
 */

// ─── In-memory subscription store (mock) ─────────────────────────────────────

/**
 * Mutable in-memory snapshot of restaurant subscription state.
 * Keyed by restaurantId. Seeded lazily from the static Restaurant objects.
 *
 * Why mutable? The subscription service needs to reflect plan switches and
 * status transitions across the session without touching the Restaurant type
 * (which is owned by auth-context). When Firestore lands, this store is
 * replaced by Firestore subscriptions.
 */
interface SubscriptionRecord {
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: number;
}

const subscriptionStore = new Map<string, SubscriptionRecord>();

function getSubscriptionRecord(restaurant: Restaurant): SubscriptionRecord {
  if (!subscriptionStore.has(restaurant.id)) {
    subscriptionStore.set(restaurant.id, { ...restaurant.subscription });
  }
  return subscriptionStore.get(restaurant.id)!;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Synchronous snapshot of a restaurant's subscription view-model.
 * Joins the subscription record with the plan catalog and live usage counts.
 *
 * TODO: Firestore — replace with real-time listener result.
 */
export function getSubscriptionSnapshot(restaurant: Restaurant): SubscriptionViewModel {
  const record = getSubscriptionRecord(restaurant);
  const plan = getPlanById(record.planId);

  // Table usage: live count from the tables store (reflects runtime creates).
  const tableCount = getTablesSnapshot(restaurant.id).length;
  const tablesUsage = deriveUsage(tableCount, plan?.limits.maxTables ?? null);

  // Menu items: static count from mock data (no runtime store for products yet).
  const menuItems = MOCK_PRODUCTS_BY_RESTAURANT[restaurant.id] ?? [];
  const menuItemsUsage = deriveUsage(menuItems.length, plan?.limits.maxMenuItems ?? null);

  return {
    plan,
    status: record.status,
    currentPeriodEnd: record.currentPeriodEnd,
    usage: {
      tables: tablesUsage,
      menuItems: menuItemsUsage,
    },
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Switches the restaurant to a different plan.
 * Today: no-op stub; the hook applies the change optimistically.
 *
 * TODO: Firestore — updateDoc(restaurantRef, { 'subscription.planId': planId })
 * TODO: trigger proration / billing-cycle change via Stripe webhook.
 */
export async function switchPlan(
  restaurantId: string,
  planId: string
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // Persist to the in-memory store so subsequent snapshots reflect the change.
  const record = subscriptionStore.get(restaurantId);
  if (record) {
    record.planId = planId;
  }
  // TODO: Firestore — persist plan switch
}

/**
 * Activates a trialing subscription (transitions trialing → active).
 * Today: no-op stub with mock delay (simulates a payment confirmation).
 *
 * TODO: Firestore — updateDoc(restaurantRef, { 'subscription.status': 'active' })
 * TODO: wire real payment provider (Stripe Checkout / Billing Portal).
 */
export async function activateSubscription(restaurantId: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // Persist to the in-memory store.
  const record = subscriptionStore.get(restaurantId);
  if (record) {
    record.status = 'active';
  }
  // TODO: Firestore — persist status transition + record payment
}
