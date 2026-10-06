export class InvalidLeadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLeadError';
  }
}
