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
const assignment = require("../../modules/assignment");
const userModule = require("../../modules/user");
const userAffiliation = require("../../modules/userAffiliation");

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
        const prerequisite = await coursePrerequisite.check(
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
        prerequisite: request.body.prerequisite,
      };

      // 5 - check if image exists
      if (request.file) courseData.image_url = request.file.filename;

      // 6 - insert course object into db
      await courseModule.insert(courseData);

      // 7 - check if instructor exists
      if (request.body.instructor_id) {
        const instructor = await userModule.find(
          response,
          request.body.instructor_id
        );
        if (!instructor.id) return;

        // 8 - insert instructor into DB
        await userAffiliation.insert(
          response,
          instructor.token,
          request.body.name,
          "teaching",
          null
        );
      }
      // 9 - insert final & midterm exams into assignments
      const assignData = [
        ["Final Exam", "Final", null, courseData.name],
        ["Midterm Exam", "Midterm", null, courseData.name],
        ["Project", "Project", null, courseData.name],
        ["Assignment", "Assignment", null, courseData.name],
      ];
      await assignment.insert(assignData);

      // 9 - return
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

      if (course.prerequisite == request.body.prerequisite) {
        // 3 - check if code is unique or not
        const courseCode = await courseModule.check(
          response,
          request.body.code,
          request.body.name
        );
        if (courseCode) return;
      }

      // 3 - Prepare instructor object
      const courseData = {
        name: request.body.name,
        code: request.body.code,
        description: request.body.description,
        status: "active",
        prerequisite: request.body.prerequisite,
      };
      if (request.file) courseData.image_url = request.file.filename;
      console.log(courseData);
      // insert course object into db
      await courseModule.update(response, courseData, request.params.id);

      return response.status(200).json({
        message: "Course updated successfully",
      });
    } catch (err) {
      console.log(err);
      response.status(500).json(err);
    }
  }
);

module.exports = router;
