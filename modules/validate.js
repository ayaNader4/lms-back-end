const { validationResult } = require("express-validator");

const validate = (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response
      .status(403)
      .json({ errors: errors.array(), message: "Validation error" });
  }
};

module.exports = validate;
