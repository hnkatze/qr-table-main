'use client';

import { Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableQrCard } from '@/features/tables/components/table-qr-card';
import { NO_ZONE_LABEL } from '@/features/tables/constants';
import type { ZoneGroup } from '@/features/tables/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ZoneSectionProps {
  group: ZoneGroup;
  restaurantPublicId: string;
  restaurantName: string;
  isOwner: boolean;
  onDeleteTable: (tableId: string) => void;
  onDeleteZone: (zoneId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tableCountLabel(count: number): string {
  return count === 1 ? '1 mesa' : `${count} mesas`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * One zone section: a heading (zone name + table-count badge, plus an owner-only
 * "Eliminar zona" affordance) followed by a flex-wrap list of TableQrCards.
 *
 * The "Sin zona" group (group.zone === null) uses a muted/neutral heading and
 * has no delete affordance — it is not a real zone, just the catch-all bucket.
 *
 * a11y:
 *   - The whole block is a <section> labelled by its <h2> via aria-labelledby.
 *   - The card list is a role="list" of fixed-width (w-72) items.
 *   - The delete-zone button reassigns tables to "Sin zona" (handled upstream).
 */
export function ZoneSection({
  group,
  restaurantPublicId,
  restaurantName,
  isOwner,
  onDeleteTable,
  onDeleteZone,
}: ZoneSectionProps) {
  const { zone, tables } = group;
  const isNoZone = zone === null;
  const headingId = isNoZone ? 'zone-no-zone-heading' : `zone-${zone.id}-heading`;
  const title = isNoZone ? NO_ZONE_LABEL : zone.name;

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Zone accent dot — sky for real zones, muted for "Sin zona" */}
          <span
            className={
              isNoZone
                ? 'inline-block size-2 shrink-0 rounded-full bg-muted-foreground/40'
                : 'inline-block size-2 shrink-0 rounded-full bg-brand-sky'
            }
            aria-hidden="true"
          />
          <h2
            id={headingId}
            className={
              isNoZone
                ? 'text-base font-semibold text-muted-foreground'
                : 'text-base font-semibold text-foreground'
            }
          >
            {title}
          </h2>
          <span
            className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            aria-label={tableCountLabel(tables.length)}
          >
            {tableCountLabel(tables.length)}
          </span>
        </div>

        {isOwner && !isNoZone && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
            aria-label={`Eliminar zona ${title}. Las mesas pasarán a Sin zona.`}
            onClick={() => onDeleteZone(zone.id)}
          >
            <Trash2Icon aria-hidden="true" />
            <span className="hidden sm:inline">Eliminar zona</span>
          </Button>
        )}
      </div>

      <ul
        role="list"
        aria-label={`Mesas de ${title}`}
        className="flex flex-wrap items-start gap-4"
      >
        {tables.map((tableCard) => (
          <li key={tableCard.table.id} className="w-72">
            <TableQrCard
              tableCard={tableCard}
              restaurantPublicId={restaurantPublicId}
              restaurantName={restaurantName}
              isOwner={isOwner}
              onDelete={onDeleteTable}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
