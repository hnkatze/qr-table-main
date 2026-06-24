import { useState, useEffect } from 'react';
import { getDashboardData } from '@/features/dashboard/services/dashboard.service';
import { buildKpis } from '@/features/dashboard/mappers/kpi.mapper';
import { buildStatusBreakdown } from '@/features/dashboard/mappers/status-breakdown.mapper';
import { buildRecentOrders } from '@/features/dashboard/mappers/recent-orders.mapper';
import { buildTopProducts } from '@/features/dashboard/mappers/top-products.mapper';
import type { DashboardState } from '@/features/dashboard/types';

interface UseDashboardInput {
  restaurantId: string | null;
}

/**
 * Owns the Dashboard home state.
 *
 * Uses useEffect + async load (not render-phase sync) because getDashboardData
 * is async (future Firestore boundary). This is the correct pattern when the
 * seam is async; the render-phase sync pattern only applies when the seed is
 * provably synchronous (as in useMembers / useOrders which read from mock
 * state directly).
 *
 * Restaurant change: the effect is keyed on restaurantId. When it changes the
 * effect re-fires, sets loading, fetches new data. A cancellation flag prevents
 * stale responses from a previous restaurant overwriting the new one.
 *
 * Hydration safety: no Date.now() at module or hook scope. The `createdAt`
 * field in RecentOrderRow is forwarded from the fixed mock epoch — identical
 * on server and client. Relative-time display is delegated to the component
 * layer via useRelativeTime (client-only after mount).
 *
 * When Firestore lands: replace the useEffect body with onSnapshot listeners
 * that call setData({ status: 'success', data: derived }) on each emission.
 */
export function useDashboard({ restaurantId }: UseDashboardInput): DashboardState {
  const [data, setData] = useState<DashboardState>({ status: 'loading' });

  useEffect(() => {
    if (!restaurantId) {
      setData({ status: 'loading' });
      return;
    }

    // Show loading immediately when restaurant changes
    setData({ status: 'loading' });

    let cancelled = false;

    getDashboardData(restaurantId)
      .then((raw) => {
        if (cancelled) return;
        setData({
          status: 'success',
          data: {
            kpis: buildKpis(raw),
            statusBreakdown: buildStatusBreakdown(raw.orders),
            recentOrders: buildRecentOrders(raw.orders),
            topProducts: buildTopProducts(raw.orders, raw.products),
          },
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Error al cargar el resumen';
        setData({ status: 'error', message });
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  return data;
}
