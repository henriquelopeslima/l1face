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

export class EmailNaoConfirmadoError extends AuthError {
  constructor() {
    super('Seu e-mail ainda não foi confirmado.');
    this.name = 'EmailNaoConfirmadoError';
  }
}

export class TokenInvalidoError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'TokenInvalidoError';
  }
}

export class TokenExpiradoError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiradoError';
  }
}

export class ContaJaConfirmadaError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'ContaJaConfirmadaError';
  }
}

export class RateLimitReenvioError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitReenvioError';
  }
}
