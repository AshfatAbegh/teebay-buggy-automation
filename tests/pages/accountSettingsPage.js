class AccountSettingsPage {
  constructor(page) {
    this.page = page;
    this.firstName = page.locator('input[name="first_name"]');
    this.lastName = page.locator('input[name="last_name"]');
    this.address = page.locator('input[name="address"]');
    this.email = page.locator('input[name="email"]');
    this.phoneNumber = page.locator('input[name="phone_number"]');
    this.updateButton = page.getByRole('button', { name: 'Update' });
  }

  async goto() {
    await this.page.goto('/account-settings');
  }

  errorMessage(text) {
    return this.page.getByText(text, { exact: true });
  }
}

module.exports = { AccountSettingsPage };
