exports.IdError = class IdError extends (
  Error
) {
  constructor(message) {
    super(message);

    this.status = 400;
  }
};

exports.ConflictError = class ConflictError extends (
  Error
) {
  constructor(message) {
    super(message);

    this.status = 409;
  }
};

exports.UnauthorizedError = class UnauthorizedError extends (
  Error
) {
  constructor(message) {
    super(message);

    this.status = 401;
  }
};
