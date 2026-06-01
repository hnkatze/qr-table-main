import { StoreIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * Empty state shown when no restaurant is selected.
 * Pure presentational — no props, no state.
 */
export function NoRestaurantState() {
  return (
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <div className="flex justify-center mb-3">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
            <StoreIcon className="size-6 text-muted-foreground" aria-hidden="true" />
          </span>
        </div>
        <CardTitle>Sin restaurante activo</CardTitle>
        <CardDescription>
          Seleccioná un restaurante desde el panel lateral para ver sus mesas.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
