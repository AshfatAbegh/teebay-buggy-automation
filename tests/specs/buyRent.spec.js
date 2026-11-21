const { test, expect } = require('@playwright/test');
const { ProductDetailsPage } = require('../pages/productDetailsPage');
const { loginAsExistingUser } = require('../fixtures/auth');
const { seedProducts } = require('../fixtures/testData');

test.describe('Buy / Rent Products', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsExistingUser(page);
  });

  test('positive: buying an available product marks it SOLD and hides the action buttons', async ({ page }) => {
    const details = new ProductDetailsPage(page);
    await details.goto(seedProducts.availableForBuyAndRent.id);

    await expect(details.buyButton).toBeVisible();
    await details.buy();

    await expect(page.getByText('SOLD', { exact: true })).toBeVisible();
    await expect(details.buyButton).toHaveCount(0);
    await expect(details.rentButton).toHaveCount(0);
  });

  test('positive: renting an available product adds it to the rent history', async ({ page }) => {
    const details = new ProductDetailsPage(page);
    await details.goto(seedProducts.availableForBuyAndRent.id);

    await expect(details.rentButton).toBeVisible();
    await details.rent('2027-01-10', '2027-01-20');

    await expect(page.getByText(/Rent history:.*2027/)).toBeVisible();
  });

  test('positive: an already-sold product shows no Buy/Rent buttons', async ({ page }) => {
    const details = new ProductDetailsPage(page);
    await details.goto(seedProducts.alreadySold.id);

    await expect(page.getByText('SOLD', { exact: true })).toBeVisible();
    await expect(details.buyButton).toHaveCount(0);
    await expect(details.rentButton).toHaveCount(0);
  });

  test('positive: visiting a product details page increments its view count', async ({ page }) => {
    const details = new ProductDetailsPage(page);
    await details.goto(seedProducts.alreadySold.id);

    await expect(details.viewsLabel).toHaveText('Views: 201');
  });
});

test.describe('Known bugs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsExistingUser(page);
  });

  test('BUG-19: rent form submits with no validation at all (empty dates accepted)', async ({ page }) => {
    test.fail();
    const details = new ProductDetailsPage(page);
    await details.goto(seedProducts.availableForBuyAndRent.id);
    await details.rentButton.click();
    await details.bookRentButton.click();

    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('BUG-20: End Date field is mislabeled "Last Name"', async ({ page }) => {
    test.fail();
    const details = new ProductDetailsPage(page);
    await details.goto(seedProducts.availableForBuyAndRent.id);
    await details.rentButton.click();

    await expect(page.getByText('End date')).toBeVisible();
  });

  test('BUG-21: a currently-rented product still shows active Buy/Rent buttons', async ({ page }) => {
    test.fail();
    const details = new ProductDetailsPage(page);
    await details.goto(seedProducts.currentlyRented.id);

    await expect(page.getByText('CURRENTLY RENTED')).toBeVisible();
    await expect(details.buyButton).toHaveCount(0);
    await expect(details.rentButton).toHaveCount(0);
  });

  test('BUG-22: rent dates are stored one month off (timezone-independent month off-by-one)', async ({ page }) => {
    test.fail();
    const details = new ProductDetailsPage(page);
    await details.goto(seedProducts.availableForBuyAndRent.id);
    await details.rent('2027-03-01', '2027-03-15');

    // Expected: "Mar 1st 2027" per the date actually entered.
    // Actual: new Date(y, m, d) with a 1-indexed month renders as April.
    await expect(page.getByText(/Mar 1st 2027/)).toBeVisible();
  });

  test('BUG-23: your own product\'s details page cannot be opened via the URL you\'d reach from My Products', async ({ page }) => {
    test.fail();
    const details = new ProductDetailsPage(page);
    // "Cricket kit" is seed userProducts id 1 — never merged into allProducts (see BUG-02 in
    // the sign-in report), so its details page reports "Product does not exist!".
    await details.goto(1);

    await expect(page.getByText('Cricket kit')).toBeVisible();
    await expect(page.getByText('Product does not exist!')).not.toBeVisible();
  });
});
