import { test, expect } from '../../fixtures/test';
import { users } from '../../fixtures/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('a valid user reaches the product list @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('a locked-out user is told why they cannot sign in @smoke', async ({ loginPage }) => {
    await loginPage.login(users.locked.username, users.locked.password);
    await loginPage.expectError('this user has been locked out');
  });

  test('a wrong password is rejected without revealing which field was wrong', async ({
    loginPage,
  }) => {
    await loginPage.login(users.standard.username, 'not-the-password');
    await loginPage.expectError('Username and password do not match');
  });

  test('both fields are required', async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.expectError('Username is required');
  });

  test('a password is required when a username is given', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, '');
    await loginPage.expectError('Password is required');
  });

  test('the password field masks what is typed', async ({ loginPage }) => {
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('protected pages redirect to login when there is no session', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('error')).toContainText(
      "You can only access '/inventory.html' when you are logged in",
    );
  });
});
