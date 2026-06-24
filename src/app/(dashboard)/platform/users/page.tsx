'use client';

import { usePlatformUsers } from '@/features/platform/hooks/use-platform-users';
import { PlatformPageHeader } from '@/features/platform/components/platform-page-header';
import { PlatformUsersTable } from '@/features/platform/components/platform-users-table';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * /platform/users — every user across the whole platform, with the restaurants
 * they belong to and whether they hold a platform role.
 *
 * Thin orchestrator: delegates state to usePlatformUsers(), provides currentUserId
 * so the table can enforce the self-action safety rail.
 */
export default function PlatformUsersPage() {
  const { currentUser } = useAuth();
  const {
    users,
    actionState,
    handleGrantPlatformRole,
    handleRevokePlatformRole,
    handleDisableUser,
    handleEnableUser,
  } = usePlatformUsers();

  // currentUser is always non-null on this page (the platform guard ensures auth).
  // Fall back to empty string to satisfy TypeScript without a non-null assertion.
  const currentUserId = currentUser?.id ?? '';

  return (
    <div className="flex flex-col gap-6">
      <PlatformPageHeader
        eyebrow="Plataforma"
        title="Usuarios"
        description="Todas las personas con acceso, sus comercios y su rol en cada uno."
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0 pt-0">
          <PlatformUsersTable
            users={users}
            currentUserId={currentUserId}
            actionState={actionState}
            onGrantPlatformRole={handleGrantPlatformRole}
            onRevokePlatformRole={handleRevokePlatformRole}
            onDisableUser={handleDisableUser}
            onEnableUser={handleEnableUser}
          />
        </CardContent>
      </Card>
    </div>
  );
}
