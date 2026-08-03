export class InstrumentosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InstrumentosError';
  }
}

export class FormatoInvalidoAnexoError extends InstrumentosError {
  constructor() {
    super('Apenas arquivos PDF são aceitos.');
    this.name = 'FormatoInvalidoAnexoError';
  }
}

export class ArquivoMuitoGrandeAnexoError extends InstrumentosError {
  constructor() {
    super('O arquivo excede o limite de 10 MB.');
    this.name = 'ArquivoMuitoGrandeAnexoError';
  }
}
