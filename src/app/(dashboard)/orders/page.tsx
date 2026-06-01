'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { OrdersPageHeader } from '@/features/orders/components/orders-page-header';
import { OrdersBoard } from '@/features/orders/components/orders-board';
import { NoRestaurantState } from '@/features/orders/components/no-restaurant-state';

/**
 * /orders — Live order board for the active restaurant.
 *
 * Thin orchestrator: reads auth context, delegates all state logic to
 * useOrders(), and renders presentational components.
 *
 * No owner-gating: both owners and staff manage orders (daily operations).
 */
export default function OrdersPage() {
  const { activeRestaurant } = useAuth();

  const { orders, columns, handleAdvance, handleRevert } = useOrders({
    restaurantId: activeRestaurant?.id ?? null,
  });

  if (!activeRestaurant) {
    return (
      <div className="flex flex-col gap-6">
        <OrdersPageHeader restaurantName={null} orders={[]} />
        <NoRestaurantState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OrdersPageHeader
        restaurantName={activeRestaurant.name}
        orders={orders}
      />

      <OrdersBoard
        columns={columns}
        currency={activeRestaurant.currency}
        onAdvance={handleAdvance}
        onRevert={handleRevert}
      />
    </div>
  );
}
