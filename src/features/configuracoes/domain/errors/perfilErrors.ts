export class PerfilError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PerfilError';
  }
}

export class FormatoInvalidoError extends PerfilError {
  constructor() {
    super('Formato não suportado. Envie um arquivo JPEG ou PNG.');
    this.name = 'FormatoInvalidoError';
  }
}

export class ArquivoMuitoGrandeError extends PerfilError {
  constructor() {
    super('O arquivo excede o limite de 5 MB.');
    this.name = 'ArquivoMuitoGrandeError';
  }
}

export class ArquivoInvalidoError extends PerfilError {
  constructor() {
    super('O arquivo enviado não é uma imagem válida.');
    this.name = 'ArquivoInvalidoError';
  }
}

export class StorageIndisponivelError extends PerfilError {
  constructor() {
    super('Não foi possível armazenar a imagem. Tente novamente.');
    this.name = 'StorageIndisponivelError';
  }
}
