'use client';

import { Settings2Icon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth, useActiveRole } from '@/lib/auth/auth-context';
import { ProfileForm } from '@/features/settings/components/profile-form';

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
            <Settings2Icon className="size-6 text-muted-foreground" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Sin restaurante seleccionado
            </h2>
            <p className="text-sm text-muted-foreground">
              Seleccioná un restaurante desde el menú lateral para ver y editar
              su configuración.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

interface PageHeaderProps {
  restaurantName: string | null;
  isOwner: boolean;
}

function PageHeader({ restaurantName, isOwner }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Configuración
      </h1>
      <p className="text-sm text-muted-foreground">
        {restaurantName
          ? isOwner
            ? `Editá el perfil de ${restaurantName}.`
            : `Estás viendo la configuración de ${restaurantName} en modo de solo lectura.`
          : 'Seleccioná un restaurante para ver su configuración.'}
      </p>
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * /settings — Restaurant profile settings.
 *
 * Data flow:
 *   1. activeRestaurant comes from useAuth() (mock: Ana's active restaurant).
 *   2. Form state is managed locally inside <ProfileForm>.
 *   3. "Save" simulates an async write with a discriminated-union state machine.
 *
 * Owner-gating:
 *   - useActiveRole() === 'owner' → all inputs editable, save bar visible.
 *   - 'staff' or null → inputs disabled, read-only alert shown, no save bar.
 *
 * Firestore seams:
 *   - ProfileForm.handleSubmit → update restaurant document in Firestore.
 *     See the TODO comment inside profile-form.tsx.
 */
export default function SettingsPage() {
  const { activeRestaurant } = useAuth();
  const activeRole = useActiveRole();
  const isOwner = activeRole === 'owner';

  if (!activeRestaurant) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader restaurantName={null} isOwner={isOwner} />
        <NoRestaurantState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader restaurantName={activeRestaurant.name} isOwner={isOwner} />

      <ProfileForm restaurant={activeRestaurant} isOwner={isOwner} />
    </div>
  );
}
