import type { Restaurant } from '@/types/restaurant';
import type { User } from '@/types/user';
import type { Plan } from '@/types/plan';
import type { RestaurantMembership } from '@/types/membership';
import type { CommerceDetail, CommerceMemberRow } from '@/features/platform/types';

export interface CommerceDetailInput {
  restaurant: Restaurant;
  plan: Plan | null;
  members: RestaurantMembership[];
  /** Lookup so the mapper can resolve the User from a membership.userId. */
  usersById: Record<string, User>;
  tableCount: number;
  productCount: number;
}

/**
 * Pure transform: a restaurant + joined data → a CommerceDetail view-model.
 * No side effects, no fetching.
 */
export function toCommerceDetail({
  restaurant,
  plan,
  members,
  usersById,
  tableCount,
  productCount,
}: CommerceDetailInput): CommerceDetail {
  const owners = members
    .filter((m) => m.role === 'owner')
    .sort((a, b) => a.createdAt - b.createdAt);

  const primaryOwner: User | null = owners[0]
    ? (usersById[owners[0].userId] ?? null)
    : null;

  const memberRows: CommerceMemberRow[] = members
    .map((m) => {
      const user = usersById[m.userId];
      if (!user) return null;
      return {
        userId: m.userId,
        displayName: user.displayName ?? user.email,
        email: user.email,
        role: m.role,
        createdAt: m.createdAt,
      } satisfies CommerceMemberRow;
    })
    .filter((row): row is CommerceMemberRow => row !== null)
    .sort((a, b) => {
      // Owners first, then alphabetically by display name.
      if (a.role !== b.role) return a.role === 'owner' ? -1 : 1;
      return a.displayName.localeCompare(b.displayName, 'es');
    });

  return {
    restaurant,
    plan,
    status: restaurant.subscription.status,
    owner: primaryOwner,
    tableCount,
    productCount,
    members: memberRows,
  };
}
