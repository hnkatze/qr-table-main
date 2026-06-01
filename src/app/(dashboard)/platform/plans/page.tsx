'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { usePlans } from '@/features/platform/hooks/use-plans';
import { PlatformPageHeader } from '@/features/platform/components/platform-page-header';
import { PlanCard } from '@/features/platform/components/plan-card';
import { PlanDialog } from '@/features/platform/components/plan-dialog';
import {
  EMPTY_PLAN_FIELDS,
  planToFields,
} from '@/features/platform/mappers/plan-fields.mapper';
import { Button } from '@/components/ui/button';
import type { Plan } from '@/types/plan';
import type { PlanFields } from '@/features/platform/types';

/**
 * /platform/plans — the plan catalog the platform admin manages.
 *
 * Thin orchestrator: usePlans() owns the catalog state; this page only wires
 * the create/edit dialog open state and renders presentational cards.
 */
export default function PlansPage() {
  const { plans, isMutating, handleCreatePlan, handleEditPlan, handleToggleActive } =
    usePlans();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  function openCreate(): void {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(plan: Plan): void {
    setEditing(plan);
    setDialogOpen(true);
  }

  async function handleSave(fields: PlanFields): Promise<void> {
    if (editing) {
      await handleEditPlan(editing.id, fields);
    } else {
      await handleCreatePlan(fields);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PlatformPageHeader
        eyebrow="Plataforma"
        title="Planes"
        description="Definí los precios y límites que rigen a cada comercio."
        action={
          <Button
            onClick={openCreate}
            className="gap-2 bg-brand-violet text-white hover:bg-brand-violet/90 focus-visible:ring-brand-violet/40"
          >
            <PlusIcon aria-hidden="true" className="size-4" />
            Nuevo plan
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={openEdit}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>

      <PlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editing ? 'edit' : 'create'}
        initialFields={editing ? planToFields(editing) : EMPTY_PLAN_FIELDS}
        isMutating={isMutating}
        onSave={handleSave}
      />
    </div>
  );
}
