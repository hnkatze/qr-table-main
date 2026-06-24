import type { UsageInfo } from '@/features/subscription/types';

/**
 * Pure transform: current usage count + plan limit → UsageInfo view-model.
 *
 * When `max` is null (the restaurant's plan can't be resolved), no ceiling is
 * enforced — the UI shows a plain count with no progress meter.
 *
 *   deriveUsage(3, 5)   → { used: 3, max: 5, fraction: 0.6, isAtLimit: false }
 *   deriveUsage(5, 5)   → { used: 5, max: 5, fraction: 1,   isAtLimit: true  }
 *   deriveUsage(3, null) → { used: 3, max: null, fraction: null, isAtLimit: false }
 */
export function deriveUsage(used: number, max: number | null): UsageInfo {
  if (max === null) {
    return { used, max: null, fraction: null, isAtLimit: false };
  }
  const clampedUsed = Math.min(used, max);
  return {
    used: clampedUsed,
    max,
    fraction: max > 0 ? clampedUsed / max : 0,
    isAtLimit: used >= max,
  };
}
