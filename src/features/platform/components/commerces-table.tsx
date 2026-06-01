'use client';

import { MoreHorizontalIcon, BanIcon, RotateCcwIcon, QrCode, Users } from 'lucide-react';
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
import { SubscriptionBadge } from '@/features/platform/components/subscription-badge';
import { formatMoney } from '@/features/platform/mappers/format-money.mapper';
import type { CommerceRow } from '@/features/platform/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommercesTableProps {
  commerces: CommerceRow[];
  onSuspend: (restaurantId: string) => void;
  onReactivate: (restaurantId: string) => void;
}

// ─── Actions dropdown ─────────────────────────────────────────────────────────

interface ActionsMenuProps {
  row: CommerceRow;
  onSuspend: (restaurantId: string) => void;
  onReactivate: (restaurantId: string) => void;
}

function ActionsMenu({ row, onSuspend, onReactivate }: ActionsMenuProps) {
  const { restaurant, status } = row;
  const isCanceled = status === 'canceled';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Acciones para ${restaurant.name}`}
          />
        }
      >
        <MoreHorizontalIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isCanceled ? (
          <DropdownMenuItem onClick={() => onReactivate(restaurant.id)}>
            <RotateCcwIcon aria-hidden="true" />
            Reactivar comercio
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem variant="destructive" onClick={() => onSuspend(restaurant.id)}>
            <BanIcon aria-hidden="true" />
            Suspender comercio
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Plan + price cell ────────────────────────────────────────────────────────

function PlanCell({ row }: { row: CommerceRow }) {
  if (!row.plan) {
    return <span className="text-sm text-muted-foreground">Sin plan</span>;
  }
  return (
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">{row.plan.name}</p>
      <p className="text-xs text-muted-foreground">
        {formatMoney(row.plan.priceMonthly)} / mes
      </p>
    </div>
  );
}

function OwnerCell({ row }: { row: CommerceRow }) {
  if (!row.owner) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  const extra = row.ownerCount > 1 ? ` +${row.ownerCount - 1}` : '';
  return (
    <div className="min-w-0">
      <p className="text-sm text-foreground truncate max-w-[180px]">
        {row.owner.displayName ?? row.owner.email}
        {extra && <span className="text-muted-foreground">{extra}</span>}
      </p>
      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
        {row.owner.email}
      </p>
    </div>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function CommerceCard({ row, onSuspend, onReactivate }: ActionsMenuProps) {
  const { restaurant, status, tableCount, memberCount } = row;
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      role="listitem"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{restaurant.name}</p>
          {restaurant.tagline && (
            <p className="text-xs text-muted-foreground truncate">{restaurant.tagline}</p>
          )}
        </div>
        <ActionsMenu row={row} onSuspend={onSuspend} onReactivate={onReactivate} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SubscriptionBadge status={status} />
        {row.plan && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {row.plan.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <QrCode className="size-3.5" aria-hidden="true" />
          {tableCount} mesas
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" aria-hidden="true" />
          {memberCount} miembros
        </span>
      </div>

      <OwnerCell row={row} />
    </div>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

/**
 * Renders every commerce (tenant) on the platform.
 *   - sm and below: stacked card list
 *   - md and above: full <table>
 *
 * Actions (suspend/reactivate) are always available — this is the platform
 * admin view. Firestore seams live in the service/hook, not here.
 */
export function CommercesTable({ commerces, onSuspend, onReactivate }: CommercesTableProps) {
  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden space-y-2 p-4" role="list" aria-label="Comercios">
        {commerces.map((row) => (
          <CommerceCard
            key={row.restaurant.id}
            row={row}
            onSuspend={onSuspend}
            onReactivate={onReactivate}
          />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="pl-5">Comercio</TableHead>
              <TableHead scope="col">Plan</TableHead>
              <TableHead scope="col">Estado</TableHead>
              <TableHead scope="col">Dueño</TableHead>
              <TableHead scope="col" className="text-right">Mesas</TableHead>
              <TableHead scope="col" className="text-right">Miembros</TableHead>
              <TableHead scope="col" className="w-12 pr-4 text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commerces.map((row) => (
              <TableRow
                key={row.restaurant.id}
                className="group/row transition-colors hover:bg-muted/40"
              >
                <TableCell className="pl-5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{row.restaurant.name}</p>
                    {row.restaurant.tagline && (
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {row.restaurant.tagline}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell><PlanCell row={row} /></TableCell>
                <TableCell><SubscriptionBadge status={row.status} /></TableCell>
                <TableCell><OwnerCell row={row} /></TableCell>
                <TableCell className="text-right text-sm tabular-nums text-foreground">
                  {row.tableCount}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-foreground">
                  {row.memberCount}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <ActionsMenu row={row} onSuspend={onSuspend} onReactivate={onReactivate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
