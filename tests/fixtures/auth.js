const { SignInPage } = require('../pages/signInPage');
const { existingUser } = require('./testData');

async function loginAsExistingUser(page) {
  const signIn = new SignInPage(page);
  await signIn.goto();
  await signIn.signIn(existingUser.email, existingUser.password);
  await page.waitForURL(/my-products/);
}

module.exports = { loginAsExistingUser };
