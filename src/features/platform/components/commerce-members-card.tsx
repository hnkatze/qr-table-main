import { Users2Icon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/features/members/components/role-badge';
import type { CommerceMemberRow } from '@/features/platform/types';

interface CommerceMembersCardProps {
  members: CommerceMemberRow[];
}

/**
 * Read-only list of all users with a membership in this restaurant.
 * Shows name, email and role badge. No mutations from this view.
 */
export function CommerceMembersCard({ members }: CommerceMembersCardProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users2Icon className="size-4 text-brand-violet" aria-hidden="true" />
          Miembros
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {members.length}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-2 p-0">
        {members.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            Este comercio no tiene miembros registrados.
          </p>
        ) : (
          <ul role="list" className="divide-y divide-border">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.email}
                  </p>
                </div>
                <RoleBadge role={member.role} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
