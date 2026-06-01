/**
 * A subscription plan in the platform catalog.
 *
 * Plans are DATA the platform owner (superadmin) manages — not hard-coded
 * constants — because their price and limits change over time and gate tenant
 * features (e.g. a restaurant on the "Básico" plan can only create `maxTables`
 * tables). See `.claude/rules/data-conventions.md`.
 */

/** Usage ceilings enforced on a restaurant subscribed to a given plan. */
export interface PlanLimits {
  /** Max tables a restaurant on this plan may create. */
  maxTables: number;
  /** Max menu products a restaurant on this plan may have across all categories. */
  maxMenuItems: number;
}

export interface Plan {
  id: string;
  /** Display name shown to commerces, e.g. "Básico", "Medium", "Pro". */
  name: string;
  /** Monthly price in the platform's billing currency (USD). */
  priceMonthly: number;
  /** Short marketing blurb shown on the plan card. */
  description?: string;
  /** Feature/usage ceilings enforced on tenants subscribed to this plan. */
  limits: PlanLimits;
  /**
   * Archived plans stay valid for existing subscribers but can no longer be
   * assigned to new restaurants. Toggled from the platform plans page.
   */
  isActive: boolean;
}
