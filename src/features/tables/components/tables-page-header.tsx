import { AddTableDialog } from '@/features/tables/components/add-table-dialog';
import { AddZoneDialog } from '@/features/tables/components/add-zone-dialog';
import { TableLimitBadge } from '@/features/tables/components/table-limit-badge';
import type { ZoneOption, TableLimitInfo } from '@/features/tables/types';

interface TablesPageHeaderProps {
  restaurantName: string | null;
  isOwner: boolean;
  existingNumbers: number[];
  suggestedNumber: number;
  zones: ZoneOption[];
  existingZoneNames: string[];
  /** Plan-based table usage; controls the meter + disables "Agregar mesa" at limit. */
  tableLimit?: TableLimitInfo;
  onCreateTable: (tableNumber: number, zoneId?: string) => Promise<void>;
  onCreateZone: (name: string) => Promise<void>;
}

/**
 * Page-level header for the /tables route.
 * Eyebrow + title + description + conditional "Agregar zona" / "Agregar mesa"
 * actions (owner-only) + a plan-usage meter. Pure presentational.
 */
export function TablesPageHeader({
  restaurantName,
  isOwner,
  existingNumbers,
  suggestedNumber,
  zones,
  existingZoneNames,
  tableLimit,
  onCreateTable,
  onCreateZone,
}: TablesPageHeaderProps) {
  const atLimit = tableLimit?.isAtLimit ?? false;

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {/* Eyebrow — matches bento dashboard visual language */}
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-sky">
            <span
              className="inline-block h-1.5 w-4 rounded-full bg-brand-sky"
              aria-hidden="true"
            />
            {restaurantName ?? 'Restaurante'}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mesas y QR
          </h1>
          <p className="text-sm text-muted-foreground">
            {restaurantName
              ? `Administrá las mesas de ${restaurantName} por zona y compartí sus códigos QR con los clientes.`
              : 'Seleccioná un restaurante para ver sus mesas.'}
          </p>
        </div>

        {isOwner && restaurantName && (
          <div className="flex flex-wrap items-center gap-2">
            {tableLimit && <TableLimitBadge limit={tableLimit} />}
            <AddZoneDialog
              existingNames={existingZoneNames}
              onCreateZone={onCreateZone}
            />
            <AddTableDialog
              existingNumbers={existingNumbers}
              zones={zones}
              suggestedNumber={suggestedNumber}
              atLimit={atLimit}
              onCreateTable={onCreateTable}
            />
          </div>
        )}
      </div>

      {/* Upgrade hint when the plan's table ceiling is reached. */}
      {isOwner && atLimit && (
        <p
          role="note"
          className="rounded-lg border border-brand-amber/20 bg-brand-amber/10 px-3 py-2 text-xs text-brand-amber"
        >
          Llegaste al límite de {tableLimit?.max} mesas de tu plan. Subí de plan
          para agregar más.
        </p>
      )}
    </header>
  );
}
