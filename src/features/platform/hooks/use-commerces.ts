import { useState } from 'react';
import type { SubscriptionStatus } from '@/types/subscription';
import type { CommerceRow, CommerceActionState } from '@/features/platform/types';
import {
  getCommercesSnapshot,
  setCommerceStatus,
} from '@/features/platform/services/platform.service';

export interface UseCommercesOutput {
  /** All commerces (tenants), sorted by name. */
  commerces: CommerceRow[];
  /** State of the in-flight suspend/reactivate action. */
  actionState: CommerceActionState;
  /** Suspend a commerce (subscription → 'canceled'). Optimistic. */
  handleSuspend: (restaurantId: string) => Promise<void>;
  /** Reactivate a commerce (subscription → 'active'). Optimistic. */
  handleReactivate: (restaurantId: string) => Promise<void>;
}

/**
 * Encapsulates the platform commerces state. Seeds synchronously from the
 * service snapshot (no loading flash) and applies status changes optimistically.
 *
 * When Firestore lands, replace the seed + service calls with an onSnapshot
 * subscription inside a useEffect — this API surface stays stable.
 */
export function useCommerces(): UseCommercesOutput {
  const [commerces, setCommerces] = useState<CommerceRow[]>(() =>
    getCommercesSnapshot()
  );
  const [actionState, setActionState] = useState<CommerceActionState>({
    status: 'idle',
  });

  function applyStatus(restaurantId: string, status: SubscriptionStatus): void {
    setCommerces((prev) =>
      prev.map((row) =>
        row.restaurant.id === restaurantId
          ? {
              ...row,
              status,
              restaurant: {
                ...row.restaurant,
                subscription: { ...row.restaurant.subscription, status },
              },
            }
          : row
      )
    );
  }

  async function changeStatus(
    restaurantId: string,
    status: SubscriptionStatus
  ): Promise<void> {
    applyStatus(restaurantId, status); // optimistic
    setActionState({ status: 'submitting' });
    try {
      await setCommerceStatus(restaurantId, status);
      setActionState({ status: 'idle' });
    } catch {
      // TODO: roll back the optimistic change once Firestore can fail for real.
      setActionState({ status: 'error', message: 'No se pudo actualizar el comercio.' });
    }
  }

  return {
    commerces,
    actionState,
    handleSuspend: (id) => changeStatus(id, 'canceled'),
    handleReactivate: (id) => changeStatus(id, 'active'),
  };
}
