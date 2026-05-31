import { MOCK_MEMBERSHIPS, MOCK_USERS } from '@/lib/mock-data';
import type { MemberRow } from '@/features/members/types';

/**
 * Derives the member list for a given restaurant by joining:
 *   MOCK_MEMBERSHIPS (filtered by restaurantId) → MOCK_USERS (by userId)
 *
 * Sort order: owners first, then alphabetically by displayName/email (es locale).
 *
 * Pure function — no side effects, no state.
 * When Firestore lands, replace the data sources here; the shape stays the same.
 */
export function buildMemberRows(restaurantId: string): MemberRow[] {
  const userMap = new Map(MOCK_USERS.map((u) => [u.id, u]));

  return MOCK_MEMBERSHIPS
    .filter((m) => m.restaurantId === restaurantId)
    .flatMap((m) => {
      const user = userMap.get(m.userId);
      if (!user) return [];
      return [
        {
          membershipId: m.id,
          userId: m.userId,
          role: m.role,
          createdAt: m.createdAt,
          user,
        } satisfies MemberRow,
      ];
    })
    .sort((a, b) => {
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (b.role === 'owner' && a.role !== 'owner') return 1;
      return (a.user.displayName ?? a.user.email).localeCompare(
        b.user.displayName ?? b.user.email,
        'es'
      );
    });
}
