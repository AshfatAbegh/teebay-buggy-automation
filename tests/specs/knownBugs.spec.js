/**
 * These tests encode confirmed bugs from the bug report (see bug_reports PDF /
 * docs/bug-reports.md). Each is annotated test.fail() so the suite stays green
 * while the app is buggy, and turns red (flagging a regression-fixed-without-
 * updating-the-test) the day the bug is actually fixed.
 */
const { test, expect } = require('@playwright/test');
const { SignInPage } = require('../pages/signInPage');
const { existingUser } = require('../fixtures/testData');
const { loginAsExistingUser } = require('../fixtures/auth');

test.describe('Known bugs', () => {
  test('BUG-01: empty Email field shows "Password is required" instead of an email-specific message', async ({ page }) => {
    test.fail();
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.passwordInput.fill(existingUser.password);
    await signIn.signInButton.click();

    await expect(signIn.errorMessage('Email is required')).toBeVisible();
  });

  test('BUG-02: password field does not mask input (type="text" instead of type="password")', async ({ page }) => {
    test.fail();
    const signIn = new SignInPage(page);
    await signIn.goto();
    await expect(signIn.passwordInput).toHaveAttribute('type', 'password');
  });

  test('BUG-25: revisiting /signin or /register while already logged in just re-renders the form', async ({ page }) => {
    test.fail();
    await loginAsExistingUser(page);
    await page.goto('/signin');

    // Expected: redirected away since the user is already authenticated (PreSignIn's intent,
    // but it's commented out in App.js with the note "PreSignIn doesn't work").
    await expect(page).not.toHaveURL(/signin/);
  });
});
