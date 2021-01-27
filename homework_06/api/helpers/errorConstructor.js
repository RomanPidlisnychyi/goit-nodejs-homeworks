exports.IdError = class IdError extends (
  Error
) {
  constructor(message) {
    super(message);

    this.status = 400;
    delete this.stack;
  }
};

exports.ConflictError = class ConflictError extends (
  Error
) {
  constructor(message) {
    super(message);

    this.status = 409;
    delete this.stack;
  }
};

exports.UnauthorizedError = class UnauthorizedError extends (
  Error
) {
  constructor(message) {
    super(message);

    this.status = 401;
    delete this.stack;
  }
};

exports.NotFoundError = class NotFoundError extends (
  Error
) {
  constructor(message) {
    super(message);

    this.status = 404;
    delete this.stack;
  }
};
