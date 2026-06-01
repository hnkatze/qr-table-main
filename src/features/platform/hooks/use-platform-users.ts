import { useState } from 'react';
import type { PlatformUserRow } from '@/features/platform/types';
import { getPlatformUsersSnapshot } from '@/features/platform/services/platform.service';

export interface UsePlatformUsersOutput {
  /** Every platform user with their cross-restaurant memberships. */
  users: PlatformUserRow[];
}

/**
 * Encapsulates the platform users state (read-only for now). Seeds synchronously
 * from the service snapshot.
 *
 * TODO: when platform-user management lands (grant/revoke platformRole, disable
 * accounts), add optimistic mutation handlers here following the usePlans pattern.
 */
export function usePlatformUsers(): UsePlatformUsersOutput {
  const [users] = useState<PlatformUserRow[]>(() => getPlatformUsersSnapshot());
  return { users };
}
