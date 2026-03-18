export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  ORDER_STATUS = 'order_status',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  PROMOTION = 'promotion',
  SUPPLIER_UPDATE = 'supplier_update',
}
