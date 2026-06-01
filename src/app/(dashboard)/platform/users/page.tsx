'use client';

import { usePlatformUsers } from '@/features/platform/hooks/use-platform-users';
import { PlatformPageHeader } from '@/features/platform/components/platform-page-header';
import { PlatformUsersTable } from '@/features/platform/components/platform-users-table';
import { Card, CardContent } from '@/components/ui/card';

/**
 * /platform/users — every user across the whole platform, with the restaurants
 * they belong to and whether they hold a platform role.
 *
 * Thin orchestrator: delegates state to usePlatformUsers(). Read-only for now.
 */
export default function PlatformUsersPage() {
  const { users } = usePlatformUsers();

  return (
    <div className="flex flex-col gap-6">
      <PlatformPageHeader
        eyebrow="Plataforma"
        title="Usuarios"
        description="Todas las personas con acceso, sus comercios y su rol en cada uno."
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0 pt-0">
          <PlatformUsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
