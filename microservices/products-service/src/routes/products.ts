import { Elysia, t } from 'elysia';
import { ProductFilterSchema } from '@iorder/shared-contracts';
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
  .get('/', ({ query }): PaginatedResponse<IProduct> => {
    const page = Number(query['page']) || 1;
    const limit = Number(query['limit']) || 20;
    const search = query['search']?.toLowerCase();

    let filtered = mockProducts.filter(p => p.isActive);

    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
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
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      search: t.Optional(t.String()),
      categoryId: t.Optional(t.String()),
      sortBy: t.Optional(t.String()),
      sortOrder: t.Optional(t.String()),
    }),
  })
  .get('/:id', ({ params }): ApiResponse<IProduct | null> => {
    const product = mockProducts.find(p => p.id === params.id) ?? null;

    return {
      success: !!product,
      data: product,
      message: product ? undefined : 'Product not found',
      timestamp: new Date().toISOString(),
    };
  }, {
    params: t.Object({
      id: t.String(),
    }),
  });
