const { validationResult } = require("express-validator");

const validate = (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response
      .status(400)
      .json({ errors: errors.array(), msg: "validation error" });
  }
};

module.exports = validate;
