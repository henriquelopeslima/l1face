export class ConviteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConviteError';
  }
}

export class ConviteTokenInvalidoError extends ConviteError {
  constructor(message: string) {
    super(message);
    this.name = 'ConviteTokenInvalidoError';
  }
}

export class ConviteJaRespondidoError extends ConviteError {
  constructor(message: string) {
    super(message);
    this.name = 'ConviteJaRespondidoError';
  }
}

export class ConviteExpiradoError extends ConviteError {
  constructor(message: string) {
    super(message);
    this.name = 'ConviteExpiradoError';
  }
}
