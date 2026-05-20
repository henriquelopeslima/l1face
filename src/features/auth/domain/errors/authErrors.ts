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
