const { test, expect } = require('@playwright/test');
const { SignInPage } = require('../pages/signInPage');
const { existingUser } = require('../fixtures/testData');

test.describe('Sign In', () => {
  test('positive: existing user can sign in with valid credentials', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn(existingUser.email, existingUser.password);

    await expect(page).toHaveURL(/my-products/);
    await expect(page.getByRole('heading', { name: 'My Products' }).or(page.getByText('My Products'))).toBeVisible();
  });

  test('validation: shows required errors when submitting an empty form', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signInButton.click();

    await expect(signIn.errorMessage('Password is required')).toHaveCount(2);
  });

  test('validation: rejects malformed email address', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.emailInput.fill('not-an-email');
    await signIn.passwordInput.fill('123456');
    await signIn.signInButton.click();

    await expect(signIn.errorMessage('Please enter a valid email address')).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('negative: shows toast error for wrong credentials and stays on page', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn(existingUser.email, 'wrong-password');

    await expect(page.getByText('Incorrect username or password. Please try again!')).toBeVisible();
    await expect(page).toHaveURL('/');
  });
});
