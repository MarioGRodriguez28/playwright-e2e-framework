import { expect, type Locator, type Page } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly items: Locator;
  readonly names: Locator;
  readonly prices: Locator;
  readonly sort: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.names = page.getByTestId('inventory-item-name');
    this.prices = page.getByTestId('inventory-item-price');
    this.sort = page.getByTestId('product-sort-container');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.items.first()).toBeVisible();
  }

  async sortBy(option: SortOption) {
    await this.sort.selectOption(option);
  }

  async productNames(): Promise<string[]> {
    return this.names.allTextContents();
  }

  async productPrices(): Promise<number[]> {
    const texts = await this.prices.allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async addToCart(productName: string) {
    const slug = productName.toLowerCase().replace(/\s+/g, '-');
    await this.page.getByTestId(`add-to-cart-${slug}`).click();
  }

  async removeFromCart(productName: string) {
    const slug = productName.toLowerCase().replace(/\s+/g, '-');
    await this.page.getByTestId(`remove-${slug}`).click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}
