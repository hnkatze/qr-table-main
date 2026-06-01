import { ShieldCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/features/members/components/role-badge';
import type { PlatformUserRow } from '@/features/platform/types';

interface PlatformUsersTableProps {
  users: PlatformUserRow[];
}

function getInitials(displayName?: string, email?: string): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return displayName.slice(0, 2).toUpperCase();
  }
  return email ? email.slice(0, 2).toUpperCase() : '??';
}

/** Renders the restaurants a user belongs to, each with its role badge. */
function MembershipsCell({ row }: { row: PlatformUserRow }) {
  if (row.memberships.length === 0) {
    return <span className="text-sm text-muted-foreground">Sin comercios</span>;
  }
  return (
    <ul className="flex flex-col gap-1" role="list">
      {row.memberships.map((m) => (
        <li key={m.restaurantId} className="flex items-center gap-2">
          <span className="text-sm text-foreground">{m.restaurantName}</span>
          <RoleBadge role={m.role} />
        </li>
      ))}
    </ul>
  );
}

function PlatformBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-violet/10 px-2.5 py-0.5 text-xs font-medium text-brand-violet ring-1 ring-inset ring-brand-violet/20">
      <ShieldCheck className="size-3" aria-hidden="true" />
      Plataforma
    </span>
  );
}

/**
 * All platform users, each shown once with their cross-restaurant memberships.
 * Platform admins are flagged with a violet "Plataforma" badge. Read-only today.
 */
export function PlatformUsersTable({ users }: PlatformUsersTableProps) {
  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden space-y-2 p-4" role="list" aria-label="Usuarios de la plataforma">
        {users.map((row) => (
          <div
            key={row.user.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            role="listitem"
          >
            <div className="flex items-center gap-3">
              <Avatar size="default">
                {row.user.photoUrl && (
                  <AvatarImage src={row.user.photoUrl} alt={row.user.displayName ?? row.user.email} />
                )}
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {getInitials(row.user.displayName, row.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {row.user.displayName ?? row.user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">{row.user.email}</p>
              </div>
              {row.isPlatformAdmin && <PlatformBadge />}
            </div>
            <MembershipsCell row={row} />
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="pl-5">Usuario</TableHead>
              <TableHead scope="col">Acceso</TableHead>
              <TableHead scope="col">Comercios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((row) => (
              <TableRow key={row.user.id} className="transition-colors hover:bg-muted/40">
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <Avatar size="default">
                      {row.user.photoUrl && (
                        <AvatarImage src={row.user.photoUrl} alt={row.user.displayName ?? row.user.email} />
                      )}
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {getInitials(row.user.displayName, row.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {row.user.displayName ?? row.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {row.user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {row.isPlatformAdmin ? (
                    <PlatformBadge />
                  ) : (
                    <span className="text-sm text-muted-foreground">Comercio</span>
                  )}
                </TableCell>
                <TableCell><MembershipsCell row={row} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
