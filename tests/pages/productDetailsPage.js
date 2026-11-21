class ProductDetailsPage {
  constructor(page) {
    this.page = page;
    this.buyButton = page.getByRole('button', { name: 'Buy', exact: true });
    this.rentButton = page.getByRole('button', { name: 'Rent', exact: true });
    this.confirmBuyButton = page.getByRole('button', { name: 'Yes!' });
    this.bookRentButton = page.getByRole('button', { name: 'Book rent' });
    this.startDate = page.locator('input[name="start_date"]');
    this.endDate = page.locator('input[name="end_date"]');
    this.status = page.locator('text=Status:');
    this.viewsLabel = this.page.getByText(/Views: \d+/);
  }

  async goto(productId) {
    await this.page.goto(`/product-details/${productId}`);
  }

  async buy() {
    await this.buyButton.click();
    await this.confirmBuyButton.click();
  }

  async rent(startDate, endDate) {
    await this.rentButton.click();
    await this.startDate.fill(startDate);
    await this.endDate.fill(endDate);
    await this.bookRentButton.click();
  }
}

module.exports = { ProductDetailsPage };
