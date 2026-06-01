import { AddTableDialog } from '@/features/tables/components/add-table-dialog';
import { AddZoneDialog } from '@/features/tables/components/add-zone-dialog';
import type { ZoneOption } from '@/features/tables/types';

interface TablesPageHeaderProps {
  restaurantName: string | null;
  isOwner: boolean;
  existingNumbers: number[];
  suggestedNumber: number;
  zones: ZoneOption[];
  existingZoneNames: string[];
  onCreateTable: (tableNumber: number, zoneId?: string) => Promise<void>;
  onCreateZone: (name: string) => Promise<void>;
}

/**
 * Page-level header for the /tables route.
 * Eyebrow + title + description + conditional "Agregar zona" / "Agregar mesa"
 * actions (owner-only). Pure presentational — interactivity is delegated.
 */
export function TablesPageHeader({
  restaurantName,
  isOwner,
  existingNumbers,
  suggestedNumber,
  zones,
  existingZoneNames,
  onCreateTable,
  onCreateZone,
}: TablesPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
          <AddZoneDialog
            existingNames={existingZoneNames}
            onCreateZone={onCreateZone}
          />
          <AddTableDialog
            existingNumbers={existingNumbers}
            zones={zones}
            suggestedNumber={suggestedNumber}
            onCreateTable={onCreateTable}
          />
        </div>
      )}
    </header>
  );
}
