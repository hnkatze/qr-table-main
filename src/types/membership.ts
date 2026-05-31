import type { Restaurant } from './restaurant';

export const ROLES = ['owner', 'staff'] as const;
export type Role = (typeof ROLES)[number];

export interface Membership {
  id: string;
  userId: string;
  restaurantId: string;
  role: Role;
  createdAt: number;
}

/**
 * View-model: a membership enriched with the full restaurant data.
 * Used in useAuth().memberships to render the restaurant switcher and
 * determine the current user's role in the active restaurant.
 */
export type RestaurantMembership = Membership & { restaurant: Restaurant };
