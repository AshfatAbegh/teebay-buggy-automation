const { test, expect } = require('@playwright/test');
const { RegistrationPage } = require('../pages/registrationPage');

test.describe('Registration', () => {
  test('validation: required-field errors appear when submitting an empty form', async ({ page }) => {
    const registration = new RegistrationPage(page);
    await registration.goto();
    await registration.registerButton.click();

    await expect(registration.errorMessage('Last Name is required')).toBeVisible();
    await expect(registration.errorMessage('Address is required')).toBeVisible();
    await expect(registration.errorMessage('Email is required')).toBeVisible();
    await expect(registration.errorMessage('Phone number is required')).toBeVisible();
    await expect(registration.errorMessage('Password is required')).toBeVisible();
  });

  test('validation: rejects malformed email address', async ({ page }) => {
    const registration = new RegistrationPage(page);
    await registration.goto();
    await registration.fillValid({ email: 'not-an-email' });
    await registration.registerButton.click();

    await expect(registration.errorMessage('Please enter a valid email address')).toBeVisible();
  });
});

test.describe('Known bugs', () => {
  test('BUG-03: no happy path exists — a fully valid registration always fails', async ({ page }) => {
    test.fail();
    const registration = new RegistrationPage(page);
    await registration.goto();
    await registration.fillValid();
    await registration.registerButton.click();

    // Expected: the account is created and the user is taken to sign-in (or logged in).
    // Actual: registrationForm.jsx unconditionally calls toast.error(...) for every submission.
    await expect(page.getByText('Internal error occurred. Please check the server!')).not.toBeVisible();
    await expect(page).not.toHaveURL('/register');
  });

  test('BUG-04: firstName has no required validation (asymmetric with lastName)', async ({ page }) => {
    test.fail();
    const registration = new RegistrationPage(page);
    await registration.goto();
    await registration.fillValid({ firstName: '' });
    await registration.registerButton.click();

    await expect(registration.errorMessage('First Name is required')).toBeVisible();
  });

  test('BUG-05: confirmPassword is never validated against password', async ({ page }) => {
    test.fail();
    const registration = new RegistrationPage(page);
    await registration.goto();
    await registration.fillValid({ password: 'Password123', confirmPassword: 'SomethingElse456' });
    await registration.registerButton.click();

    await expect(registration.errorMessage('Passwords must match')).toBeVisible();
  });
});
