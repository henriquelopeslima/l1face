import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { newUser, duplicateConflict } from '../fixtures/auth.fixtures';

test.describe('Cadastro', () => {
  test('dados válidos criam conta e redirecionam para área autenticada', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.fillAndSubmit(newUser());
    await expect(page).not.toHaveURL(/\/cadastro/);
  });

  test('senha menor que 8 caracteres mostra erro de validação', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    const user = newUser();
    await register.nomeInput.fill(user.nome);
    await register.emailInput.fill(user.email);
    await register.passwordInput.fill('curta');
    await register.cnpjInput.fill(user.cnpj);
    await register.razaoSocialInput.fill(user.razaoSocial);
    await register.submitButton.click();
    await expect(page.getByText('8 caracteres')).toBeVisible();
  });

  test('CNPJ com formato inválido mostra erro de validação', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    const user = newUser();
    await register.nomeInput.fill(user.nome);
    await register.emailInput.fill(user.email);
    await register.passwordInput.fill(user.password);
    await register.cnpjInput.fill('123');
    await register.razaoSocialInput.fill(user.razaoSocial);
    await register.submitButton.click();
    await expect(page.getByText('CNPJ')).toBeVisible();
  });

  test('razão social com menos de 10 caracteres mostra erro de validação', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    const user = newUser();
    await register.nomeInput.fill(user.nome);
    await register.emailInput.fill(user.email);
    await register.passwordInput.fill(user.password);
    await register.cnpjInput.fill(user.cnpj);
    await register.razaoSocialInput.fill('Curta');
    await register.submitButton.click();
    await expect(page.getByText('razão social')).toBeVisible();
  });

  test('e-mail duplicado mostra erro da API', async ({ page }) => {
    let conflict: ReturnType<typeof duplicateConflict>;
    try {
      conflict = duplicateConflict();
    } catch {
      test.skip(true, 'E2E_CONFLICT_EMAIL / E2E_CONFLICT_CNPJ não configurados');
      return;
    }

    const register = new RegisterPage(page);
    await register.goto();
    const user = newUser();
    await register.fillAndSubmit({ ...user, email: conflict.email });
    await expect(register.errorMessage).toBeVisible();
  });

  test('CNPJ duplicado mostra erro da API', async ({ page }) => {
    let conflict: ReturnType<typeof duplicateConflict>;
    try {
      conflict = duplicateConflict();
    } catch {
      test.skip(true, 'E2E_CONFLICT_CNPJ não configurado');
      return;
    }

    const register = new RegisterPage(page);
    await register.goto();
    const user = newUser();
    await register.fillAndSubmit({ ...user, cnpj: conflict.cnpj });
    await expect(register.errorMessage).toBeVisible();
  });

  test('link "Entrar" navega para a página de login', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.navigateToLogin();
    await expect(page).toHaveURL(/\/login/);
  });

  test('link "Criar conta" na página de login navega para cadastro', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.navigateToCadastro();
    await expect(page).toHaveURL(/\/cadastro/);
  });
});
