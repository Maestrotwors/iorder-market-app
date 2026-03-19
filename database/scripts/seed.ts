// Database seeding script
// Run with: bun database/scripts/seed.ts
//
// Seeds default users via Better Auth API (correct password hashing)
// and sample products via Prisma.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AUTH_URL = process.env['AUTH_URL'] || 'http://localhost:3002';
const DEFAULT_PASSWORD = 'password123';

interface SeedUser {
  name: string;
  email: string;
  role: 'admin' | 'supplier' | 'customer';
}

const defaultUsers: SeedUser[] = [
  { name: 'Admin', email: 'admin@iorder.market', role: 'admin' },
  { name: 'Test Supplier', email: 'supplier@iorder.market', role: 'supplier' },
  { name: 'Test Customer', email: 'customer@iorder.market', role: 'customer' },
];

async function seedUsers() {
  console.log('Seeding default users...');

  for (const seedUser of defaultUsers) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: seedUser.email },
    });

    if (existing) {
      // Update role if needed
      if (existing.role !== seedUser.role) {
        await prisma.user.update({
          where: { email: seedUser.email },
          data: { role: seedUser.role },
        });
        console.log(`  ✓ ${seedUser.email} — role updated to ${seedUser.role}`);
      } else {
        console.log(`  - ${seedUser.email} — already exists`);
      }
      continue;
    }

    // Register through Better Auth API (correct password hashing)
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: seedUser.name,
          email: seedUser.email,
          password: DEFAULT_PASSWORD,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`  ✗ ${seedUser.email} — registration failed: ${text}`);
        continue;
      }

      // Update role (Better Auth defaults to 'customer')
      await prisma.user.update({
        where: { email: seedUser.email },
        data: { role: seedUser.role },
      });

      console.log(`  ✓ ${seedUser.email} — created with role ${seedUser.role}`);
    } catch (e) {
      console.error(`  ✗ ${seedUser.email} — failed (is auth-service running?): ${e}`);
    }
  }
}

async function seedProducts() {
  console.log('Seeding sample products...');

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

  console.log('Products seeded:', [product1.id, product2.id]);
}

async function main() {
  console.log('Seeding database...');
  console.log(`Auth URL: ${AUTH_URL}`);

  await seedUsers();
  await seedProducts();

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
