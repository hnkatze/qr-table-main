import type { Restaurant } from '@/types/restaurant';
import type { User } from '@/types/user';
import type { Plan } from '@/types/plan';
import type { RestaurantMembership } from '@/types/membership';
import type { CommerceRow } from '@/features/platform/types';

/** Raw inputs gathered by the service for a single commerce row. */
export interface CommerceRowInput {
  restaurant: Restaurant;
  plan: Plan | null;
  members: RestaurantMembership[];
  /** Lookup so the mapper can resolve the owner User from a membership.userId. */
  usersById: Record<string, User>;
  tableCount: number;
}

/**
 * Pure transform: a restaurant + its joined data → a CommerceRow view-model.
 * No side effects, no fetching. The "primary owner" is the earliest-joined
 * membership with role 'owner'.
 */
export function toCommerceRow({
  restaurant,
  plan,
  members,
  usersById,
  tableCount,
}: CommerceRowInput): CommerceRow {
  const owners = members
    .filter((m) => m.role === 'owner')
    .sort((a, b) => a.createdAt - b.createdAt);

  const primaryOwner: User | null = owners[0]
    ? usersById[owners[0].userId] ?? null
    : null;

  return {
    restaurant,
    plan,
    status: restaurant.subscription.status,
    owner: primaryOwner,
    ownerCount: owners.length,
    memberCount: members.length,
    tableCount,
  };
}

/** Sort commerce rows alphabetically by restaurant name (locale-aware). */
export function sortCommerceRows(rows: CommerceRow[]): CommerceRow[] {
  return [...rows].sort((a, b) =>
    a.restaurant.name.localeCompare(b.restaurant.name, 'es')
  );
}
