/**
 * Formats an epoch-ms timestamp as a human-readable date in Spanish (es-HN).
 * Pure function — no side effects.
 *
 *   formatPeriodEnd(1788000000000) → '29 ago 2026'
 */
export function formatPeriodEnd(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
