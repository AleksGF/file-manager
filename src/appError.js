export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AppError';
    this.code = 'APP_ERROR';
  }
}
