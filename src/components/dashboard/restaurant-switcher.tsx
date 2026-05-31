'use client';

import { ChevronDown, Store } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propietario',
  staff: 'Personal',
};

export function RestaurantSwitcher() {
  const { memberships, activeRestaurant, setActiveRestaurant } = useAuth();

  if (memberships.length === 0) {
    return null;
  }

  const currentMembership = memberships.find(
    (m) => m.restaurantId === activeRestaurant?.id
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Cambiar restaurante"
          />
        }
      >
        <Store className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="max-w-[140px] truncate">
          {activeRestaurant?.name ?? 'Seleccionar restaurante'}
        </span>
        {currentMembership && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {ROLE_LABELS[currentMembership.role] ?? currentMembership.role}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Mis restaurantes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map((membership) => {
          const isActive = membership.restaurantId === activeRestaurant?.id;
          return (
            <DropdownMenuItem
              key={membership.id}
              onClick={() => setActiveRestaurant(membership.restaurantId)}
              className={cn(
                'flex items-center justify-between gap-2 cursor-pointer',
                isActive && 'bg-accent'
              )}
              aria-current={isActive ? 'true' : undefined}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate font-medium">
                  {membership.restaurant.name}
                </span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {ROLE_LABELS[membership.role] ?? membership.role}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
