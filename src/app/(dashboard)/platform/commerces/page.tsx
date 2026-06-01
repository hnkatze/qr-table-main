'use client';

import { useCommerces } from '@/features/platform/hooks/use-commerces';
import { PlatformPageHeader } from '@/features/platform/components/platform-page-header';
import { CommercesStatStrip } from '@/features/platform/components/commerces-stat-strip';
import { CommercesTable } from '@/features/platform/components/commerces-table';
import { Card, CardContent } from '@/components/ui/card';

/**
 * /platform/commerces — every tenant (commerce) on the platform.
 *
 * Thin orchestrator: delegates all state to useCommerces() and renders
 * presentational components. Platform-admin access is enforced by the
 * platform layout guard.
 */
export default function CommercesPage() {
  const { commerces, handleSuspend, handleReactivate } = useCommerces();

  return (
    <div className="flex flex-col gap-6">
      <PlatformPageHeader
        eyebrow="Plataforma"
        title="Comercios"
        description="Todos los restaurantes suscritos a Mesa, sus planes y su estado."
      />

      <CommercesStatStrip commerces={commerces} />

      <Card className="overflow-hidden">
        <CardContent className="p-0 pt-0">
          <CommercesTable
            commerces={commerces}
            onSuspend={handleSuspend}
            onReactivate={handleReactivate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
