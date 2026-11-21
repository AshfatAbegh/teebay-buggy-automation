class BrowseProductsPage {
  constructor(page) {
    this.page = page;
    this.titleFilter = page.locator('input[name="title"]');
    this.categoryDropdown = page.getByRole('listbox').first();
    this.buyFiltersCheckbox = page.getByText('Buy Filters');
    this.rentFiltersCheckbox = page.getByText('Rent Filters');
    this.minBuyRange = page.getByPlaceholder('Min').first();
    this.maxBuyRange = page.getByPlaceholder('Max').first();
    this.clearButton = page.getByRole('button', { name: 'Clear' });
    this.filterButton = page.getByRole('button', { name: 'Filter' });
  }

  async goto() {
    await this.page.goto('/browse-products');
  }

  productCardByTitle(title) {
    return this.page.getByText(title, { exact: true }).first();
  }

  async openProduct(title) {
    await this.productCardByTitle(title).click();
  }
}

module.exports = { BrowseProductsPage };
