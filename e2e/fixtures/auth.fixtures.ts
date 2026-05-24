export interface ExistingUserFixture {
  email: string;
  password: string;
}

export interface NewUserFixture {
  nome: string;
  email: string;
  password: string;
  cnpj: string;
  razaoSocial: string;
}

export interface DuplicateConflictFixture {
  email: string;
  cnpj: string;
}

export function existingUser(): ExistingUserFixture {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error('E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.test');
  }
  return { email, password };
}

export function newUser(): NewUserFixture {
  const ts = Date.now();
  const digits = String(ts).slice(-14).padStart(14, '0');
  return {
    nome: `Usuário Teste ${ts}`,
    email: `e2e+${ts}@licita.one`,
    password: 'SenhaSegura123!',
    cnpj: digits,
    razaoSocial: `Empresa Teste ${ts} Ltda`,
  };
}

export function duplicateConflict(): DuplicateConflictFixture {
  const email = process.env.E2E_CONFLICT_EMAIL ?? 'conflito@e2e.licita.one';
  const cnpj = process.env.E2E_CONFLICT_CNPJ;
  if (!cnpj) {
    throw new Error('E2E_CONFLICT_CNPJ must be set in .env.test');
  }
  return { email, cnpj };
}
