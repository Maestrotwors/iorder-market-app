import { Elysia, t } from 'elysia';
import {
  ProductFilterSchema,
  CreateProductSchema,
  UpdateProductSchema,
} from '@iorder/shared-contracts';
import type { IProduct, PaginatedResponse, ApiResponse } from '@iorder/shared-contracts';

// Mock data — will be replaced with Prisma queries
const mockProducts: IProduct[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with noise cancellation',
    price: 149.99,
    currency: 'USD',
    categoryId: '550e8400-e29b-41d4-a716-446655440010',
    supplierId: '550e8400-e29b-41d4-a716-446655440020',
    images: [],
    stock: 50,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'USB-C Cable',
    description: 'Fast charging USB-C cable, 2m length',
    price: 12.99,
    currency: 'USD',
    categoryId: '550e8400-e29b-41d4-a716-446655440010',
    supplierId: '550e8400-e29b-41d4-a716-446655440020',
    images: [],
    stock: 200,
    isActive: true,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
];

export const productRoutes = new Elysia({ prefix: '/products' })
  .get(
    '/',
    ({ query }): PaginatedResponse<IProduct> => {
      const page = Number(query['page']) || 1;
      const limit = Number(query['limit']) || 20;
      const search = query['search']?.toLowerCase();

      let filtered = mockProducts.filter((p) => p.isActive);

      if (search) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search),
        );
      }

      const total = filtered.length;
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      return {
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        timestamp: new Date().toISOString(),
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
        sortBy: t.Optional(t.String()),
        sortOrder: t.Optional(t.String()),
      }),
      detail: {
        summary: 'List products',
        description:
          'Returns a paginated list of active products. Supports search by name/description, filtering by category, and sorting.',
        tags: ['Products'],
      },
    },
  )
  .get(
    '/:id',
    ({ params }): ApiResponse<IProduct | null> => {
      const product = mockProducts.find((p) => p.id === params.id) ?? null;

      return {
        success: !!product,
        data: product,
        message: product ? undefined : 'Product not found',
        timestamp: new Date().toISOString(),
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Get product by ID',
        description: 'Returns a single product by its UUID. Returns null if not found.',
        tags: ['Products'],
      },
    },
  )
  .post(
    '/',
    ({ body }): ApiResponse<IProduct> => {
      const product: IProduct = {
        id: crypto.randomUUID(),
        ...body,
        currency: body.currency ?? 'USD',
        images: body.images ?? [],
        stock: body.stock ?? 0,
        supplierId: '550e8400-e29b-41d4-a716-446655440020',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProducts.push(product);

      return {
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      };
    },
    {
      body: CreateProductSchema,
      detail: {
        summary: 'Create product',
        description: 'Creates a new product. Validates input with Zod schema.',
        tags: ['Products'],
      },
    },
  )
  .patch(
    '/:id',
    ({ params, body }): ApiResponse<IProduct | null> => {
      const index = mockProducts.findIndex((p) => p.id === params.id);
      if (index === -1) {
        return {
          success: false,
          data: null,
          message: 'Product not found',
          timestamp: new Date().toISOString(),
        };
      }
      mockProducts[index] = { ...mockProducts[index], ...body, updatedAt: new Date() };

      return {
        success: true,
        data: mockProducts[index],
        timestamp: new Date().toISOString(),
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: UpdateProductSchema,
      detail: {
        summary: 'Update product',
        description: 'Partially updates a product by ID. All fields are optional.',
        tags: ['Products'],
      },
    },
  )
  .delete(
    '/:id',
    ({ params }): ApiResponse<null> => {
      const index = mockProducts.findIndex((p) => p.id === params.id);
      if (index === -1) {
        return {
          success: false,
          data: null,
          message: 'Product not found',
          timestamp: new Date().toISOString(),
        };
      }
      mockProducts.splice(index, 1);

      return {
        success: true,
        data: null,
        message: 'Product deleted',
        timestamp: new Date().toISOString(),
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Delete product',
        description: 'Deletes a product by ID.',
        tags: ['Products'],
      },
    },
  );
