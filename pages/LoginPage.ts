import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('input[value="Log In"]');
  }

  async navigate() {
    await this.page.goto(`${process.env.BASE_URL}`);
  }

    async login(username: string, password: string, expectFailure = false) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
      await this.loginButton.click();
      if (!expectFailure) {
          await this.page.waitForLoadState('networkidle');
      }
  }
}
