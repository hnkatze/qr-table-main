import { useState } from 'react';
import type { Plan } from '@/types/plan';
import type { PlanFields } from '@/features/platform/types';
import {
  getPlansSnapshot,
  createPlan,
  updatePlan,
  setPlanActive,
} from '@/features/platform/services/platform.service';
import { shortId } from '@/lib/id';

export interface UsePlansOutput {
  /** Plan catalog, sorted by monthly price ascending. */
  plans: Plan[];
  /** True while any async plan mutation is in flight. */
  isMutating: boolean;
  handleCreatePlan: (fields: PlanFields) => Promise<void>;
  handleEditPlan: (planId: string, fields: PlanFields) => Promise<void>;
  /** Soft-toggle a plan's availability for new subscriptions. */
  handleToggleActive: (planId: string, isActive: boolean) => void;
}

/** Parses string form fields into a domain-shaped plan body. */
function fieldsToPlanBody(fields: PlanFields): Omit<Plan, 'id'> {
  return {
    name: fields.name.trim(),
    priceMonthly: Number.parseFloat(fields.priceMonthly) || 0,
    description: fields.description.trim() || undefined,
    limits: {
      maxTables: Number.parseInt(fields.maxTables, 10) || 0,
      maxMenuItems: Number.parseInt(fields.maxMenuItems, 10) || 0,
    },
    isActive: fields.isActive,
  };
}

/**
 * Encapsulates the platform plan-catalog state. Seeds synchronously and applies
 * CRUD optimistically (the service is a no-op today). API surface is stable for
 * the eventual Firestore swap.
 */
export function usePlans(): UsePlansOutput {
  const [plans, setPlans] = useState<Plan[]>(() => getPlansSnapshot());
  const [isMutating, setIsMutating] = useState(false);

  function withMutation(fn: () => Promise<void>): Promise<void> {
    setIsMutating(true);
    return fn().finally(() => setIsMutating(false));
  }

  function sortByPrice(list: Plan[]): Plan[] {
    return [...list].sort((a, b) => a.priceMonthly - b.priceMonthly);
  }

  async function handleCreatePlan(fields: PlanFields): Promise<void> {
    const newPlan: Plan = { id: shortId('plan'), ...fieldsToPlanBody(fields) };
    setPlans((prev) => sortByPrice([...prev, newPlan]));
    await withMutation(() => createPlan(fields));
  }

  async function handleEditPlan(planId: string, fields: PlanFields): Promise<void> {
    setPlans((prev) =>
      sortByPrice(
        prev.map((p) => (p.id === planId ? { id: p.id, ...fieldsToPlanBody(fields) } : p))
      )
    );
    await withMutation(() => updatePlan(planId, fields));
  }

  function handleToggleActive(planId: string, isActive: boolean): void {
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, isActive } : p)));
    // Fire-and-forget — feels instant; TODO: rollback on error when Firestore lands.
    void setPlanActive(planId, isActive);
  }

  return { plans, isMutating, handleCreatePlan, handleEditPlan, handleToggleActive };
}
