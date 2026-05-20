/**
 * Contratos de domínio da feature de autenticação.
 * Este arquivo é artefato de planejamento — não é importado pela aplicação.
 * A implementação real ficará em src/features/auth/domain/
 */

// ─────────────────────────────────────────────────────────────
// Entidades
// ─────────────────────────────────────────────────────────────

export interface Licitante {
  id: string;
  cnpj: string;
  nomeEmpresa: string;
}

export interface User {
  id: string;
  email: string;
  nomeCompleto: string;
  licitantes: Licitante[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  licitante: Licitante;
}

// ─────────────────────────────────────────────────────────────
// Erros de domínio
// ─────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super('Sessão expirada ou inválida');
    this.name = 'UnauthenticatedError';
  }
}

// ─────────────────────────────────────────────────────────────
// Contrato do repositório (interface para injeção de dependência)
// ─────────────────────────────────────────────────────────────

export interface IAuthRepository {
  /**
   * Autentica o usuário via POST /api/login.
   * O servidor define o cookie HttpOnly BEARER na resposta.
   * @throws AuthError se credenciais inválidas (401)
   * @throws AuthError se serviço indisponível (rede)
   */
  login(credentials: LoginCredentials): Promise<void>;

  /**
   * Encerra a sessão via POST /api/logout.
   * O servidor expira o cookie BEARER.
   */
  logout(): Promise<void>;

  /**
   * Recupera o perfil do usuário autenticado via GET /api/me.
   * @throws UnauthenticatedError se 401 (cookie ausente ou expirado)
   */
  getMe(): Promise<User>;
}

// ─────────────────────────────────────────────────────────────
// Contrato do React Context
// ─────────────────────────────────────────────────────────────

export interface AuthContextValue {
  /** Estado da sessão ativa. null = não autenticado. */
  session: AuthSession | null;
  /** true enquanto executa chamadas de auth (login, logout, restore) */
  isLoading: boolean;
  /** Mensagem de erro legível para exibição na UI. null = sem erro. */
  error: string | null;
  /** Atalho: true quando session !== null */
  isAuthenticated: boolean;
  /**
   * Executa login + busca de perfil em sequência.
   * Em caso de sucesso, session é populada (user + licitante se único vínculo).
   */
  login(credentials: LoginCredentials): Promise<void>;
  /** Executa logout e zera session. */
  logout(): Promise<void>;
  /** Define o licitante ativo da sessão (chamado após seleção manual). */
  selectLicitante(licitante: Licitante): void;
}

// ─────────────────────────────────────────────────────────────
// Contratos de Use Cases
// ─────────────────────────────────────────────────────────────

export interface ILoginUseCase {
  execute(credentials: LoginCredentials): Promise<void>;
}

export interface ILogoutUseCase {
  execute(): Promise<void>;
}

export interface IGetMeUseCase {
  execute(): Promise<User>;
}
