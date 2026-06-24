'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { useCommerceDetail } from '@/features/platform/hooks/use-commerce-detail';
import { usePlans } from '@/features/platform/hooks/use-plans';
import { CommerceDetailHeader } from '@/features/platform/components/commerce-detail-header';
import { CommerceSubscriptionCard } from '@/features/platform/components/commerce-subscription-card';
import { CommerceUsageCard } from '@/features/platform/components/commerce-usage-card';
import { CommerceMembersCard } from '@/features/platform/components/commerce-members-card';
import { CommerceDangerZone } from '@/features/platform/components/commerce-danger-zone';

interface CommerceDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * /platform/commerces/[id] — drill-down for a single commerce (tenant).
 *
 * Thin orchestrator: delegates all state to useCommerceDetail() + usePlans()
 * and renders presentational components. Platform-admin access is enforced
 * by the parent platform layout guard.
 */
export default function CommerceDetailPage({ params }: CommerceDetailPageProps) {
  const { id } = use(params);

  const {
    detail,
    actionState,
    changePlanDialog,
    openChangePlan,
    selectPlan,
    confirmPlan,
    backToPicking,
    closeChangePlan,
    handleChangePlan,
    handleSuspend,
    handleReactivate,
  } = useCommerceDetail(id);

  // Plan catalog — only active plans are offered for assignment.
  const { plans } = usePlans();
  const activePlans = plans.filter((p) => p.isActive);

  // Unknown id → friendly not-found state.
  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-4xl font-bold text-muted-foreground/40" aria-hidden="true">
          404
        </p>
        <h1 className="text-lg font-semibold text-foreground">Comercio no encontrado</h1>
        <p className="text-sm text-muted-foreground">
          No existe ningún comercio con el ID{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{id}</code>.
        </p>
        <Link
          href="/platform/commerces"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-violet hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Volver a comercios
        </Link>
      </div>
    );
  }

  const isSubmitting = actionState.status === 'submitting';

  return (
    <div className="flex flex-col gap-6">
      {/* Header: name, status badge, publicId, back link */}
      <CommerceDetailHeader detail={detail} />

      {/* Two-column layout on large screens */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column: subscription + usage */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <CommerceSubscriptionCard
            detail={detail}
            availablePlans={activePlans}
            changePlanDialog={changePlanDialog}
            isSubmitting={isSubmitting}
            onOpenChangePlan={openChangePlan}
            onSelectPlan={selectPlan}
            onConfirmPlan={confirmPlan}
            onBackToPicking={backToPicking}
            onCloseChangePlan={closeChangePlan}
            onCommitPlan={handleChangePlan}
          />

          <CommerceUsageCard detail={detail} />
        </div>

        {/* Right column: members + danger zone */}
        <div className="flex flex-col gap-4">
          <CommerceMembersCard members={detail.members} />

          <CommerceDangerZone
            restaurantName={detail.restaurant.name}
            status={detail.status}
            actionState={actionState}
            onSuspend={handleSuspend}
            onReactivate={handleReactivate}
          />
        </div>
      </div>
    </div>
  );
}
