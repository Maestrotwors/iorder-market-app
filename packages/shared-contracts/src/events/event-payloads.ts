import { OrderStatus, PaymentStatus } from '../enums';

export interface OrderCreatedEvent {
  orderId: string;
  buyerId: string;
  totalAmount: number;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  timestamp: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  timestamp: string;
}

export interface PaymentCompletedEvent {
  paymentId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  timestamp: string;
}

export interface StockUpdatedEvent {
  productId: string;
  previousStock: number;
  newStock: number;
  timestamp: string;
}

export interface NotificationEvent {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface CDCChangeEvent {
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string;
}
