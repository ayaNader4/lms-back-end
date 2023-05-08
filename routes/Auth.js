const router = require("express").Router();
const connection = require("../db/dbConnection");
const { body } = require("express-validator");
const util = require("util");
const crypto = require("crypto");
const validate = require("../modules/validate");
const checkPassword = require("../modules/checkPassword");
const checkEmail = require("../modules/checkEmail.js");
const bcrypt = require("bcrypt");
const userModule = require("../modules/user");

// LOGIN
router.post(
  "/login",
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 7, max: 12 })
    .withMessage("Password should be within 7-12 characters"),
  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 2 - check if e-mail exists
      const email = await checkEmail.NotExists(response, request.body.email);
      if (email) {
        return;
      }

      // 3 - compare hashed password
      const user = await checkPassword(
        request.body.password,
        response,
        request.body.email
      );
      if (!user)
        return response.status(404).json({
          message: "E-mail or password not found",
        });

      // he wants to add a response here
      return response.status(200).json(user);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ err: err });
    }
  }
);

// REGISTRATION
router.post(
  "/register",
  body("email").isEmail().withMessage("Enter a valid email"),
  body("name")
    .isString()
    .withMessage("Enter a valid name")
    .isLength({ min: 3, max: 20 })
    .withMessage("Name should be within 5-20 characters"),
  body("password")
    .isLength({ min: 7, max: 12 })
    .withMessage("Password should be within 7-12 characters"),
  body("phone")
    .isString()
    .withMessage("Enter a valid phone number")
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number should be 11 digits"),

  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 2 - check if e-mail exists
      const email = await checkEmail.NotExists(response, request.body.email);
      if (email) return;

      // 3 - prepare object user to save
      const userData = {
        name: request.body.name,
        email: request.body.email,
        phone: request.body.phone,
        password: await bcrypt.hash(request.body.password, 10),
        token: crypto.randomBytes(16).toString("hex"),
        type:"student"
        // json web token is too complicated, we'll use crypto which is a ran
      };

      // insert user object into db
      await userModule.update(response, userData);

      // return user
      return response.status(201).json(userData);
    } catch (err) {
      console.log(err);
      return response.status(500).json({ err: err });
    }
  }
);

module.exports = router;
