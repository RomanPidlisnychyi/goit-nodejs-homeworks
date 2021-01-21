const { IdError } = require('../helpers/errorConstructor');

exports.handlerErrors = handlerErrors = (err, req, res, next) => {
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return next(new IdError('LIMIT_UNEXPECTED_FILE'));
  }
  next(err);
};
