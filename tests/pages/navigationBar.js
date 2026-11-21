class NavigationBar {
  constructor(page) {
    this.page = page;
    this.myProductsLink = page.getByRole('link', { name: 'My Products' });
    this.browseProductsLink = page.getByRole('link', { name: 'Browse Products' });
    this.boughtSoldLink = page.getByText('Bought/Sold/Borrowed/Lent List');
    this.accountSettingsLink = page.getByRole('link', { name: 'Account Settings' });
    this.logoutLink = page.getByText('Logout', { exact: true });
    this.logoutConfirmButton = page.getByRole('button', { name: 'Yes I am sure!' });
  }

  async logout() {
    await this.logoutLink.click();
    await this.logoutConfirmButton.click();
  }
}

module.exports = { NavigationBar };
