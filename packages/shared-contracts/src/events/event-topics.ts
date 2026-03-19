/** RedPanda topic names for inter-service communication */
export const EventTopics = {
  // Auth events
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',

  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_CANCELLED: 'order.cancelled',

  // Payment events
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',

  // Catalog events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  STOCK_UPDATED: 'stock.updated',

  // Notification events
  NOTIFICATION_SEND: 'notification.send',

  // CDC events (from WAL)
  CDC_CHANGE: 'cdc.change',
} as const;

export type EventTopic = (typeof EventTopics)[keyof typeof EventTopics];
