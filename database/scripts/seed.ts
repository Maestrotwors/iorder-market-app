// Database seeding script
// Run with: bun database/scripts/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed sample products
  const product1 = await prisma.product.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440001' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Wireless Headphones',
      description: 'Premium wireless headphones with noise cancellation',
      price: 149.99,
      currency: 'USD',
      stock: 50,
      isActive: true,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440002' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'USB-C Cable',
      description: 'Fast charging USB-C cable, 2m length',
      price: 12.99,
      currency: 'USD',
      stock: 200,
      isActive: true,
    },
  });

  console.log('Seeding completed:', { products: [product1.id, product2.id] });
  console.log('\nTo create test users, run: bun run db:seed:test-user');
  console.log('(requires auth-service to be running)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
