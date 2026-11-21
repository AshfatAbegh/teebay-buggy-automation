class SignInPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.signUpLink = page.getByRole('link', { name: 'Sign Up' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async signIn(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  errorMessage(text) {
    return this.page.getByText(text, { exact: true });
  }
}

module.exports = { SignInPage };
