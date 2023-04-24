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
const getAllUsers = require("../../modules/getAllUsers");

// MANAGING INSTRUCTORS
// ADD
router.post(
  "/add-instructor",
  authorized,
  admin,
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
  body("courses").isString(),

  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 2 - check if e-mail exists
      if (await checkEmail.Exists(response, request.body.email)) return;

      // 3 - prepare object user to save
      const userData = {
        name: request.body.name,
        email: request.body.email,
        phone: request.body.phone,
        password: await bcrypt.hash(request.body.password, 10),
        type: "instructor",
        token: crypto.randomBytes(16).toString("hex"),
        // json web token is too complicated, we'll use crypto which is a ran
      };

      // insert user object into db
      await userModule.insert(response, userData);

      // insert user's affiliation with the course
      await userAffiliation.insert(
        response,
        userData.token,
        request.body.courses
      );
      return;
    } catch (err) {
      console.log(err);
      return response.status(500).json({ err: err });
    }
  }
);

// DELETE
router.delete("/delete/:id", authorized, admin, async (request, response) => {
  try {
    // 1 - check if istructor exists or not
    const user = await userModule.find(response, request.params.id);
    if (!user.id) return;

    // 2 - delete instructor from DB
    await userModule.remove(response, request.params.id);
    return;
  } catch (err) {
    console.log(err);
    return response.status(500).json(err);
  }
});

// GET ALL INSTRUCTORS
router.get("/", authorized, admin, async (request, response) => {
  await getAllUsers.getAllInstructor(response, request.query.search);
});

// router.get("/students", authorized, async (request, response) => {
//   await getAllUsers.getAllStudents(response, request.query.search);
// });

// UPDATE
router.put(
  "/update-instructor/:id",
  authorized,
  admin, //to access form-data
  body("email").isEmail().withMessage("Enter a valid email"),
  body("name")
    .isString()
    .withMessage("Enter a valid name")
    .isLength({ min: 3, max: 20 })
    .withMessage("Name should be within 5-20 characters"),
  body("password")
    .isStrongPassword()
    .withMessage("Password should be within 7-12 characters"),
  body("phone")
    .isString()
    .withMessage("Enter a valid phone number")
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number should be 11 digits"),
  body("courses").isString(),
  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 2 - check if user exists or not
      const user = await userModule.find(response, request.params.id);
      if (!user.id) return;

      // 3 - Prepare instructor object
      const instructorData = {
        name: request.body.name,
        email: request.body.email,
        phone: request.body.phone,
        password: await bcrypt.hash(request.body.password, 10),
        type: "instructor",
        token: crypto.randomBytes(16).toString("hex"),
      };

      // insert user object into db
      await userModule.update(response, instructorData, request.params.id);

      // insert user's affiliation with the course
      await userAffiliation.update(
        response,
        request.params.id,
        request.body.courses
      );
      return;
    } catch (err) {
      console.log(err);
      response.status(500).json(err);
    }
  }
);

module.exports = router;
