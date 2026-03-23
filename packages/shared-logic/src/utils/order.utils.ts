import { OrderStatus } from '@iorder/shared-contracts';

/** Check if order can be cancelled */
export function canCancelOrder(status: OrderStatus): boolean {
  return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(status);
}

/** Check if order status transition is valid */
export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

/** Get human-readable order status label */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pending',
    [OrderStatus.CONFIRMED]: 'Confirmed',
    [OrderStatus.PROCESSING]: 'Processing',
    [OrderStatus.SHIPPED]: 'Shipped',
    [OrderStatus.DELIVERED]: 'Delivered',
    [OrderStatus.CANCELLED]: 'Cancelled',
    [OrderStatus.REFUNDED]: 'Refunded',
  };

  return labels[status] ?? status;
}
