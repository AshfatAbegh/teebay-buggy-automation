class UpsertProductPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('input[name="title"]');
    // Rendered order on the page: 1st listbox = Categories, 2nd = rent_duration_type (Frequency).
    this.categoriesDropdown = page.getByRole('listbox').nth(0);
    this.rentFrequencyDropdown = page.getByRole('listbox').nth(1);
    this.description = page.locator('textarea[name="description"]');
    this.purchasePrice = page.locator('input[name="purchase_price"]');
    this.rentPrice = page.locator('input[name="rent_price"]');
    this.submitButton = page.getByRole('button', { name: /Add Product|Save|Update/ });
  }

  async gotoAdd() {
    await this.page.goto('/add-product');
  }

  async gotoEdit(productId) {
    await this.page.goto(`/edit-product/${productId}`);
  }

  async selectCategory(categoryLabel) {
    await this.categoriesDropdown.click();
    await this.page.getByRole('option', { name: categoryLabel, exact: true }).click();
    await this.page.keyboard.press('Escape');
  }

  async selectRentFrequency(label) {
    await this.rentFrequencyDropdown.click();
    await this.page.getByRole('option', { name: label, exact: true }).click();
  }

  errorMessage(text) {
    return this.page.getByText(text, { exact: true });
  }
}

module.exports = { UpsertProductPage };
