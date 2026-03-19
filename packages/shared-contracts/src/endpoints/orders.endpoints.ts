import type { IOrder, ApiResponse, PaginatedResponse } from '../types';
import type { CreateOrderDto, UpdateOrderStatusDto } from '../schemas';

// GET /api/orders
export interface GetOrdersRequest {
  page?: number;
  limit?: number;
  status?: string;
}
export interface GetOrdersResponse extends PaginatedResponse<IOrder> {}

// GET /api/orders/:id
export interface GetOrderByIdRequest {
  id: string;
}
export interface GetOrderByIdResponse extends ApiResponse<IOrder> {}

// POST /api/orders
export interface CreateOrderRequest extends CreateOrderDto {}
export interface CreateOrderResponse extends ApiResponse<IOrder> {}

// PATCH /api/orders/:id/status
export interface UpdateOrderStatusRequest extends UpdateOrderStatusDto {}
export interface UpdateOrderStatusResponse extends ApiResponse<IOrder> {}
