import type { PlanLimits } from '@/types/plan';
import type { TableLimitInfo } from '@/features/tables/types';

/**
 * Pure transform: current table count + the plan's limits → a usage view-model.
 *
 * When `limits` is null (the restaurant's plan can't be resolved), no ceiling is
 * enforced — the UI shows a plain count and the add action stays enabled. This
 * is the seam where a tenant feature consults PLATFORM data (the plan catalog)
 * without owning it.
 */
export function deriveTableLimit(
  used: number,
  limits: PlanLimits | null
): TableLimitInfo {
  if (!limits) {
    return { used, max: null, remaining: null, isAtLimit: false };
  }
  const remaining = Math.max(0, limits.maxTables - used);
  return {
    used,
    max: limits.maxTables,
    remaining,
    isAtLimit: used >= limits.maxTables,
  };
}
