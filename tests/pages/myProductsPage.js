class MyProductsPage {
  constructor(page) {
    this.page = page;
    this.addProductButton = page.getByRole('button', { name: 'Add Product' });
    this.deleteConfirmButton = page.getByRole('button', { name: 'Yes, delete' });
  }

  async goto() {
    await this.page.goto('/my-products');
  }

  productCardByTitle(title) {
    return this.page.getByText(title, { exact: true }).first();
  }

  deleteButtonForCard(title) {
    // The trash-icon <Button> is a direct following sibling of the title element in the DOM
    // (see productCard.jsx: StyledTitle and the delete Button both live directly under StyledHeader).
    return this.productCardByTitle(title).locator('xpath=following-sibling::button[1]');
  }

  async openProduct(title) {
    await this.productCardByTitle(title).click();
  }
}

module.exports = { MyProductsPage };
