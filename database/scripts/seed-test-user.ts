/**
 * Seed script — creates a test user via the Better Auth API.
 *
 * Prerequisites:
 *   1. Database must be running and migrated
 *   2. Auth service must be running (port 3002 by default)
 *
 * Usage:
 *   bun run db:seed:test-user
 */

const AUTH_URL = process.env['AUTH_URL'] || 'http://localhost:3002';

interface TestUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

const testUsers: TestUser[] = [
  {
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
  },
  {
    name: 'Test Supplier',
    email: 'supplier@example.com',
    password: 'password123',
    role: 'supplier',
  },
  {
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  },
];

async function seedUser(user: TestUser): Promise<void> {
  console.log(`Creating user: ${user.email} (${user.role})...`);

  const res = await fetch(`${AUTH_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

  const data = await res.json();

  if (res.ok) {
    console.log(`  -> Created successfully (id: ${data.user?.id ?? 'unknown'})`);
  } else {
    console.log(`  -> Failed: ${JSON.stringify(data)}`);
  }
}

async function main(): Promise<void> {
  console.log(`Seeding test users via ${AUTH_URL}...\n`);

  for (const user of testUsers) {
    await seedUser(user);
  }

  console.log('\nDone.');
}

main().catch(console.error);
