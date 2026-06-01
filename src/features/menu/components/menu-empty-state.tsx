import { UtensilsCrossedIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MenuEmptyStateProps {
  restaurantName: string;
  isOwner: boolean;
}

/**
 * Empty state shown when a restaurant has no categories yet.
 */
export function MenuEmptyState({ restaurantName, isOwner }: MenuEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-brand-violet/10"
          >
            <UtensilsCrossedIcon className="size-6 text-brand-violet" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              {restaurantName} no tiene categorías aún
            </h2>
            <p className="text-sm text-muted-foreground">
              {isOwner
                ? 'Creá tu primera categoría para empezar a armar el menú.'
                : 'Cuando el propietario agregue categorías, aparecerán aquí.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
