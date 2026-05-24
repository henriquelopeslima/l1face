export class AtaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtaError';
  }
}
