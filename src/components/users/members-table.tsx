'use client';

import { MoreHorizontalIcon, ShieldIcon, UserMinusIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/users/role-badge';
import type { Role } from '@/types/membership';
import type { User } from '@/types/user';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberRow {
  membershipId: string;
  userId: string;
  role: Role;
  createdAt: number;
  user: User;
}

interface MembersTableProps {
  members: MemberRow[];
  currentUserId: string;
  isOwner: boolean;
  onChangeRole: (membershipId: string, newRole: Role) => void;
  onRemoveMember: (membershipId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(displayName?: string, email?: string): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  return email ? email.slice(0, 2).toUpperCase() : '??';
}

function formatJoinDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Mobile card (small screens) ─────────────────────────────────────────────

interface MemberCardProps {
  member: MemberRow;
  isCurrentUser: boolean;
  isOwner: boolean;
  onChangeRole: (membershipId: string, newRole: Role) => void;
  onRemoveMember: (membershipId: string) => void;
}

function MemberCard({
  member,
  isCurrentUser,
  isOwner,
  onChangeRole,
  onRemoveMember,
}: MemberCardProps) {
  const { user, role, createdAt, membershipId } = member;
  const initials = getInitials(user.displayName, user.email);

  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
      role="listitem"
    >
      <Avatar size="default">
        {user.photoUrl && (
          <AvatarImage src={user.photoUrl} alt={user.displayName ?? user.email} />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.displayName ?? user.email}
              {isCurrentUser && (
                <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                  (vos)
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          {isOwner && !isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Acciones para ${user.displayName ?? user.email}`}
                  />
                }
              >
                <MoreHorizontalIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    onChangeRole(
                      membershipId,
                      role === 'owner' ? 'staff' : 'owner'
                    )
                  }
                >
                  <ShieldIcon aria-hidden="true" />
                  Cambiar a {role === 'owner' ? 'Personal' : 'Propietario'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onRemoveMember(membershipId)}
                >
                  <UserMinusIcon aria-hidden="true" />
                  Quitar del restaurante
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <RoleBadge role={role} />
          <span className="text-xs text-muted-foreground">
            Desde {formatJoinDate(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

/**
 * Renders the list of members of the active restaurant.
 *
 * Layout:
 *   - sm and below: stacked card list (role="list")
 *   - md and above: full <table> with accessible headers
 *
 * Owner-gating:
 *   - isOwner=true → shows DropdownMenu actions (change role, remove)
 *   - isOwner=false → read-only; no action column rendered
 *
 * Firestore seams:
 *   - onChangeRole: currently updates local state only.
 *     TODO: wire Firestore membership update (update role field by membershipId)
 *   - onRemoveMember: currently removes from local state only.
 *     TODO: wire Firestore membership delete (delete document by membershipId)
 */
export function MembersTable({
  members,
  currentUserId,
  isOwner,
  onChangeRole,
  onRemoveMember,
}: MembersTableProps) {
  return (
    <>
      {/* Mobile: card list */}
      <div
        className="md:hidden space-y-3"
        role="list"
        aria-label="Miembros del restaurante"
      >
        {members.map((member) => (
          <MemberCard
            key={member.membershipId}
            member={member}
            isCurrentUser={member.userId === currentUserId}
            isOwner={isOwner}
            onChangeRole={onChangeRole}
            onRemoveMember={onRemoveMember}
          />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Miembro</TableHead>
              <TableHead scope="col">Rol</TableHead>
              <TableHead scope="col">Se unió</TableHead>
              {isOwner && (
                <TableHead scope="col" className="w-12 text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const { user, role, createdAt, membershipId } = member;
              const isCurrentUser = member.userId === currentUserId;
              const initials = getInitials(user.displayName, user.email);

              return (
                <TableRow key={membershipId}>
                  {/* Member identity */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        {user.photoUrl && (
                          <AvatarImage
                            src={user.photoUrl}
                            alt={user.displayName ?? user.email}
                          />
                        )}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {user.displayName ?? user.email}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                              (vos)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <RoleBadge role={role} />
                  </TableCell>

                  {/* Join date */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatJoinDate(createdAt)}
                  </TableCell>

                  {/* Actions — owner only, hidden for self */}
                  {isOwner && (
                    <TableCell className="text-right">
                      {!isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Acciones para ${user.displayName ?? user.email}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon aria-hidden="true" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                onChangeRole(
                                  membershipId,
                                  role === 'owner' ? 'staff' : 'owner'
                                )
                              }
                            >
                              <ShieldIcon aria-hidden="true" />
                              Cambiar a{' '}
                              {role === 'owner' ? 'Personal' : 'Propietario'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onRemoveMember(membershipId)}
                            >
                              <UserMinusIcon aria-hidden="true" />
                              Quitar del restaurante
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
