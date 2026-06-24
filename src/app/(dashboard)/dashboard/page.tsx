'use client';

/**
 * Dashboard overview page — "Bento vibrante" redesign.
 *
 * Layout: asymmetric bento grid. Colors:
 *   Ventas   → emerald
 *   Órdenes  → sky/blue
 *   Mesas    → amber
 *   Productos→ violet
 *
 * Data is derived from live mock sources via the dashboard feature module.
 * The page is a thin orchestrator — all business logic lives in:
 *   src/features/dashboard/services/dashboard.service.ts  (data fetch)
 *   src/features/dashboard/mappers/*.mapper.ts             (derivations)
 *   src/features/dashboard/hooks/use-dashboard.ts          (state)
 *   src/features/dashboard/components/*.tsx                (UI slices)
 */

import {
  ShoppingBag,
  DollarSign,
  UtensilsCrossed,
  LayoutGrid,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth, useActiveRole } from '@/lib/auth/auth-context';
import { MetricTile } from '@/components/dashboard/home/metric-tile';
import { TopProducts } from '@/components/dashboard/home/top-products';
import { SalesByHour } from '@/components/dashboard/home/sales-by-hour';
import { StatusBreakdown } from '@/features/dashboard/components/status-breakdown';
import { RecentOrdersList } from '@/features/dashboard/components/recent-orders-list';
import { QuickLinks } from '@/features/dashboard/components/quick-links';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { formatCurrency } from '@/features/orders/mappers/format-order.mapper';
import type { HourlyDataPoint } from '@/components/dashboard/home/sales-by-hour';

// ─── Mock hourly sales data (visual chart only — not derived from orders) ─────
//
// The hourly chart is a sparkline-style bento decoration.
// TODO: when Firestore lands, bucket delivered-order totals by hour and replace.

const MOCK_HOURLY_A: readonly HourlyDataPoint[] = [
  { hour: 8, value: 180 },
  { hour: 9, value: 340 },
  { hour: 10, value: 410 },
  { hour: 11, value: 520 },
  { hour: 12, value: 780 },
  { hour: 13, value: 940 },
  { hour: 14, value: 620 },
  { hour: 15, value: 380 },
  { hour: 16, value: 290 },
  { hour: 17, value: 220 },
  { hour: 18, value: 410 },
  { hour: 19, value: 290 },
];

const MOCK_HOURLY_B: readonly HourlyDataPoint[] = [
  { hour: 8, value: 80 },
  { hour: 9, value: 150 },
  { hour: 10, value: 200 },
  { hour: 11, value: 230 },
  { hour: 12, value: 310 },
  { hour: 13, value: 380 },
  { hour: 14, value: 260 },
  { hour: 15, value: 170 },
  { hour: 16, value: 120 },
  { hour: 17, value: 90 },
  { hour: 18, value: 55 },
  { hour: 19, value: 30 },
];

const MOCK_HOURLY_BY_RESTAURANT: Record<string, readonly HourlyDataPoint[]> = {
  rest_a_001: MOCK_HOURLY_A,
  rest_b_002: MOCK_HOURLY_B,
};

// ─── Role labels ──────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propietario',
  staff: 'Personal',
};

// ─── Empty state ──────────────────────────────────────────────────────────────

function NoRestaurantState() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <Card className="max-w-sm w-full">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
          >
            <LayoutGrid className="h-6 w-6 text-muted-foreground" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Sin restaurante seleccionado
            </h2>
            <p className="text-sm text-muted-foreground">
              Seleccioná un restaurante desde el menú superior para ver el
              resumen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando resumen del restaurante"
      className="space-y-6"
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-36 animate-pulse rounded-lg bg-muted" />
      </div>
      {/* Tiles skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function DashboardError({ message }: { message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-20" role="alert">
      <Card className="max-w-sm w-full">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Error al cargar el resumen
            </h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { currentUser, activeRestaurant } = useAuth();
  const role = useActiveRole();

  const dashboardState = useDashboard({
    restaurantId: activeRestaurant?.id ?? null,
  });

  // No active restaurant — show empty state before any data load
  if (!activeRestaurant) {
    return <NoRestaurantState />;
  }

  if (dashboardState.status === 'loading') {
    return <DashboardSkeleton />;
  }

  if (dashboardState.status === 'error') {
    return <DashboardError message={dashboardState.message} />;
  }

  const { kpis, statusBreakdown, recentOrders, topProducts } =
    dashboardState.data;

  const currency = activeRestaurant.currency;
  const hourlyData = MOCK_HOURLY_BY_RESTAURANT[activeRestaurant.id] ?? [];

  // Greeting — computed client-side only (no SSR mismatch risk since the page
  // is 'use client' and greeting is display text, not a hydrated DOM attribute).
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const firstName =
    currentUser?.displayName?.split(' ')[0] ?? 'Administrador';
  const roleLabel = role ? (ROLE_LABELS[role] ?? role) : null;

  // Formatted KPI values — currency uses restaurant currency, NEVER USD.
  const formattedRevenue = formatCurrency(kpis.revenueDelivered, currency);

  const tableDescription =
    kpis.tablesWithOpenOrders > 0
      ? `${kpis.tablesWithOpenOrders} con órdenes activas`
      : 'Sin órdenes activas';

  const productDescription = `${kpis.availableProducts} de ${kpis.totalProducts} disponibles`;

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeRestaurant.name}
            {activeRestaurant.tagline
              ? ` — ${activeRestaurant.tagline}`
              : ''}
          </p>
        </div>

        {roleLabel && (
          <Badge variant="secondary" className="mt-1 shrink-0 capitalize">
            {roleLabel}
          </Badge>
        )}
      </header>

      {/* ── Live region for screen readers ──────────────────────────────────── */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Restaurante activo: {activeRestaurant.name}. Órdenes:{' '}
        {kpis.totalOrders}. Ingresos entregados: {formattedRevenue}.
      </div>

      {/* ── Bento grid ──────────────────────────────────────────────────────── */}
      {/*
        Breakpoint layout:
          base (1-col)  : all cards stack vertically
          sm  (2-col)   : 2-col grid, metric tiles 1 each, wide blocks span 2
          lg  (3-col)   : metric tiles 1 each (×4 wraps to 2 rows of 2),
                          wide blocks span 2, top-products spans row-span-2
          xl  (4-col)   : metric tiles all 4 in a row, then asymmetric bottom section
      */}
      <section
        aria-label="Resumen de actividad del día"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {/* ── Metric tiles — row 1 ────────────────────────────────────────── */}

        {/* Ingresos — emerald */}
        <MetricTile
          label="Ingresos entregados"
          value={formattedRevenue}
          icon={DollarSign}
          iconAriaLabel="Ingresos de órdenes entregadas en moneda local"
          chipBg="bg-emerald-500"
          sparkStroke="text-emerald-500"
          sparkFill="text-emerald-500/20"
          description={`En ${currency}`}
          colSpan="col-span-1"
          accentFrom="from-emerald-500/10"
          accentTo="to-teal-500/5"
          delayClass="bento-delay-1"
        />

        {/* Órdenes totales — sky */}
        <MetricTile
          label="Órdenes activas"
          value={String(kpis.totalOrders)}
          icon={ShoppingBag}
          iconAriaLabel="Total de órdenes del restaurante"
          chipBg="bg-sky-500"
          sparkStroke="text-sky-500"
          sparkFill="text-sky-500/20"
          description="Total en el sistema"
          colSpan="col-span-1"
          accentFrom="from-sky-500/10"
          accentTo="to-blue-500/5"
          delayClass="bento-delay-2"
        />

        {/* Mesas — amber */}
        <MetricTile
          label="Mesas"
          value={String(kpis.tableCount)}
          icon={LayoutGrid}
          iconAriaLabel="Total de mesas con código QR"
          chipBg="bg-amber-500"
          sparkStroke="text-amber-500"
          sparkFill="text-amber-500/20"
          description={tableDescription}
          colSpan="col-span-1"
          accentFrom="from-amber-500/10"
          accentTo="to-orange-500/5"
          delayClass="bento-delay-3"
        />

        {/* Productos — violet */}
        <MetricTile
          label="Productos activos"
          value={String(kpis.availableProducts)}
          icon={UtensilsCrossed}
          iconAriaLabel="Productos activos en el menú"
          chipBg="bg-violet-500"
          sparkStroke="text-violet-500"
          sparkFill="text-violet-500/20"
          description={productDescription}
          colSpan="col-span-1"
          accentFrom="from-violet-500/10"
          accentTo="to-purple-500/5"
          delayClass="bento-delay-4"
        />

        {/* ── Status breakdown — 2-wide block ─────────────────────────────── */}
        <StatusBreakdown
          breakdown={statusBreakdown}
          delayClass="bento-delay-5"
        />

        {/* ── Top products — tall block ────────────────────────────────────── */}
        {topProducts.length > 0 && (
          <TopProducts items={topProducts} delayClass="bento-delay-5" />
        )}

        {/* ── Sales by hour — wide block (decorative / TODO: real data) ───── */}
        {hourlyData.length > 0 && (
          <SalesByHour
            data={hourlyData}
            totalLabel={formattedRevenue}
            delayClass="bento-delay-6"
          />
        )}

        {/* ── Recent orders — 2-wide block ─────────────────────────────────── */}
        <RecentOrdersList
          orders={recentOrders}
          currency={currency}
          delayClass="bento-delay-6"
        />
      </section>

      {/* ── Quick links ─────────────────────────────────────────────────────── */}
      <QuickLinks />
    </div>
  );
}
