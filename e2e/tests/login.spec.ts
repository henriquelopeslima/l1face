import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { existingUser } from '../fixtures/auth.fixtures';

test.describe('Login', () => {
  test('campo e-mail vazio mostra erro de validação', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.passwordInput.fill('SenhaValida123');
    await login.submitButton.click();
    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText('e-mail');
  });

  test('e-mail com formato inválido mostra erro de validação', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.emailInput.fill('nao-e-um-email');
    await login.passwordInput.fill('SenhaValida123');
    await login.submitButton.click();
    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText('e-mail');
  });

  test('senha menor que 8 caracteres mostra erro de validação', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.emailInput.fill('usuario@example.com');
    await login.passwordInput.fill('curta');
    await login.submitButton.click();
    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText('8 caracteres');
  });

  test('credenciais incorretas mostram erro da API', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillAndSubmit('inexistente@licita.one', 'SenhaErrada123');
    await expect(login.errorMessage).toBeVisible();
  });

  test('credenciais válidas redirecionam para área autenticada', async ({ page }) => {
    let user: ReturnType<typeof existingUser>;
    try {
      user = existingUser();
    } catch {
      test.skip(true, 'E2E_TEST_EMAIL / E2E_TEST_PASSWORD não configurados');
      return;
    }

    const login = new LoginPage(page);
    await login.goto();
    await login.fillAndSubmit(user.email, user.password);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('link "Criar conta" navega para a página de cadastro', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.navigateToCadastro();
    await expect(page).toHaveURL(/\/cadastro/);
  });
});
