const { test, expect } = require('@playwright/test');
const { NavigationBar } = require('../pages/navigationBar');
const { loginAsExistingUser } = require('../fixtures/auth');

test.describe('Navigation & session', () => {
  test('positive: visiting a protected route while logged out redirects to sign-in', async ({ page }) => {
    await page.goto('/my-products');

    await expect(page).toHaveURL(/signin/);
    await expect(page.getByText('You need to login in order to see this page!')).toBeVisible();
  });

  test('positive: logging out navigates back to sign-in', async ({ page }) => {
    await loginAsExistingUser(page);
    const nav = new NavigationBar(page);
    await nav.logout();

    await expect(page).toHaveURL(/signin/);
  });

  test('positive: a protected route is re-protected after logout (once session storage settles)', async ({ page }) => {
    await loginAsExistingUser(page);
    const nav = new NavigationBar(page);
    await nav.logout();
    await expect(page).toHaveURL(/signin/);

    // Give redux-persist a moment to flush the logged-out state to sessionStorage before a
    // full reload re-hydrates from it (see BUG-27 for what happens without this wait).
    await page.waitForTimeout(500);
    await page.goto('/my-products');
    await expect(page).toHaveURL(/signin/);
  });
});

test.describe('Known bugs', () => {
  test('BUG-27: immediately reloading a protected route right after logout can skip the redirect', async ({ page }) => {
    test.fail();
    await loginAsExistingUser(page);
    const nav = new NavigationBar(page);
    await nav.logout();
    await expect(page).toHaveURL(/signin/);

    // No settle time here, unlike the positive test above: redux-persist (sessionStorage,
    // store.js) hasn't necessarily flushed the logged-out state yet when the full reload
    // re-hydrates from storage, so the stale "logged in" state can let the route through.
    await page.goto('/my-products');
    await expect(page).toHaveURL(/signin/);
  });

  test('BUG-24: Bought/Sold/Borrowed/Lent List nav tab crashes the app on click', async ({ page }) => {
    test.fail();
    await loginAsExistingUser(page);
    const nav = new NavigationBar(page);

    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await nav.boughtSoldLink.click();

    // Expected: a bought/sold/borrowed/lent list page renders.
    // Actual: navigationBar.jsx calls itemModalOpen() — the boolean STATE value, not its
    // setter — which throws "itemModalOpen is not a function" (hooks/useModal.js).
    expect(pageErrors.length).toBe(0);
  });
});
