export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  tableNumber: number;
  items: readonly OrderItem[];
  total: number;
  status: OrderStatus;
  customerName?: string;
  createdAt: number;
  updatedAt: number;
}
