import { OrderStatus, PaymentStatus } from '../enums';

export interface IOrder {
  id: string;
  buyerId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: IOrderItem[];
  paymentStatus: PaymentStatus;
  shippingAddress: IAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ICart {
  id: string;
  userId: string;
  items: ICartItem[];
  totalAmount: number;
}

export interface ICartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
