import { TableQrCard } from '@/features/tables/components/table-qr-card';
import type { TableCard } from '@/features/tables/types';

interface TablesGridProps {
  tableCards: TableCard[];
  restaurantSlug: string;
  restaurantName: string;
  isOwner: boolean;
  onDeleteTable: (tableId: string) => void;
}

/**
 * Responsive grid of TableQrCard components.
 *
 * Layout:
 *   - 1 col on mobile
 *   - 2 cols at sm
 *   - 3 cols at lg
 *   - 4 cols at xl
 *
 * Uses role="list" so assistive technologies announce it as a list of items.
 * Each TableQrCard renders an <article> with aria-label for screen readers.
 */
export function TablesGrid({
  tableCards,
  restaurantSlug,
  restaurantName,
  isOwner,
  onDeleteTable,
}: TablesGridProps) {
  return (
    <ul
      role="list"
      aria-label="Mesas del restaurante"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {tableCards.map((tableCard) => (
        <li key={tableCard.table.id} className="flex">
          <TableQrCard
            tableCard={tableCard}
            restaurantSlug={restaurantSlug}
            restaurantName={restaurantName}
            isOwner={isOwner}
            onDelete={onDeleteTable}
          />
        </li>
      ))}
    </ul>
  );
}
