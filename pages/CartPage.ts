import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly names: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.names = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async expectProducts(expected: string[]) {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.names).toHaveText(expected);
  }

  async expectEmpty() {
    await expect(this.items).toHaveCount(0);
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
