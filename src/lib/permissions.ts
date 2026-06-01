/**
 * Capability model — permissions DERIVED from a role, in code.
 *
 * This is the sustainable middle ground between two extremes:
 *   - role as a bare string with `if (role === 'owner')` scattered everywhere
 *     → unmaintainable, intent is invisible.
 *   - a full dynamic RBAC (editable role + permission tables, many-to-many)
 *     → over-engineering for a fixed set of 3 roles.
 *
 * We keep roles as typed unions and map each to a fixed list of permissions
 * here. The day a customer needs custom roles, migrate THIS map to a backend
 * table — the call sites (`hasPermission`) stay unchanged. Not before.
 *
 * There are two role planes (see `platform.ts` and `membership.ts`):
 *   - platform plane: `superadmin`  → `platform:*` permissions
 *   - tenant plane:   `owner`/`staff` → `tenant:*` permissions
 */

import type { Role } from '@/types/membership';
import type { PlatformRole } from '@/types/platform';

export const PERMISSIONS = [
  // ── Platform plane (SaaS owner) ──────────────────────────────────────────
  'platform:manage_commerces',
  'platform:manage_plans',
  'platform:manage_platform_users',
  // ── Tenant plane (restaurant owner/staff) ────────────────────────────────
  'tenant:manage_menu',
  'tenant:manage_tables',
  'tenant:manage_members',
  'tenant:view_orders',
  'tenant:update_order_status',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Any role the capability model understands — platform OR tenant. */
export type AppRole = PlatformRole | Role;

const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  superadmin: [
    'platform:manage_commerces',
    'platform:manage_plans',
    'platform:manage_platform_users',
  ],
  owner: [
    'tenant:manage_menu',
    'tenant:manage_tables',
    'tenant:manage_members',
    'tenant:view_orders',
    'tenant:update_order_status',
  ],
  staff: ['tenant:view_orders', 'tenant:update_order_status'],
};

/** All permissions granted to a role (empty for null/unknown). */
export function permissionsFor(role: AppRole | null | undefined): readonly Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Whether a role grants a specific permission. */
export function hasPermission(
  role: AppRole | null | undefined,
  permission: Permission
): boolean {
  return permissionsFor(role).includes(permission);
}
