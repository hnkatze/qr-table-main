import type { Plan } from '@/types/plan';
import type { PlanFields } from '@/features/platform/types';

/** Empty form fields for creating a new plan (active by default). */
export const EMPTY_PLAN_FIELDS: PlanFields = {
  name: '',
  priceMonthly: '',
  description: '',
  maxTables: '',
  maxMenuItems: '',
  isActive: true,
};

/** Pre-fills the plan form from an existing plan (edit mode). Pure. */
export function planToFields(plan: Plan): PlanFields {
  return {
    name: plan.name,
    priceMonthly: String(plan.priceMonthly),
    description: plan.description ?? '',
    maxTables: String(plan.limits.maxTables),
    maxMenuItems: String(plan.limits.maxMenuItems),
    isActive: plan.isActive,
  };
}
