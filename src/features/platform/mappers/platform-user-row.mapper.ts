import type { User } from '@/types/user';
import type { RestaurantMembership } from '@/types/membership';
import type { PlatformUserRow } from '@/features/platform/types';

/**
 * Pure transform: a user + their cross-restaurant memberships → a
 * PlatformUserRow view-model. Each user appears once, listing every
 * restaurant they belong to and their role there.
 */
export function toPlatformUserRow(
  user: User,
  memberships: RestaurantMembership[]
): PlatformUserRow {
  return {
    user,
    isPlatformAdmin: user.platformRole === 'superadmin',
    isDisabled: user.isDisabled === true,
    memberships: memberships
      .map((m) => ({
        restaurantId: m.restaurantId,
        restaurantName: m.restaurant.name,
        role: m.role,
      }))
      .sort((a, b) => a.restaurantName.localeCompare(b.restaurantName, 'es')),
  };
}

/**
 * Sort platform users: platform admins first, then alphabetically by name.
 * Surfaces the most privileged accounts at the top of the table.
 */
export function sortPlatformUserRows(rows: PlatformUserRow[]): PlatformUserRow[] {
  return [...rows].sort((a, b) => {
    if (a.isPlatformAdmin !== b.isPlatformAdmin) {
      return a.isPlatformAdmin ? -1 : 1;
    }
    const an = a.user.displayName ?? a.user.email;
    const bn = b.user.displayName ?? b.user.email;
    return an.localeCompare(bn, 'es');
  });
}
