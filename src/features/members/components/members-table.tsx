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
import { RoleBadge } from '@/features/members/components/role-badge';
import type { MemberRow, Role } from '@/features/members/types';

// ─── Props ────────────────────────────────────────────────────────────────────

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

/**
 * Returns avatar fallback color classes based on the first letter of the name/email.
 * Two categories — keeps things simple and token-based.
 */
function getAvatarAccent(name: string): string {
  const code = name.charCodeAt(0) % 4;
  const map: Record<number, string> = {
    0: 'bg-brand-emerald/15 text-brand-emerald',
    1: 'bg-brand-sky/15 text-brand-sky',
    2: 'bg-brand-violet/15 text-brand-violet',
    3: 'bg-brand-amber/15 text-brand-amber',
  };
  return map[code] ?? 'bg-muted text-muted-foreground';
}

// ─── Actions dropdown ─────────────────────────────────────────────────────────

interface ActionsMenuProps {
  membershipId: string;
  displayName: string;
  role: Role;
  onChangeRole: (membershipId: string, newRole: Role) => void;
  onRemoveMember: (membershipId: string) => void;
}

function ActionsMenu({
  membershipId,
  displayName,
  role,
  onChangeRole,
  onRemoveMember,
}: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Acciones para ${displayName}`}
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
            onChangeRole(membershipId, role === 'owner' ? 'staff' : 'owner')
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
  );
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
  const avatarAccent = getAvatarAccent(user.displayName ?? user.email);

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-sm"
      role="listitem"
    >
      {/* Avatar */}
      <Avatar size="default">
        {user.photoUrl && (
          <AvatarImage src={user.photoUrl} alt={user.displayName ?? user.email} />
        )}
        <AvatarFallback className={avatarAccent}>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Top: name + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.displayName ?? user.email}
              {isCurrentUser && (
                <span className="ml-1.5 rounded-full bg-brand-emerald/10 px-1.5 py-px text-xs font-medium text-brand-emerald leading-none">
                  vos
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          {isOwner && !isCurrentUser && (
            <ActionsMenu
              membershipId={membershipId}
              displayName={user.displayName ?? user.email}
              role={role}
              onChangeRole={onChangeRole}
              onRemoveMember={onRemoveMember}
            />
          )}
        </div>

        {/* Bottom: role badge + join date */}
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
        className="md:hidden space-y-2 p-4"
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
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="pl-5">Miembro</TableHead>
              <TableHead scope="col">Rol</TableHead>
              <TableHead scope="col">Se unió</TableHead>
              {isOwner && (
                <TableHead scope="col" className="w-12 pr-4 text-right">
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
              const avatarAccent = getAvatarAccent(user.displayName ?? user.email);

              return (
                <TableRow
                  key={membershipId}
                  className="group/row transition-colors hover:bg-muted/40"
                >
                  {/* Member identity */}
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        {user.photoUrl && (
                          <AvatarImage
                            src={user.photoUrl}
                            alt={user.displayName ?? user.email}
                          />
                        )}
                        <AvatarFallback className={avatarAccent}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          {user.displayName ?? user.email}
                          {isCurrentUser && (
                            <span
                              className="rounded-full bg-brand-emerald/10 px-1.5 py-px text-xs font-medium text-brand-emerald leading-none"
                              aria-label="Este sos vos"
                            >
                              vos
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
                    <TableCell className="pr-4 text-right">
                      {!isCurrentUser && (
                        <ActionsMenu
                          membershipId={membershipId}
                          displayName={user.displayName ?? user.email}
                          role={role}
                          onChangeRole={onChangeRole}
                          onRemoveMember={onRemoveMember}
                        />
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
