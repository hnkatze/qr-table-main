import { UtensilsCrossedIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Shown when there is no active restaurant selected.
 */
export function NoRestaurantMenuState() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-muted"
          >
            <UtensilsCrossedIcon className="size-6 text-muted-foreground" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Sin restaurante seleccionado
            </h2>
            <p className="text-sm text-muted-foreground">
              Seleccioná un restaurante desde el menú lateral para ver y editar
              su carta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
