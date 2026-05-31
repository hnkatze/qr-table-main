'use client';

import { useState } from 'react';
import { Users2Icon } from 'lucide-react';
import { useAuth, useActiveRole } from '@/lib/auth/auth-context';
import {
  MOCK_MEMBERSHIPS,
  MOCK_USERS,
} from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MembersTable } from '@/components/users/members-table';
import { InviteMemberDialog } from '@/components/users/invite-member-dialog';
import type { MemberRow } from '@/components/users/members-table';
import type { Role } from '@/types/membership';

// ─── Data join ────────────────────────────────────────────────────────────────

/**
 * Derive the member list for a given restaurant by joining:
 *   MOCK_MEMBERSHIPS (filtered by restaurantId) → MOCK_USERS (by userId)
 *
 * This join is done locally; no mock-data.ts exports are modified.
 * When Firestore lands, replace this with a real-time listener result.
 */
function buildMemberRows(restaurantId: string): MemberRow[] {
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
      // Owners first, then alphabetically
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (b.role === 'owner' && a.role !== 'owner') return 1;
      return (a.user.displayName ?? a.user.email).localeCompare(
        b.user.displayName ?? b.user.email,
        'es'
      );
    });
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function NoRestaurantState() {
  return (
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <CardTitle>Sin restaurante activo</CardTitle>
        <CardDescription>
          Seleccioná un restaurante desde el panel lateral para ver sus miembros.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

interface SoloOwnerStateProps {
  restaurantName: string;
  canInvite: boolean;
  onInviteOpen?: () => void;
}

function SoloOwnerState({ restaurantName, canInvite, onInviteOpen }: SoloOwnerStateProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted">
            <Users2Icon className="size-5 text-muted-foreground" aria-hidden="true" />
          </span>
        </div>
        <CardTitle className="text-center">Sos el único miembro</CardTitle>
        <CardDescription className="text-center">
          {canInvite
            ? `Invitá a tu equipo para que puedan gestionar ${restaurantName} con vos.`
            : `Todavía no hay más miembros en ${restaurantName}.`}
        </CardDescription>
      </CardHeader>
      {canInvite && onInviteOpen && (
        <CardContent className="flex justify-center">
          <button
            type="button"
            onClick={onInviteOpen}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Invitar al primer miembro
          </button>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * /users — Members of the active restaurant.
 *
 * Data flow:
 *   1. activeRestaurant comes from useAuth() (mock: Ana's active restaurant).
 *   2. Members are derived locally: MOCK_MEMBERSHIPS filtered by restaurantId,
 *      then joined to MOCK_USERS by userId.
 *   3. Local state (localMembers) shadows the mock data so UI actions
 *      (change role, remove) feel real without touching mock-data.ts.
 *
 * Owner-gating:
 *   - useActiveRole() === 'owner' → invite button + row action menus visible.
 *   - 'staff' or null → read-only table, no action affordances.
 *
 * Firestore seams (marked with TODO):
 *   - InviteMemberDialog.onInvite → create membership document
 *   - MembersTable.onChangeRole   → update role field on membership document
 *   - MembersTable.onRemoveMember → delete membership document
 */
export default function UsersPage() {
  const { currentUser, activeRestaurant } = useAuth();
  const activeRole = useActiveRole();
  const isOwner = activeRole === 'owner';

  // Shadow the mock member list with local state so actions feel real.
  // Lazy initializer reads activeRestaurant once at mount; subsequent
  // restaurant switches are handled by the render-phase sync below.
  const [localMembers, setLocalMembers] = useState<MemberRow[]>(
    () => (activeRestaurant ? buildMemberRows(activeRestaurant.id) : [])
  );

  // Sync if active restaurant changes
  const [lastRestaurantId, setLastRestaurantId] = useState<string | null>(
    () => activeRestaurant?.id ?? null
  );

  if (activeRestaurant?.id !== lastRestaurantId) {
    setLastRestaurantId(activeRestaurant?.id ?? null);
    setLocalMembers(activeRestaurant ? buildMemberRows(activeRestaurant.id) : []);
  }

  // ─── Handlers ───────────────────────────────────────────────────────────────

  /**
   * Mock role change — updates local state only.
   * TODO: wire Firestore membership update (update role field by membershipId)
   */
  function handleChangeRole(membershipId: string, newRole: Role) {
    setLocalMembers((prev) =>
      prev.map((m) =>
        m.membershipId === membershipId ? { ...m, role: newRole } : m
      )
    );
  }

  /**
   * Mock remove — removes from local state only.
   * TODO: wire Firestore membership delete (delete document by membershipId)
   */
  function handleRemoveMember(membershipId: string) {
    setLocalMembers((prev) =>
      prev.filter((m) => m.membershipId !== membershipId)
    );
  }

  /**
   * Mock invite — appends a placeholder member to local state.
   * TODO: wire Firestore membership create (resolve user by email, create document)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- mock no-op; params consumed once Firestore is wired
  function handleInvite(email: string, role: Role) {
    // No-op in mock: the dialog shows inline success feedback.
    // In production: optimistically append the new member to localMembers
    // after the Firestore write resolves.
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!activeRestaurant) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          restaurantName={null}
          isOwner={isOwner}
          onInvite={handleInvite}
        />
        <NoRestaurantState />
      </div>
    );
  }

  const isSolo =
    localMembers.length === 1 &&
    localMembers[0]?.userId === currentUser?.id;

  if (isSolo) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          restaurantName={activeRestaurant.name}
          isOwner={isOwner}
          onInvite={handleInvite}
        />
        <SoloOwnerState
          restaurantName={activeRestaurant.name}
          canInvite={isOwner}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        restaurantName={activeRestaurant.name}
        isOwner={isOwner}
        onInvite={handleInvite}
      />

      {/* Member count summary */}
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {localMembers.length}{' '}
        {localMembers.length === 1 ? 'miembro' : 'miembros'} con acceso a{' '}
        {activeRestaurant.name}
      </p>

      {/* Table / cards */}
      <Card>
        <CardContent className="p-0 pt-0">
          <MembersTable
            members={localMembers}
            currentUserId={currentUser?.id ?? ''}
            isOwner={isOwner}
            onChangeRole={handleChangeRole}
            onRemoveMember={handleRemoveMember}
          />
        </CardContent>
      </Card>

      {/* Read-only notice for staff */}
      {!isOwner && (
        <p className="text-xs text-muted-foreground text-center" role="note">
          Solo los propietarios pueden invitar o cambiar los roles de los miembros.
        </p>
      )}
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

interface PageHeaderProps {
  restaurantName: string | null;
  isOwner: boolean;
  onInvite: (email: string, role: Role) => void;
}

function PageHeader({ restaurantName, isOwner, onInvite }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Usuarios
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {restaurantName
            ? `Miembros de ${restaurantName} — personas con acceso a este restaurante.`
            : 'Seleccioná un restaurante para ver sus miembros.'}
        </p>
      </div>

      {isOwner && restaurantName && (
        <InviteMemberDialog
          restaurantName={restaurantName}
          onInvite={onInvite}
        />
      )}
    </div>
  );
}

