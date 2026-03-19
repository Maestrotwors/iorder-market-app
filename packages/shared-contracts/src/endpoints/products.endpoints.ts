import type { IProduct, ApiResponse, PaginatedResponse } from '../types';
import type { CreateProductDto, UpdateProductDto, ProductFilterDto } from '../schemas';

// GET /api/products
export interface GetProductsRequest extends ProductFilterDto {}
export interface GetProductsResponse extends PaginatedResponse<IProduct> {}

// GET /api/products/:id
export interface GetProductByIdRequest {
  id: string;
}
export interface GetProductByIdResponse extends ApiResponse<IProduct> {}

// POST /api/products
export interface CreateProductRequest extends CreateProductDto {}
export interface CreateProductResponse extends ApiResponse<IProduct> {}

// PATCH /api/products/:id
export interface UpdateProductRequest extends UpdateProductDto {
  id: string;
}
export interface UpdateProductResponse extends ApiResponse<IProduct> {}

// DELETE /api/products/:id
export interface DeleteProductRequest {
  id: string;
}
export interface DeleteProductResponse extends ApiResponse<null> {}
