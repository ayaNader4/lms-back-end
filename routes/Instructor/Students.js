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
const instructor = require("../../middleware/instructor");
const courseModule = require("../../modules/course");
const upload = require("../../middleware/uploadImages");
const search = require("../../modules/search");
const getAll = require("../../modules/getAll");
const coursePrerequisite = require("../../modules/coursePrequisite");
const { Console } = require("console");
const assignment = require("../../modules/assignment");

// GET STUDENTS
router.get(
  "/course-students/:id",
  authorized,
  instructor,
  async (request, response) => {
    try {
      // 1 - get course from DB;
      const course = await courseModule.find(response, request.params.id);
      if (!course.id) {
        return;
      }
      console.log(course.name);

      // 2 - get students of the course
      const students = await getAll.courseStudents(course.name);

      // 3 - return the course Students
      return response.status(200).json(students);
    } catch (err) {
      console.log(err);
      return response.status(400).json(err);
    }
  }
);

// GET STUDENTS' ASSIGNMENTS
router.get(
  "/course-students/assignments/:id", //?user_id =
  authorized,
  instructor,
  async (request, response) => {
    try {
      // 1 - get course from DB;
      const course = await courseModule.find(response, request.params.id);
      if (!course.id) {
        return;
      }
      console.log(course.name);

      // 3 - get student assignments
      const studentAssignments = await getAll.studentAssignments(
        request.query.user_id,
        course.name
      );

      // 4 - return the course Students
      return response.status(200).json(studentAssignments);
    } catch (err) {
      console.log(err);
      return response.status(400).json(err);
    }
  }
);

// SET STUDENT GRADE
router.put(
  "/course-students/assignments/student-grade/:id",
  authorized,
  instructor,
  body("grade").isInt().withMessage("Enter a valid Grade"),
  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      const user_id = parseInt(request.query.user_id);

      // 3 - check if assignment exists or not
      const assign = await assignment.find(response, request.params.id);
      if (!assign.id) {
        return;
      }

      // 4 - update grade into db
      await assignment.updateGrade(
        request.body.grade,
        parseInt(request.params.id),
        user_id
      );

      return response
        .status(200)
        .json({ message: "Assignment updated sucessfully!" });
    } catch (err) {
      console.log(err);
      return response.status(500).json({ err: err });
    }
  }
);
module.exports = router;
