import { useState } from 'react';
import {
  changeMemberRole,
  removeMember,
  inviteMember,
} from '@/features/members/services/members.service';
import { buildMemberRows } from '@/features/members/mappers/member-row.mapper';
import type { MemberRow, Role } from '@/features/members/types';

interface UseMembersInput {
  restaurantId: string | null;
}

interface UseMembersOutput {
  members: MemberRow[];
  handleChangeRole: (membershipId: string, newRole: Role) => void;
  handleRemoveMember: (membershipId: string) => void;
  handleInvite: (email: string, role: Role) => void;
}

/**
 * Encapsulates all members-feature state:
 *   - localMembers: the shadowed member list (driven by mock data; no Firestore yet)
 *   - restaurant-change sync: detects when activeRestaurant switches and re-derives
 *   - handlers: changeRole, removeMember, invite — each calls the service then
 *     applies an optimistic local update
 *
 * The returned API is what the UsersPage needs — nothing more.
 *
 * Design note: the restaurant-sync uses the render-phase pattern (no useEffect)
 * because the derived state is a pure function of restaurantId. This preserves
 * the same behavior as the original page.tsx.
 *
 * Note on getInitialMembers: getMembers() in the service is async (Firestore-ready
 * boundary shape), but today the data is synchronous mock data. We call buildMemberRows
 * directly for the initial load to avoid a loading flash. When Firestore lands, replace
 * this hook's internals with an onSnapshot subscription inside a useEffect.
 */
export function useMembers({ restaurantId }: UseMembersInput): UseMembersOutput {
  const [localMembers, setLocalMembers] = useState<MemberRow[]>(
    () => (restaurantId ? buildMemberRows(restaurantId) : [])
  );

  const [lastRestaurantId, setLastRestaurantId] = useState<string | null>(
    () => restaurantId
  );

  // Render-phase sync: when restaurantId changes, re-derive immediately.
  // This is intentional (not a bug): the state update during render is the
  // recommended React pattern for derived state that resets on prop change.
  if (restaurantId !== lastRestaurantId) {
    setLastRestaurantId(restaurantId);
    setLocalMembers(restaurantId ? buildMemberRows(restaurantId) : []);
  }

  function handleChangeRole(membershipId: string, newRole: Role): void {
    // Optimistic local update
    setLocalMembers((prev) =>
      prev.map((m) =>
        m.membershipId === membershipId ? { ...m, role: newRole } : m
      )
    );
    // Service call (no-op today; TODO: await + rollback on error when Firestore lands)
    void changeMemberRole(membershipId, newRole);
  }

  function handleRemoveMember(membershipId: string): void {
    // Optimistic local update
    setLocalMembers((prev) =>
      prev.filter((m) => m.membershipId !== membershipId)
    );
    // Service call (no-op today; TODO: await + rollback on error when Firestore lands)
    void removeMember(membershipId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- mock no-op; email and role consumed once Firestore is wired
  function handleInvite(email: string, role: Role): void {
    // No-op in mock: the dialog shows inline success feedback.
    // In production: optimistically append the new member after the Firestore write resolves.
    void inviteMember(email, role);
  }

  return { members: localMembers, handleChangeRole, handleRemoveMember, handleInvite };
}
