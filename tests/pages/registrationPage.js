class RegistrationPage {
  constructor(page) {
    this.page = page;
    this.firstName = page.locator('input[name="firstName"]');
    this.lastName = page.locator('input[name="lastName"]');
    this.address = page.locator('input[name="address"]');
    this.email = page.locator('input[name="email"]');
    this.phoneNumber = page.locator('input[name="phoneNumber"]');
    this.password = page.locator('input[name="password"]');
    this.confirmPassword = page.locator('input[name="confirmPassword"]');
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.signInLink = page.getByRole('link', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/register');
  }

  async fillValid(overrides = {}) {
    const data = {
      firstName: 'Jane',
      lastName: 'Doe',
      address: '123 Main St',
      email: `jane.doe.${Date.now()}@example.com`,
      phoneNumber: '1234567890',
      password: 'Password123',
      confirmPassword: 'Password123',
      ...overrides,
    };
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.address.fill(data.address);
    await this.email.fill(data.email);
    await this.phoneNumber.fill(data.phoneNumber);
    await this.password.fill(data.password);
    await this.confirmPassword.fill(data.confirmPassword);
    return data;
  }

  errorMessage(text) {
    return this.page.getByText(text, { exact: true });
  }
}

module.exports = { RegistrationPage };
