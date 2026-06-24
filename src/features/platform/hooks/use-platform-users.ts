import { useState } from 'react';
import type { PlatformUserRow, UserActionState } from '@/features/platform/types';
import {
  getPlatformUsersSnapshot,
  setPlatformRole,
  setUserDisabled,
} from '@/features/platform/services/platform.service';
import { sortPlatformUserRows } from '@/features/platform/mappers/platform-user-row.mapper';

export interface UsePlatformUsersOutput {
  /** Every platform user with their cross-restaurant memberships. */
  users: PlatformUserRow[];
  /** State of the in-flight user mutation. */
  actionState: UserActionState;
  /**
   * Grants the 'superadmin' platform role to a user.
   * Safety: call sites must ensure the target is not the current user.
   */
  handleGrantPlatformRole: (userId: string) => Promise<void>;
  /**
   * Revokes the platform role from a user (sets platformRole → undefined).
   * Safety: call sites must ensure the target is not the current user.
   */
  handleRevokePlatformRole: (userId: string) => Promise<void>;
  /**
   * Disables a user account (prevents sign-in).
   * Safety: call sites must ensure the target is not the current user.
   */
  handleDisableUser: (userId: string) => Promise<void>;
  /**
   * Re-enables a previously disabled user account.
   * Safety: call sites must ensure the target is not the current user.
   */
  handleEnableUser: (userId: string) => Promise<void>;
}

/**
 * Encapsulates the platform users state and mutation handlers.
 * Seeds synchronously from the service snapshot and applies mutations
 * optimistically — the service is a no-op today; mutations are visible
 * immediately and will survive a Firestore swap without changing this API.
 */
export function usePlatformUsers(): UsePlatformUsersOutput {
  const [users, setUsers] = useState<PlatformUserRow[]>(() =>
    getPlatformUsersSnapshot()
  );
  const [actionState, setActionState] = useState<UserActionState>({ status: 'idle' });

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /** Patches a single row in the users list and re-sorts. */
  function patchUser(userId: string, patch: Partial<PlatformUserRow>): void {
    setUsers((prev) =>
      sortPlatformUserRows(
        prev.map((row) =>
          row.user.id === userId ? { ...row, ...patch } : row
        )
      )
    );
  }

  async function withMutation(
    userId: string,
    fn: () => Promise<void>
  ): Promise<void> {
    setActionState({ status: 'submitting', userId });
    try {
      await fn();
      setActionState({ status: 'idle' });
    } catch {
      // TODO: rollback optimistic change when Firestore can fail for real.
      setActionState({ status: 'error', message: 'No se pudo actualizar el usuario.' });
    }
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  async function handleGrantPlatformRole(userId: string): Promise<void> {
    // Optimistic: patch row so the badge appears immediately.
    patchUser(userId, {
      isPlatformAdmin: true,
      user: {
        ...users.find((r) => r.user.id === userId)!.user,
        platformRole: 'superadmin',
      },
    });
    await withMutation(userId, () => setPlatformRole(userId, 'superadmin'));
  }

  async function handleRevokePlatformRole(userId: string): Promise<void> {
    // Optimistic: clear platformRole from both the row and the embedded user.
    const existing = users.find((r) => r.user.id === userId);
    if (!existing) return;
    // Build the user object without the platformRole key (omit, don't set to undefined,
    // so exactOptionalPropertyTypes compliance is maintained).
    const userCopy = { ...existing.user };
    delete userCopy.platformRole;
    patchUser(userId, { isPlatformAdmin: false, user: userCopy });
    await withMutation(userId, () => setPlatformRole(userId, null));
  }

  async function handleDisableUser(userId: string): Promise<void> {
    patchUser(userId, {
      isDisabled: true,
      user: {
        ...users.find((r) => r.user.id === userId)!.user,
        isDisabled: true,
      },
    });
    await withMutation(userId, () => setUserDisabled(userId, true));
  }

  async function handleEnableUser(userId: string): Promise<void> {
    patchUser(userId, {
      isDisabled: false,
      user: {
        ...users.find((r) => r.user.id === userId)!.user,
        isDisabled: false,
      },
    });
    await withMutation(userId, () => setUserDisabled(userId, false));
  }

  return {
    users,
    actionState,
    handleGrantPlatformRole,
    handleRevokePlatformRole,
    handleDisableUser,
    handleEnableUser,
  };
}
