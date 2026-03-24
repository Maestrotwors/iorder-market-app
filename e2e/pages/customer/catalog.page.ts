import { type Page, type Locator } from '@playwright/test';

export class CatalogPage {
  readonly productCards: Locator;
  readonly searchInput: Locator;
  readonly cartButton: Locator;

  constructor(private page: Page) {
    this.productCards = page.locator('[data-testid="product-card"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.cartButton = page.locator('[data-testid="cart-button"]');
  }

  async goto() {
    await this.page.goto('/customer/catalog');
  }

  async searchProduct(query: string) {
    await this.searchInput.fill(query);
  }
}
