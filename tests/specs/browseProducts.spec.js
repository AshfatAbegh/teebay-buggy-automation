const { test, expect } = require('@playwright/test');
const { BrowseProductsPage } = require('../pages/browseProductsPage');
const { loginAsExistingUser } = require('../fixtures/auth');
const { seedProducts } = require('../fixtures/testData');

test.describe('Browse Products', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsExistingUser(page);
  });

  test('positive: browsing shows the platform\'s existing products', async ({ page }) => {
    const browse = new BrowseProductsPage(page);
    await browse.goto();

    await expect(browse.productCardByTitle(seedProducts.alreadySold.title)).toBeVisible();
    await expect(browse.productCardByTitle(seedProducts.availableForBuyAndRent.title)).toBeVisible();
  });

  test('positive: filtering by category narrows the results', async ({ page }) => {
    const browse = new BrowseProductsPage(page);
    await browse.goto();

    await browse.categoryDropdown.click();
    await page.getByRole('option', { name: 'Furniture', exact: true }).click();
    await browse.filterButton.click();

    await expect(browse.productCardByTitle('Ikea couch')).toBeVisible();
    await expect(browse.productCardByTitle(seedProducts.availableForBuyAndRent.title)).toHaveCount(0);
  });

  test('positive: clicking Clear resets the filtered list', async ({ page }) => {
    const browse = new BrowseProductsPage(page);
    await browse.goto();

    await browse.categoryDropdown.click();
    await page.getByRole('option', { name: 'Furniture', exact: true }).click();
    await browse.filterButton.click();
    await expect(browse.productCardByTitle(seedProducts.availableForBuyAndRent.title)).toHaveCount(0);

    await browse.clearButton.click();
    await expect(browse.productCardByTitle(seedProducts.availableForBuyAndRent.title)).toBeVisible();
  });
});

test.describe('Known bugs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsExistingUser(page);
  });

  test('BUG-14: logged-in user\'s own products never appear in Browse Products', async ({ page }) => {
    test.fail();
    const browse = new BrowseProductsPage(page);
    await browse.goto();

    // Spec: "You are allowed to see your own products in the browsing list."
    await expect(browse.productCardByTitle('Cricket kit')).toBeVisible();
  });

  test('BUG-15: Title search field has no effect on results', async ({ page }) => {
    test.fail();
    const browse = new BrowseProductsPage(page);
    await browse.goto();
    await browse.titleFilter.fill('Ikea couch');
    await browse.filterButton.click();

    await expect(browse.productCardByTitle(seedProducts.alreadySold.title)).toHaveCount(0);
    await expect(browse.productCardByTitle('Ikea couch')).toBeVisible();
  });

  test('BUG-16: enabling Buy Filters with no min/max set returns zero results instead of all', async ({ page }) => {
    test.fail();
    const browse = new BrowseProductsPage(page);
    await browse.goto();
    await browse.buyFiltersCheckbox.click();
    await browse.filterButton.click();

    await expect(browse.productCardByTitle('Ikea couch')).toBeVisible();
  });

  test('BUG-17: an inverted price range (min > max) silently returns zero results with no explanation', async ({ page }) => {
    test.fail();
    const browse = new BrowseProductsPage(page);
    await browse.goto();
    await browse.buyFiltersCheckbox.click();
    await browse.minBuyRange.fill('10000');
    await browse.maxBuyRange.fill('10');
    await browse.filterButton.click();

    await expect(page.getByText(/invalid range|min.*less than.*max/i)).toBeVisible();
  });

  test('BUG-18: "Load More" always fails with a fake timeout error after 5 seconds', async ({ page }) => {
    // Unlike the other known-bug tests, this one positively confirms the bug (rather than
    // asserting ideal behavior and relying on test.fail()) to avoid racing the 5s setTimeout.
    const browse = new BrowseProductsPage(page);
    await browse.goto();
    await page.getByRole('button', { name: 'Load More' }).click();

    await expect(page.getByText('Request timed out!')).toBeVisible({ timeout: 7000 });
  });
});
