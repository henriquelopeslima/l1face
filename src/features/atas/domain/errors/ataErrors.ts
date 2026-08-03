export class AtaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtaError';
  }
}

export class FormatoInvalidoAnexoError extends AtaError {
  constructor() {
    super('Apenas arquivos PDF são aceitos.');
    this.name = 'FormatoInvalidoAnexoError';
  }
}

export class ArquivoMuitoGrandeAnexoError extends AtaError {
  constructor() {
    super('O arquivo excede o limite de 10 MB.');
    this.name = 'ArquivoMuitoGrandeAnexoError';
  }
}
