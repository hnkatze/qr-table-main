import { QrCodeIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TablesEmptyStateProps {
  /** When true, an owner-specific CTA hint is shown. */
  isOwner: boolean;
}

/**
 * Empty state shown when the restaurant has no tables yet.
 * Pure presentational — no props for actions (the CTA is the header button).
 */
export function TablesEmptyState({ isOwner }: TablesEmptyStateProps) {
  return (
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <div className="flex justify-center mb-3">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-sky/10 ring-1 ring-brand-sky/20">
            <QrCodeIcon className="size-6 text-brand-sky" aria-hidden="true" />
          </span>
        </div>
        <CardTitle>Sin mesas todavía</CardTitle>
        <CardDescription>
          {isOwner
            ? 'Agregá la primera mesa y compartí su código QR con los clientes para que puedan ver el menú.'
            : 'Este restaurante todavía no tiene mesas configuradas.'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
