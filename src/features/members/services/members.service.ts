import { buildMemberRows } from '@/features/members/mappers/member-row.mapper';
import type { MemberRow, Role } from '@/features/members/types';

/**
 * Members service — the future server boundary.
 *
 * All functions are async to match the eventual Firestore shape.
 * Today they operate on mock data / local state; each has a seam comment
 * marking where the real implementation will land.
 *
 * TODO seams:
 *   - getMembers      → real-time Firestore listener (onSnapshot) by restaurantId
 *   - changeMemberRole → Firestore doc update: memberships/{id}.role = newRole
 *   - removeMember     → Firestore doc delete: memberships/{id}
 *   - inviteMember     → resolve user by email, create memberships/{id} doc
 */

/**
 * Returns the member rows for a given restaurant.
 * Today: reads from mock data via the mapper.
 * TODO: subscribe to Firestore `memberships` collection filtered by restaurantId.
 */
export async function getMembers(restaurantId: string): Promise<MemberRow[]> {
  // TODO: Firestore — return a real-time listener result instead
  return buildMemberRows(restaurantId);
}

/**
 * Changes a member's role.
 * Today: no-op (the hook applies the change locally).
 * TODO: Firestore — await updateDoc(doc(db, 'memberships', membershipId), { role: newRole })
 */
export async function changeMemberRole(
  membershipId: string,
  newRole: Role
): Promise<void> {
  // TODO: Firestore — persist role change
  void membershipId;
  void newRole;
}

/**
 * Removes a member from the restaurant.
 * Today: no-op (the hook removes from local state).
 * TODO: Firestore — await deleteDoc(doc(db, 'memberships', membershipId))
 */
export async function removeMember(membershipId: string): Promise<void> {
  // TODO: Firestore — delete membership document
  void membershipId;
}

/**
 * Invites a new member by email with the specified role.
 * Today: no-op (the dialog shows inline success feedback only).
 * TODO: Firestore —
 *   1. Resolve the user document by email (users collection query)
 *   2. Create a memberships/{id} doc with { userId, restaurantId, role, createdAt }
 */
export async function inviteMember(
  email: string,
  role: Role
): Promise<void> {
  // TODO: Firestore — resolve user + create membership document
  void email;
  void role;
}
