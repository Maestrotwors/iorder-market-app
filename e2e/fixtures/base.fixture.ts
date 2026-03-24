import { test as base } from '@playwright/test';

/**
 * Base test fixture for iOrder E2E tests.
 * Extend this fixture to add shared page objects or helpers.
 */
export const test = base.extend({});

export { expect } from '@playwright/test';
