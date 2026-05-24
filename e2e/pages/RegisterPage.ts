import { type Page, type Locator } from '@playwright/test';
import type { NewUserFixture } from '../fixtures/auth.fixtures';

export class RegisterPage {
  readonly page: Page;
  readonly nomeInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly cnpjInput: Locator;
  readonly razaoSocialInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly linkLogin: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nomeInput = page.getByTestId('register-nome');
    this.emailInput = page.getByTestId('register-email');
    this.passwordInput = page.getByTestId('register-password');
    this.cnpjInput = page.getByTestId('register-cnpj');
    this.razaoSocialInput = page.getByTestId('register-razao-social');
    this.submitButton = page.getByTestId('register-submit');
    this.errorMessage = page.getByTestId('register-error');
    this.linkLogin = page.getByTestId('register-link-login');
  }

  async goto() {
    await this.page.goto('/cadastro');
  }

  async fillAndSubmit(data: NewUserFixture) {
    await this.nomeInput.fill(data.nome);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.cnpjInput.fill(data.cnpj);
    await this.razaoSocialInput.fill(data.razaoSocial);
    await this.submitButton.click();
  }

  async getErrorText(): Promise<string> {
    return this.errorMessage.innerText();
  }

  async navigateToLogin() {
    await this.linkLogin.click();
  }
}
