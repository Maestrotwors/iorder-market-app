---
name: create-e2e
description: Create a Playwright E2E test file for API endpoints or browser flows
user_invocable: true
---

# Create E2E Test

Create a Playwright E2E test file following the project conventions.

## Arguments

Parse the arguments:
- First argument: test target (e.g., `orders`, `cart`, `product-detail`)
- Second argument (optional): `api` or `browser` (default: `api`)

## API Test Template (e2e/api/)

For API-only tests that hit backend endpoints through API Gateway:

```typescript
import { test, expect } from '@playwright/test';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

test.describe('{{PascalName}} API E2E', () => {
  test('GET /api/{{kebab-name}} should ...', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/{{kebab-name}}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
```

## Browser Test Template (e2e/)

For browser-based tests using Page Object Model:

```typescript
import { test, expect } from './fixtures/base.fixture';

test.describe('{{PascalName}} E2E', () => {
  test('should display {{kebab-name}} page', async ({ page }) => {
    await page.goto('/{{route}}');
    await expect(page.locator('body')).toBeVisible();
  });
});
```

## Rules

1. API tests go in `e2e/api/{{kebab-name}}.e2e.ts`
2. Browser tests go in `e2e/{{kebab-name}}.e2e.ts`
3. File extension: `.e2e.ts` (matches playwright.config.ts testMatch)
4. Use `@playwright/test` for API tests, `./fixtures/base.fixture` for browser tests
5. API tests use `request` context (no browser needed), browser tests use `page`
6. Always use `process.env['API_URL']` for API base URL
7. For authenticated endpoints, include auth setup in `test.beforeAll`
8. Test naming: describe what the endpoint/page SHOULD do

## Auth Helper Pattern (for protected endpoints)

```typescript
test.beforeAll(async ({ request }) => {
  // Register
  await request.post(`${API_URL}/api/auth/sign-up/email`, {
    data: { name: 'Test User', email: `e2e-${Date.now()}@test.com`, password: 'TestPassword123!' },
  });
  // Get token
  const tokenRes = await request.get(`${API_URL}/api/auth/token`);
  const { token } = await tokenRes.json();
  authToken = token;
});
```

## Running

```bash
bun run test:e2e:api      # API tests only (requires services running)
bun run test:e2e:docker   # Full: docker compose up → API tests → down
bun run test:e2e          # All tests (API + browser)
```
