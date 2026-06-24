'use client';

import { useState } from 'react';
import {
  MoreHorizontalIcon,
  ShieldCheck,
  ShieldOff,
  ShieldPlus,
  UserX,
  UserCheck,
} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/features/members/components/role-badge';
import { UserActionDialog, type UserActionKind } from '@/features/platform/components/user-action-dialog';
import type { PlatformUserRow, UserActionState } from '@/features/platform/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlatformUsersTableProps {
  users: PlatformUserRow[];
  currentUserId: string;
  actionState: UserActionState;
  onGrantPlatformRole: (userId: string) => Promise<void>;
  onRevokePlatformRole: (userId: string) => Promise<void>;
  onDisableUser: (userId: string) => Promise<void>;
  onEnableUser: (userId: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(displayName?: string, email?: string): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return displayName.slice(0, 2).toUpperCase();
  }
  return email ? email.slice(0, 2).toUpperCase() : '??';
}

function getUserLabel(row: PlatformUserRow): string {
  return row.user.displayName ?? row.user.email;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

/** Violet "Plataforma" badge for superadmin users. */
function PlatformBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-violet/10 px-2.5 py-0.5 text-xs font-medium text-brand-violet ring-1 ring-inset ring-brand-violet/20">
      <ShieldCheck className="size-3" aria-hidden="true" />
      Plataforma
    </span>
  );
}

/** Amber "Deshabilitada" badge for disabled accounts — text + icon, never color alone. */
function DisabledBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    >
      <UserX className="size-3" aria-hidden="true" />
      Deshabilitada
    </Badge>
  );
}

// ─── Pending dialog state ─────────────────────────────────────────────────────

interface PendingAction {
  kind: UserActionKind;
  userId: string;
  userName: string;
}

// ─── Actions dropdown ─────────────────────────────────────────────────────────

interface ActionsMenuProps {
  row: PlatformUserRow;
  isSelf: boolean;
  isSubmitting: boolean;
  onRequestAction: (pending: PendingAction) => void;
}

function ActionsMenu({ row, isSelf, isSubmitting, onRequestAction }: ActionsMenuProps) {
  const userName = getUserLabel(row);
  const selfTitle = 'No podés modificar tu propia cuenta';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Acciones para ${userName}`}
            disabled={isSubmitting}
          />
        }
      >
        <MoreHorizontalIcon aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Platform role toggle */}
        {row.isPlatformAdmin ? (
          <DropdownMenuItem
            disabled={isSelf}
            title={isSelf ? selfTitle : undefined}
            aria-label={
              isSelf
                ? `Revocar rol de plataforma a ${userName} — ${selfTitle}`
                : `Revocar rol de plataforma a ${userName}`
            }
            onClick={() =>
              onRequestAction({
                kind: 'revoke-platform-role',
                userId: row.user.id,
                userName,
              })
            }
            variant="destructive"
          >
            <ShieldOff aria-hidden="true" />
            Revocar rol de plataforma
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={isSelf}
            title={isSelf ? selfTitle : undefined}
            aria-label={
              isSelf
                ? `Otorgar rol de plataforma a ${userName} — ${selfTitle}`
                : `Otorgar rol de plataforma a ${userName}`
            }
            onClick={() =>
              onRequestAction({
                kind: 'grant-platform-role',
                userId: row.user.id,
                userName,
              })
            }
          >
            <ShieldPlus aria-hidden="true" />
            Otorgar rol de plataforma
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Account enable / disable toggle */}
        {row.isDisabled ? (
          <DropdownMenuItem
            disabled={isSelf}
            title={isSelf ? selfTitle : undefined}
            aria-label={
              isSelf
                ? `Habilitar cuenta de ${userName} — ${selfTitle}`
                : `Habilitar cuenta de ${userName}`
            }
            onClick={() =>
              onRequestAction({
                kind: 'enable-account',
                userId: row.user.id,
                userName,
              })
            }
          >
            <UserCheck aria-hidden="true" />
            Habilitar cuenta
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={isSelf}
            title={isSelf ? selfTitle : undefined}
            aria-label={
              isSelf
                ? `Deshabilitar cuenta de ${userName} — ${selfTitle}`
                : `Deshabilitar cuenta de ${userName}`
            }
            onClick={() =>
              onRequestAction({
                kind: 'disable-account',
                userId: row.user.id,
                userName,
              })
            }
            variant="destructive"
          >
            <UserX aria-hidden="true" />
            Deshabilitar cuenta
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── User identity cell ───────────────────────────────────────────────────────

function UserIdentityCell({ row }: { row: PlatformUserRow }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="default" className={row.isDisabled ? 'opacity-50' : undefined}>
        {row.user.photoUrl && (
          <AvatarImage
            src={row.user.photoUrl}
            alt={row.user.displayName ?? row.user.email}
          />
        )}
        <AvatarFallback className="bg-muted text-muted-foreground">
          {getInitials(row.user.displayName, row.user.email)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p
          className={
            'text-sm font-medium ' +
            (row.isDisabled ? 'text-muted-foreground' : 'text-foreground')
          }
        >
          {row.user.displayName ?? row.user.email}
        </p>
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {row.user.email}
        </p>
      </div>
    </div>
  );
}

// ─── Access cell ──────────────────────────────────────────────────────────────

function AccessCell({ row }: { row: PlatformUserRow }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {row.isPlatformAdmin && <PlatformBadge />}
      {!row.isPlatformAdmin && (
        <span className="text-sm text-muted-foreground">Comercio</span>
      )}
      {row.isDisabled && <DisabledBadge />}
    </div>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

/**
 * Platform users table with grant/revoke platformRole + disable/enable account
 * actions. The current superadmin cannot act on their own account (safety rail).
 *
 * Actions flow: dropdown item → PendingAction → confirm dialog → handler → hook
 * → service stub (TODO: Firestore).
 */
export function PlatformUsersTable({
  users,
  currentUserId,
  actionState,
  onGrantPlatformRole,
  onRevokePlatformRole,
  onDisableUser,
  onEnableUser,
}: PlatformUsersTableProps) {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isMutating =
    actionState.status === 'submitting' &&
    actionState.userId === pending?.userId;

  function handleRequestAction(action: PendingAction): void {
    setPending(action);
    setDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean): void {
    setDialogOpen(open);
    if (!open) setPending(null);
  }

  async function handleConfirm(): Promise<void> {
    if (!pending) return;
    switch (pending.kind) {
      case 'grant-platform-role':
        await onGrantPlatformRole(pending.userId);
        break;
      case 'revoke-platform-role':
        await onRevokePlatformRole(pending.userId);
        break;
      case 'disable-account':
        await onDisableUser(pending.userId);
        break;
      case 'enable-account':
        await onEnableUser(pending.userId);
        break;
    }
  }

  const globalMutating = actionState.status === 'submitting';

  return (
    <>
      {/* ── Mobile: card list ──────────────────────────────────────────────── */}
      <div
        className="md:hidden space-y-2 p-4"
        role="list"
        aria-label="Usuarios de la plataforma"
      >
        {users.map((row) => {
          const isSelf = row.user.id === currentUserId;
          return (
            <div
              key={row.user.id}
              className={
                'flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-opacity ' +
                (row.isDisabled ? 'opacity-60' : '')
              }
              role="listitem"
              aria-label={
                row.isDisabled
                  ? `${getUserLabel(row)} — cuenta deshabilitada`
                  : getUserLabel(row)
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar size="default" className={row.isDisabled ? 'opacity-50' : undefined}>
                    {row.user.photoUrl && (
                      <AvatarImage
                        src={row.user.photoUrl}
                        alt={row.user.displayName ?? row.user.email}
                      />
                    )}
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {getInitials(row.user.displayName, row.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        'text-sm font-medium truncate ' +
                        (row.isDisabled ? 'text-muted-foreground' : 'text-foreground')
                      }
                    >
                      {row.user.displayName ?? row.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {row.user.email}
                    </p>
                  </div>
                </div>
                <ActionsMenu
                  row={row}
                  isSelf={isSelf}
                  isSubmitting={globalMutating}
                  onRequestAction={handleRequestAction}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {row.isPlatformAdmin && <PlatformBadge />}
                {!row.isPlatformAdmin && (
                  <span className="text-sm text-muted-foreground">Comercio</span>
                )}
                {row.isDisabled && <DisabledBadge />}
              </div>

              <MembershipsCell row={row} />
            </div>
          );
        })}
      </div>

      {/* ── Desktop: table ─────────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="pl-5">Usuario</TableHead>
              <TableHead scope="col">Acceso</TableHead>
              <TableHead scope="col">Comercios</TableHead>
              <TableHead scope="col" className="w-12 pr-4 text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Global error announcement for screen-reader users */}
            {actionState.status === 'error' && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  role="alert"
                  className="px-5 py-2 text-sm text-destructive bg-destructive/5"
                >
                  {actionState.message}
                </TableCell>
              </TableRow>
            )}

            {users.map((row) => {
              const isSelf = row.user.id === currentUserId;
              return (
                <TableRow
                  key={row.user.id}
                  className={
                    'group/row transition-colors hover:bg-muted/40 ' +
                    (row.isDisabled ? 'opacity-60' : '')
                  }
                  aria-label={
                    row.isDisabled
                      ? `${getUserLabel(row)} — cuenta deshabilitada`
                      : undefined
                  }
                >
                  <TableCell className="pl-5">
                    <UserIdentityCell row={row} />
                  </TableCell>
                  <TableCell>
                    <AccessCell row={row} />
                  </TableCell>
                  <TableCell>
                    <MembershipsCell row={row} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <ActionsMenu
                      row={row}
                      isSelf={isSelf}
                      isSubmitting={globalMutating}
                      onRequestAction={handleRequestAction}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Confirm dialog ─────────────────────────────────────────────────── */}
      <UserActionDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        kind={pending?.kind ?? null}
        userName={pending?.userName ?? ''}
        isMutating={isMutating}
        onConfirm={handleConfirm}
      />
    </>
  );
}
