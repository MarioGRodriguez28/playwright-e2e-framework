import { test, expect } from '../../fixtures/test';
import { products } from '../../fixtures/users';

test.describe('Inventory', () => {
  test('lists the full catalogue @smoke', async ({ signedIn }) => {
    await expect(signedIn.items).toHaveCount(6);
  });

  test('sorts by name from A to Z', async ({ signedIn }) => {
    await signedIn.sortBy('az');
    const names = await signedIn.productNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('sorts by name from Z to A', async ({ signedIn }) => {
    await signedIn.sortBy('za');
    const names = await signedIn.productNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('sorts by price from low to high', async ({ signedIn }) => {
    await signedIn.sortBy('lohi');
    const prices = await signedIn.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts by price from high to low', async ({ signedIn }) => {
    await signedIn.sortBy('hilo');
    const prices = await signedIn.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('every product has a name and a price', async ({ signedIn }) => {
    const names = await signedIn.productNames();
    const prices = await signedIn.productPrices();
    expect(names).toHaveLength(prices.length);
    for (const name of names) expect(name.trim()).not.toBe('');
    for (const price of prices) expect(price).toBeGreaterThan(0);
  });

  test('the first product is the backpack by default', async ({ signedIn }) => {
    expect((await signedIn.productNames())[0]).toBe(products.backpack);
  });
});
