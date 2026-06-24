'use client';

import { CreditCardIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth, useActiveRole } from '@/lib/auth/auth-context';
import { SubscriptionPageHeader } from '@/features/subscription/components/subscription-page-header';
import { SubscriptionPanel } from '@/features/subscription/components/subscription-panel';

// ─── Empty state ──────────────────────────────────────────────────────────────

function NoRestaurantState() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-muted"
          >
            <CreditCardIcon className="size-6 text-muted-foreground" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Sin restaurante seleccionado
            </h2>
            <p className="text-sm text-muted-foreground">
              Seleccioná un restaurante desde el menú lateral para ver su
              suscripción.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * /subscription — Tenant subscription & plan management page.
 *
 * Data flow:
 *   1. activeRestaurant comes from useAuth() (mock: Ana's active restaurant).
 *   2. useSubscription() seeds from the service snapshot (no loading flash).
 *   3. Plan switches + trial activation are mock async mutations with optimistic
 *      local updates.
 *
 * Owner-gating:
 *   - useActiveRole() === 'owner' → plan catalog visible, switch/activate enabled.
 *   - 'staff' or null → read-only notice shown, no mutation CTAs.
 *
 * Firestore seams:
 *   - subscription.service.ts → update restaurant subscription sub-document.
 */
export default function SubscriptionPage() {
  const { activeRestaurant } = useAuth();
  const activeRole = useActiveRole();
  const isOwner = activeRole === 'owner';

  if (!activeRestaurant) {
    return (
      <div className="flex flex-col gap-6">
        <SubscriptionPageHeader restaurantName={null} isOwner={isOwner} />
        <NoRestaurantState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SubscriptionPageHeader
        restaurantName={activeRestaurant.name}
        isOwner={isOwner}
      />

      <SubscriptionPanel restaurant={activeRestaurant} isOwner={isOwner} />
    </div>
  );
}
