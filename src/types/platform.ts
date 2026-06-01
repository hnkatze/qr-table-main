/**
 * Platform-level role — the plane ABOVE all tenants.
 *
 * A `superadmin` is the SaaS owner: they administer every commerce, plan and
 * user across the whole platform. This is NOT a Membership role:
 *   - `owner` / `staff` (see `membership.ts`) are scoped to ONE restaurant.
 *   - a `platformRole` is GLOBAL and has no restaurantId.
 *
 * Most users have no platformRole at all (it is optional on User). Modeling
 * the platform owner as a Membership `owner` would conflate two different
 * planes — see `.claude/rules/data-conventions.md`.
 */

export const PLATFORM_ROLES = ['superadmin'] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];
