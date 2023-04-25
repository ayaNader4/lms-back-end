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
const courseModule = require("../../modules/course");
const upload = require("../../middleware/uploadImages");
const search = require("../../modules/search");
const coursePrerequisite = require("../../modules/coursePrequisite");

// COURSES
// ADD
router.post(
  "/add-course",
  authorized,
  admin,
  upload.single("image_url"),
  body("name").isString().withMessage("Enter a valid name"),
  body("code").isString().withMessage("Enter a valid name  "),
  body("prerequisite"), //name of prequisite

  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 2 - check if course exists
      const course = await courseModule.check(
        response,
        request.body.code,
        request.body.name
      );
      if (course) return;

      // 3 - check if prerequisite exists
      if (request.body.prerequisite) {
        const prerequisite = await coursePrerequisite(
          response,
          request.body.prerequisite
        );
        if (prerequisite) return;
      }

      // 4 - prepare object user to save
      const courseData = {
        name: request.body.name,
        code: request.body.code,
        description: request.body.description,
        status: "active",
        prerequisite:request.body.prerequisite,
      };

      // 5 - check if image exists
      if (request.file) courseData.image_url = request.file.filename;

      // 6 - insert course object into db
      await courseModule.insert(response, courseData);

      // 7 - return
      return response
        .status(200)
        .json({ message: "Course successfully added" })
        .end();
    } catch (err) {
      console.log(err);
      return response.status(500).json({ err: err });
    }
  }
);

// DELETE
router.delete("/delete/:id", authorized, admin, async (request, response) => {
  try {
    // 1 - check if instructor exists or not
    const course = await courseModule.find(response, request.params.id);
    if (!course.id) {
      return;
    }

    // 2 - delete instructor from DB
    await courseModule.remove(response, request.params.id);
    return;
  } catch (err) {
    console.log(err);
    return response.status(500).json(err);
  }
});

// UPDATE
router.put(
  "/update-courses/:id",
  authorized,
  admin, //to access form-data
  upload.single("image_url"),
  body("name").isString().withMessage("Enter a valid name"),
  body("code").isString().withMessage("Enter a valid course code "),
  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 2 - check if course exists or not
      const course = await courseModule.find(response, request.params.id);
      if (!course.id) return;

      // 3 - check if code is unique or not
      const courseCode = await courseModule.check(
        response,
        request.body.code,
        request.body.name
      );
      if (courseCode) return;

      // 3 - Prepare instructor object
      const courseData = {
        name: request.body.name,
        code: request.body.code,
        description: request.body.description,
        status: "active",
      };
      if (request.file) courseData.image_url = request.file.filename;

      // insert course object into db
      await courseModule.update(response, courseData, request.params.id);
      return;
    } catch (err) {
      console.log(err);
      response.status(500).json(err);
    }
  }
);

module.exports = router;
