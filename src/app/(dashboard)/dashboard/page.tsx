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
 * Data logic, auth hooks, currency formatter, and empty state are preserved
 * exactly from the original Phase 2 implementation.
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
import { RecentOrders } from '@/components/dashboard/home/recent-orders';
import { TopProducts } from '@/components/dashboard/home/top-products';
import { SalesByHour } from '@/components/dashboard/home/sales-by-hour';
import type { TopProductItem } from '@/components/dashboard/home/top-products';
import type { HourlyDataPoint } from '@/components/dashboard/home/sales-by-hour';
import type { Order } from '@/types/order';

// ─── Mock stats per restaurant ────────────────────────────────────────────────

interface RestaurantStats {
  ordersToday: number;
  salesToday: number;
  activeProducts: number;
  tableCount: number;
}

const MOCK_STATS: Record<string, RestaurantStats> = {
  rest_a_001: {
    ordersToday: 24,
    salesToday: 4_380.0,
    activeProducts: 38,
    tableCount: 3,
  },
  rest_b_002: {
    ordersToday: 11,
    salesToday: 1_875.5,
    activeProducts: 22,
    tableCount: 2,
  },
};

const DEFAULT_STATS: RestaurantStats = {
  ordersToday: 0,
  salesToday: 0,
  activeProducts: 0,
  tableCount: 0,
};

// ─── Mock sparkline / trend data per restaurant ───────────────────────────────

// 7 daily data points (oldest → today) for sparklines
const MOCK_SPARKLINES: Record<string, {
  sales: readonly number[];
  orders: readonly number[];
}> = {
  rest_a_001: {
    sales: [2_100, 3_450, 2_800, 4_100, 3_700, 3_900, 4_380],
    orders: [12, 19, 14, 22, 20, 21, 24],
  },
  rest_b_002: {
    sales: [900, 1_200, 1_050, 1_400, 1_300, 1_600, 1_875],
    orders: [5, 8, 7, 10, 9, 10, 11],
  },
};

const DEFAULT_SPARKLINES = {
  sales: [0, 0, 0, 0, 0, 0, 0],
  orders: [0, 0, 0, 0, 0, 0, 0],
};

// Trend % vs yesterday — mock deltas
const MOCK_TRENDS: Record<string, {
  sales: number;
  orders: number;
  products: number;
  tables: number;
}> = {
  rest_a_001: { sales: 12, orders: 14, products: 0, tables: 0 },
  rest_b_002: { sales: 18, orders: 10, products: -3, tables: 0 },
};

const DEFAULT_TRENDS = { sales: 0, orders: 0, products: 0, tables: 0 };

// ─── Mock hourly sales data ───────────────────────────────────────────────────

// 12 data points: 8 AM – 7 PM
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

// ─── Mock top products per restaurant ────────────────────────────────────────

const MOCK_TOP_PRODUCTS_A: readonly TopProductItem[] = [
  { id: 'p1', emoji: '🫔', name: 'Baleada sencilla', count: 18 },
  { id: 'p5', emoji: '🍽️', name: 'Plato típico', count: 14 },
  { id: 'p3', emoji: '🥣', name: 'Sopa de res', count: 10 },
  { id: 'p6', emoji: '🌮', name: 'Tacos de carnitas', count: 9 },
  { id: 'p2', emoji: '☕', name: 'Café negro', count: 7 },
];

const MOCK_TOP_PRODUCTS_B: readonly TopProductItem[] = [
  { id: 'p11', emoji: '🧆', name: 'Enchiladas', count: 8 },
  { id: 'p10', emoji: '🍲', name: 'Caldo de pollo', count: 6 },
  { id: 'p12', emoji: '🧃', name: 'Jugo natural', count: 5 },
];

const MOCK_TOP_PRODUCTS_BY_RESTAURANT: Record<string, readonly TopProductItem[]> = {
  rest_a_001: MOCK_TOP_PRODUCTS_A,
  rest_b_002: MOCK_TOP_PRODUCTS_B,
};

// ─── Mock recent orders per restaurant ───────────────────────────────────────

const MOCK_RECENT_ORDERS_A: readonly Order[] = [
  {
    id: 'ord_a_001',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a1',
    tableNumber: 1,
    items: [
      { productId: 'p1', name: 'Baleada sencilla', price: 35, quantity: 2 },
      { productId: 'p2', name: 'Café negro', price: 20, quantity: 1 },
    ],
    total: 90,
    status: 'delivered',
    createdAt: Date.now() - 1_200_000,
    updatedAt: Date.now() - 900_000,
  },
  {
    id: 'ord_a_002',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a2',
    tableNumber: 2,
    items: [
      { productId: 'p3', name: 'Sopa de res', price: 120, quantity: 2 },
      { productId: 'p4', name: 'Refresco natural', price: 45, quantity: 2 },
    ],
    total: 330,
    status: 'ready',
    createdAt: Date.now() - 600_000,
    updatedAt: Date.now() - 300_000,
  },
  {
    id: 'ord_a_003',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a3',
    tableNumber: 3,
    items: [
      { productId: 'p5', name: 'Plato típico', price: 180, quantity: 1 },
    ],
    total: 180,
    status: 'preparing',
    createdAt: Date.now() - 180_000,
    updatedAt: Date.now() - 60_000,
  },
  {
    id: 'ord_a_004',
    restaurantId: 'rest_a_001',
    tableId: 'tbl_a1',
    tableNumber: 1,
    items: [
      { productId: 'p6', name: 'Tacos de carnitas', price: 85, quantity: 3 },
      { productId: 'p7', name: 'Agua de horchata', price: 30, quantity: 3 },
    ],
    total: 345,
    status: 'pending',
    createdAt: Date.now() - 60_000,
    updatedAt: Date.now() - 60_000,
  },
] as const;

const MOCK_RECENT_ORDERS_B: readonly Order[] = [
  {
    id: 'ord_b_001',
    restaurantId: 'rest_b_002',
    tableId: 'tbl_b1',
    tableNumber: 1,
    items: [
      { productId: 'p10', name: 'Caldo de pollo', price: 95, quantity: 2 },
    ],
    total: 190,
    status: 'delivered',
    createdAt: Date.now() - 900_000,
    updatedAt: Date.now() - 720_000,
  },
  {
    id: 'ord_b_002',
    restaurantId: 'rest_b_002',
    tableId: 'tbl_b2',
    tableNumber: 2,
    items: [
      { productId: 'p11', name: 'Enchiladas', price: 110, quantity: 1 },
      { productId: 'p12', name: 'Jugo natural', price: 40, quantity: 2 },
    ],
    total: 190,
    status: 'preparing',
    createdAt: Date.now() - 240_000,
    updatedAt: Date.now() - 120_000,
  },
] as const;

const MOCK_ORDERS_BY_RESTAURANT: Record<string, readonly Order[]> = {
  rest_a_001: MOCK_RECENT_ORDERS_A,
  rest_b_002: MOCK_RECENT_ORDERS_B,
};

// ─── Currency formatter ───────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// ─── Role label map ───────────────────────────────────────────────────────────

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
              Seleccioná un restaurante desde el menú superior para ver el resumen.
            </p>
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

  // Null/empty state — no active restaurant selected
  if (!activeRestaurant) {
    return <NoRestaurantState />;
  }

  const stats = MOCK_STATS[activeRestaurant.id] ?? DEFAULT_STATS;
  const recentOrders = MOCK_ORDERS_BY_RESTAURANT[activeRestaurant.id] ?? [];
  const topProducts = MOCK_TOP_PRODUCTS_BY_RESTAURANT[activeRestaurant.id] ?? [];
  const hourlyData = MOCK_HOURLY_BY_RESTAURANT[activeRestaurant.id] ?? [];
  const sparklines = MOCK_SPARKLINES[activeRestaurant.id] ?? DEFAULT_SPARKLINES;
  const trends = MOCK_TRENDS[activeRestaurant.id] ?? DEFAULT_TRENDS;
  const roleLabel = role ? (ROLE_LABELS[role] ?? role) : null;

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const firstName = currentUser?.displayName?.split(' ')[0] ?? 'Administrador';

  const formattedSales = formatCurrency(stats.salesToday, activeRestaurant.currency);

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
            {activeRestaurant.tagline ? ` — ${activeRestaurant.tagline}` : ''}
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
        Restaurante activo: {activeRestaurant.name}.
        Órdenes hoy: {stats.ordersToday}.
        Ventas hoy: {formattedSales}.
      </div>

      {/* ── Bento grid ──────────────────────────────────────────────────────── */}
      {/*
        Breakpoint layout:
          base (1-col)  : all cards stack vertically
          sm  (2-col)   : 2-col grid, metric tiles 1 each, orders/sales span 2
          lg  (3-col)   : metric tiles 1 each (×4 wraps to 2 rows of 2),
                          orders span 2, top-products span 1 row-span-2,
                          sales span 2
          xl  (4-col)   : metric tiles all 4 in a row, then asymmetric bottom section
      */}
      <section
        aria-label="Resumen de actividad del día"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {/* ── Metric tiles — row 1 (xl: spans all 4 cols as individual 1-col each) ── */}

        {/* Ventas — emerald */}
        <MetricTile
          label="Ventas del día"
          value={formattedSales}
          icon={DollarSign}
          iconAriaLabel="Ventas del día en moneda local"
          chipBg="bg-emerald-500"
          sparkStroke="text-emerald-500"
          sparkFill="text-emerald-500/20"
          sparkData={sparklines.sales}
          trend={trends.sales}
          trendLabel="vs ayer"
          description={`En ${activeRestaurant.currency}`}
          colSpan="col-span-1"
          accentFrom="from-emerald-500/10"
          accentTo="to-teal-500/5"
          delayClass="bento-delay-1"
        />

        {/* Órdenes — sky */}
        <MetricTile
          label="Órdenes hoy"
          value={String(stats.ordersToday)}
          icon={ShoppingBag}
          iconAriaLabel="Total de órdenes del día"
          chipBg="bg-sky-500"
          sparkStroke="text-sky-500"
          sparkFill="text-sky-500/20"
          sparkData={sparklines.orders}
          trend={trends.orders}
          trendLabel="vs ayer"
          description="Total del día"
          colSpan="col-span-1"
          accentFrom="from-sky-500/10"
          accentTo="to-blue-500/5"
          delayClass="bento-delay-2"
        />

        {/* Mesas — amber */}
        <MetricTile
          label="Mesas activas"
          value={String(stats.tableCount)}
          icon={LayoutGrid}
          iconAriaLabel="Mesas con código QR generado"
          chipBg="bg-amber-500"
          sparkStroke="text-amber-500"
          sparkFill="text-amber-500/20"
          trend={trends.tables}
          trendLabel="vs ayer"
          description="Con QR generado"
          colSpan="col-span-1"
          accentFrom="from-amber-500/10"
          accentTo="to-orange-500/5"
          delayClass="bento-delay-3"
        />

        {/* Productos — violet */}
        <MetricTile
          label="Productos activos"
          value={String(stats.activeProducts)}
          icon={UtensilsCrossed}
          iconAriaLabel="Productos activos en el menú"
          chipBg="bg-violet-500"
          sparkStroke="text-violet-500"
          sparkFill="text-violet-500/20"
          trend={trends.products}
          trendLabel="vs ayer"
          description="En el menú actual"
          colSpan="col-span-1"
          accentFrom="from-violet-500/10"
          accentTo="to-purple-500/5"
          delayClass="bento-delay-4"
        />

        {/* ── Sales by hour — wide block ──────────────────────────────────── */}
        {hourlyData.length > 0 && (
          <SalesByHour
            data={hourlyData}
            totalLabel={formattedSales}
            delayClass="bento-delay-5"
          />
        )}

        {/* ── Top products — tall block ───────────────────────────────────── */}
        {topProducts.length > 0 && (
          <TopProducts items={topProducts} delayClass="bento-delay-5" />
        )}

        {/* ── Recent orders — wide block ──────────────────────────────────── */}
        <RecentOrders
          orders={recentOrders}
          currency={activeRestaurant.currency}
          delayClass="bento-delay-6"
        />
      </section>
    </div>
  );
}
