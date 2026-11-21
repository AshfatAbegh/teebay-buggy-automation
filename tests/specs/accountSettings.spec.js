const { test, expect } = require('@playwright/test');
const { AccountSettingsPage } = require('../pages/accountSettingsPage');
const { loginAsExistingUser } = require('../fixtures/auth');

test.describe('Account Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsExistingUser(page);
  });

  test('positive: updating account details shows a success confirmation', async ({ page }) => {
    const settings = new AccountSettingsPage(page);
    await settings.goto();

    await settings.address.fill('456 New Address Ave');
    await settings.updateButton.click();

    await expect(page.getByText('User updated!')).toBeVisible();
    await expect(settings.address).toHaveValue('456 New Address Ave');
  });

  test('validation: required errors appear when clearing all fields', async ({ page }) => {
    const settings = new AccountSettingsPage(page);
    await settings.goto();

    for (const field of [settings.firstName, settings.lastName, settings.address, settings.email, settings.phoneNumber]) {
      await field.fill('');
    }
    await settings.updateButton.click();

    await expect(settings.errorMessage('First Name is required')).toBeVisible();
    await expect(settings.errorMessage('Last Name is required')).toBeVisible();
    await expect(settings.errorMessage('Address is required')).toBeVisible();
    await expect(settings.errorMessage('Email is required')).toBeVisible();
    // Phone number's required message is covered separately — see BUG-26: clearing it to an
    // empty string trips yup's number type-coercion before the "required" check ever runs.
  });

  test('validation: rejects malformed email address', async ({ page }) => {
    const settings = new AccountSettingsPage(page);
    await settings.goto();
    await settings.email.fill('not-an-email');
    await settings.updateButton.click();

    await expect(settings.errorMessage('Please enter a valid email address')).toBeVisible();
  });
});

test.describe('Known bugs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsExistingUser(page);
  });

  test('BUG-06: custom "Only number is accepted" message never shows for non-numeric phone input', async ({ page }) => {
    test.fail();
    const settings = new AccountSettingsPage(page);
    await settings.goto();
    await settings.phoneNumber.fill('not-a-number');
    await settings.updateButton.click();

    await expect(settings.errorMessage('Only number is accepted')).toBeVisible();
  });

  test('BUG-26: clearing Phone Number entirely shows no "Phone number is required" message', async ({ page }) => {
    test.fail();
    const settings = new AccountSettingsPage(page);
    await settings.goto();
    await settings.phoneNumber.fill('');
    await settings.updateButton.click();

    await expect(settings.errorMessage('Phone number is required')).toBeVisible();
  });
});
