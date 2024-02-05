export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AppError';
    this.code = 'APP_ERROR';
  }
}

export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
    this.code = 'INPUT_ERROR';
  }
}
