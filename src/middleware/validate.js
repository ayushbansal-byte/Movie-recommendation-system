/**
 * validate.js  –  Validation / Sanitization runner
 *
 * Covers: Validation, Sanitization, Validation Libraries (express-validator)
 *
 * Call after express-validator's check() chain.
 * Returns 422 Unprocessable Entity with field-level error messages on failure.
 */

'use strict';

const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error:  'Validation failed',
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
