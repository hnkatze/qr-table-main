/**
 * A restaurant's subscription to a platform Plan.
 *
 * IMPORTANT — the subscription lives on the Restaurant (the tenant that PAYS),
 * never on the User. A user may belong to several restaurants (see Membership,
 * which is many-to-many), each billed independently — so "who pays" is the
 * business, not the person. See `.claude/rules/data-conventions.md`.
 */

export const SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'past_due',
  'canceled',
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export interface Subscription {
  /** FK to the Plan in the platform catalog (Plan.id). */
  planId: string;
  status: SubscriptionStatus;
  /** Epoch ms when the current paid period ends / renews. */
  currentPeriodEnd: number;
}
