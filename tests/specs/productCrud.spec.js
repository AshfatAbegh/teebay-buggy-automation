const { test, expect } = require('@playwright/test');
const { MyProductsPage } = require('../pages/myProductsPage');
const { UpsertProductPage } = require('../pages/upsertProductPage');
const { loginAsExistingUser } = require('../fixtures/auth');

test.describe('Product CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsExistingUser(page);
  });

  test('positive: add a new product with all fields', async ({ page }) => {
    const upsert = new UpsertProductPage(page);
    await upsert.gotoAdd();

    const title = `Playwright Product ${Date.now()}`;
    await upsert.title.fill(title);
    await upsert.selectCategory('Electronics');
    await upsert.description.fill('Added by an automated Playwright test.');
    await upsert.purchasePrice.fill('199');
    await upsert.rentPrice.fill('19');
    await upsert.selectRentFrequency('Daily');
    await upsert.submitButton.click();

    await expect(page.getByText('New product added!')).toBeVisible();
    await expect(page).toHaveURL(/my-products/);

    const myProducts = new MyProductsPage(page);
    await expect(myProducts.productCardByTitle(title)).toBeVisible();
  });

  test('validation: required-field errors appear when submitting an empty Add Product form', async ({ page }) => {
    const upsert = new UpsertProductPage(page);
    await upsert.gotoAdd();
    await upsert.submitButton.click();

    await expect(upsert.errorMessage('Last Name is required')).toBeVisible(); // title's mislabeled error, see BUG-08
    await expect(page).toHaveURL(/add-product/);
  });

  test('positive: delete a product (while more than one exists)', async ({ page }) => {
    const upsert = new UpsertProductPage(page);
    await upsert.gotoAdd();
    const title = `Deletable Product ${Date.now()}`;
    await upsert.title.fill(title);
    await upsert.selectCategory('Toys');
    await upsert.description.fill('Will be deleted.');
    await upsert.purchasePrice.fill('10');
    await upsert.rentPrice.fill('1');
    await upsert.selectRentFrequency('Daily');
    await upsert.submitButton.click();

    const myProducts = new MyProductsPage(page);
    await expect(myProducts.productCardByTitle(title)).toBeVisible();
    await myProducts.deleteButtonForCard(title).click();
    await myProducts.deleteConfirmButton.click();

    await expect(myProducts.productCardByTitle(title)).toHaveCount(0);
  });
});

test.describe('Known bugs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsExistingUser(page);
  });

  test('BUG-07: every product in My Products renders twice', async ({ page }) => {
    test.fail();
    const myProducts = new MyProductsPage(page);
    await myProducts.goto();

    await expect(page.getByText('Cricket kit', { exact: true })).toHaveCount(1);
  });

  test('BUG-08: Title field\'s required error reads "Last Name is required"', async ({ page }) => {
    test.fail();
    const upsert = new UpsertProductPage(page);
    await upsert.gotoAdd();
    await upsert.submitButton.click();

    await expect(upsert.errorMessage('Title is required')).toBeVisible();
  });

  test('BUG-09: a product can be added with zero categories selected', async ({ page }) => {
    test.fail();
    const upsert = new UpsertProductPage(page);
    await upsert.gotoAdd();
    await upsert.title.fill('No Category Product');
    await upsert.description.fill('No category selected.');
    await upsert.purchasePrice.fill('10');
    await upsert.rentPrice.fill('1');
    await upsert.selectRentFrequency('Daily');
    await upsert.submitButton.click();

    await expect(upsert.errorMessage('At least one category must be selected')).toBeVisible();
  });

  test('BUG-10: deleting your last remaining product is blocked with a fake server error', async ({ page }) => {
    test.fail();
    const myProducts = new MyProductsPage(page);
    await myProducts.goto();

    // Seed data has exactly two distinct user products (Cricket kit, iPhone 13 pro max),
    // each rendered twice due to BUG-07. Delete "iPhone 13 pro max" first to get down to one
    // distinct remaining product, then try to delete that last one too.
    await myProducts.deleteButtonForCard('iPhone 13 pro max').click();
    await myProducts.deleteConfirmButton.click();
    await expect(myProducts.productCardByTitle('iPhone 13 pro max')).toHaveCount(0);

    await myProducts.deleteButtonForCard('Cricket kit').click();

    // Expected: either a confirmation modal appears, or the product is deleted outright.
    // Actual: userProductListPage.jsx blocks deletion at length === 1 and shows a fake error.
    await expect(myProducts.productCardByTitle('Cricket kit')).toHaveCount(0);
  });

  test('BUG-11: editing a product gives no success feedback and does not navigate away', async ({ page }) => {
    test.fail();
    const upsert = new UpsertProductPage(page);
    // "Cricket kit" is seed product id 1 in userProducts.json.
    await upsert.gotoEdit(1);
    await upsert.description.fill('Updated description via automated test.');
    await upsert.submitButton.click();

    await expect(page.getByText(/updated|saved/i)).toBeVisible();
  });

  test('BUG-12: edit mode still shows "Add Product" as the submit button label', async ({ page }) => {
    test.fail();
    const upsert = new UpsertProductPage(page);
    await upsert.gotoEdit(1);

    await expect(page.getByRole('button', { name: 'Save' }).or(page.getByRole('button', { name: 'Update Product' }))).toBeVisible();
  });

  test('BUG-13: editing an existing product accepts a non-numeric Purchase Price', async ({ page }) => {
    test.fail();
    const upsert = new UpsertProductPage(page);
    await upsert.gotoEdit(1);
    await upsert.purchasePrice.fill('');
    await upsert.purchasePrice.fill('not-a-number');
    await upsert.submitButton.click();

    await expect(upsert.errorMessage('must be a number').or(upsert.errorMessage('Must be a number'))).toBeVisible();
  });
});
