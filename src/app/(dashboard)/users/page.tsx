'use client';

import { useAuth, useActiveRole } from '@/lib/auth/auth-context';
import { useMembers } from '@/features/members/hooks/use-members';
import { PageHeader } from '@/features/members/components/page-header';
import { StatStrip } from '@/features/members/components/stat-strip';
import { MembersTable } from '@/features/members/components/members-table';
import { NoRestaurantState } from '@/features/members/components/no-restaurant-state';
import { SoloOwnerState } from '@/features/members/components/solo-owner-state';
import { Card, CardContent } from '@/components/ui/card';

/**
 * /users — Members of the active restaurant.
 *
 * Thin orchestrator: reads auth context, delegates all state logic to
 * useMembers(), and renders presentational components.
 *
 * Owner-gating:
 *   - useActiveRole() === 'owner' → invite button + row action menus visible.
 *   - 'staff' or null → read-only table, no action affordances.
 */
export default function UsersPage() {
  const { currentUser, activeRestaurant } = useAuth();
  const activeRole = useActiveRole();
  const isOwner = activeRole === 'owner';

  const { members, handleChangeRole, handleRemoveMember, handleInvite } = useMembers({
    restaurantId: activeRestaurant?.id ?? null,
  });

  if (!activeRestaurant) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader restaurantName={null} isOwner={isOwner} onInvite={handleInvite} />
        <NoRestaurantState />
      </div>
    );
  }

  const isSolo =
    members.length === 1 && members[0]?.userId === currentUser?.id;

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

      <StatStrip members={members} restaurantName={activeRestaurant.name} />

      <Card className="overflow-hidden">
        <CardContent className="p-0 pt-0">
          <MembersTable
            members={members}
            currentUserId={currentUser?.id ?? ''}
            isOwner={isOwner}
            onChangeRole={handleChangeRole}
            onRemoveMember={handleRemoveMember}
          />
        </CardContent>
      </Card>

      {!isOwner && (
        <p className="text-xs text-muted-foreground text-center" role="note">
          Solo los propietarios pueden invitar o cambiar los roles de los miembros.
        </p>
      )}
    </div>
  );
}
