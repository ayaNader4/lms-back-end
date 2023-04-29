const router = require("express").Router();
const connection = require("../../db/dbConnection");
const { body } = require("express-validator");
const util = require("util");
const crypto = require("crypto");
const authorized = require("../../middleware/authorize");
const validate = require("../../modules/validate");
const bcrypt = require("bcrypt");
const checkEmail = require("../../modules/checkEmail.js");
const admin = require("../../middleware/admin");
const userModule = require("../../modules/user");
const userAffiliation = require("../../modules/userAffiliation");
const getAll = require("../../modules/getAll");

// ADD STUDENT
router.post(
  "/add-student",
  authorized,
  admin,
  body("email").isEmail().withMessage("Enter a valid email"),

  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 2 - check if e-mail exists
      if (await checkEmail.Exists(response, request.body.email)) return;

      // 3 - prepare object user to save
      const userData = {
        name: null,
        email: request.body.email,
        phone: null,
        password: null,
        type: "student",
        token: crypto.randomBytes(16).toString("hex"),
        // json web token is too complicated, we'll use crypto which is a ran
      };

      // insert user object into db
      await userModule.insert(response, userData);

      return response
        .status(200)
        .json({ message: "Student inserted sucessfully!" });
    } catch (err) {
      console.log(err);
      return response.status(500).json({ err: err });
    }
  }
);

module.exports = router;
