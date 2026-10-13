import { test, expect } from '../../fixtures/test';
import { customer, products } from '../../fixtures/users';

test.describe('Cart and checkout', () => {
  test('a product added from the list appears in the cart @smoke', async ({
    signedIn,
    cartPage,
  }) => {
    await signedIn.addToCart(products.backpack);
    await expect(signedIn.cartBadge).toHaveText('1');
    await signedIn.openCart();
    await cartPage.expectProducts([products.backpack]);
  });

  test('the cart badge counts every product added', async ({ signedIn }) => {
    await signedIn.addToCart(products.backpack);
    await signedIn.addToCart(products.bikeLight);
    await signedIn.addToCart(products.boltShirt);
    await expect(signedIn.cartBadge).toHaveText('3');
  });

  test('removing the only product empties the cart and clears the badge', async ({
    signedIn,
    cartPage,
  }) => {
    await signedIn.addToCart(products.backpack);
    await signedIn.removeFromCart(products.backpack);
    await expect(signedIn.cartBadge).toHaveCount(0);
    await signedIn.openCart();
    await cartPage.expectEmpty();
  });

  test('a complete purchase ends with the confirmation page @smoke', async ({
    signedIn,
    cartPage,
    checkoutPage,
  }) => {
    await signedIn.addToCart(products.backpack);
    await signedIn.addToCart(products.bikeLight);
    await signedIn.openCart();
    await cartPage.expectProducts([products.backpack, products.bikeLight]);
    await cartPage.checkout();
    await checkoutPage.fillInformation(customer);
    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
  });

  test('the order total is the sum of the items plus tax', async ({
    signedIn,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await signedIn.addToCart(products.backpack);
    await signedIn.addToCart(products.boltShirt);
    await signedIn.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(customer);

    const read = async (testId: string) =>
      Number((await page.getByTestId(testId).innerText()).replace(/[^0-9.]/g, ''));

    const subtotal = await read('subtotal-label');
    const tax = await read('tax-label');
    const total = await read('total-label');

    expect(subtotal).toBeCloseTo(29.99 + 15.99, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  for (const [missing, info, message] of [
    ['first name', { lastName: customer.lastName, postalCode: customer.postalCode }, 'First Name is required'],
    ['last name', { firstName: customer.firstName, postalCode: customer.postalCode }, 'Last Name is required'],
    ['postal code', { firstName: customer.firstName, lastName: customer.lastName }, 'Postal Code is required'],
  ] as const) {
    test(`checkout is blocked when the ${missing} is missing`, async ({
      signedIn,
      cartPage,
      checkoutPage,
    }) => {
      await signedIn.addToCart(products.backpack);
      await signedIn.openCart();
      await cartPage.checkout();
      await checkoutPage.fillInformation(info);
      await checkoutPage.expectError(message);
    });
  }
});
