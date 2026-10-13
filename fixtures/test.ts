import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { users } from './users';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

type Session = {
  signedIn: InventoryPage;
};

export const test = base.extend<Pages & Session>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  // Starts the test already authenticated by seeding the session cookie the app
  // checks, so only the login tests pay for the login screen.
  signedIn: async ({ context, page, baseURL }, use) => {
    const { hostname } = new URL(baseURL!);
    await context.addCookies([
      { name: 'session-username', value: users.standard.username, domain: hostname, path: '/' },
    ]);
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await inventory.expectLoaded();
    await use(inventory);
  },
});

export { expect };
