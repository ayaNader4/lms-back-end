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
const getAll = require("../../modules/getAll");
const coursePrerequisite = require("../../modules/coursePrequisite");
const { Console } = require("console");
const assignmentModule = require("../../modules/assignment");
const userAffiliation = require("../../modules/userAffiliation");

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

      // 2 - convert image_url to a full url
      if (course.image_url)
        course.image_url =
          "http://" + request.hostname + ":4000/" + course.image_url;

      // 2 - get students of the course
      const students = await getAll.courseStudents(course.name);

      // 3 - return the course Students
      return response.status(200).json({ course: course, students: students });
    } catch (err) {
      console.log(err);
      return response.status(500).json(err);
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

      // 2 - convert image_url to a full url
      if (course.image_url)
        course.image_url =
          "http://" + request.hostname + ":4000/" + course.image_url;

      // 3 - get student assignments
      const studentAssignments = await getAll.studentAssignments(
        request.query.user_id,
        course.name
      );

      // 4 - return the course Students
      return response.status(200).json(studentAssignments);
    } catch (err) {
      console.log(err);
      return response.status(500).json(err);
    }
  }
);

// SET STUDENT GRADE
router.put(
  "/course-students/assignments/student-grade/:id", //?assignment_id = & ?user_id =
  authorized,
  instructor,
  body("grade").isInt().withMessage("Enter a valid Grade"),
  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      const student_id = parseInt(request.query.user_id);

      // 2 - Check if course exists
      const course = await courseModule.find(response, request.params.id);
      if (!course.id) {
        return;
      }

      // 3 - check if instructor teaches course
      const instructor = await userAffiliation.check(
        response,
        response.locals.user.id,
        course.name,
        "teaching"
      );
      if (!instructor)
        return response.status(404).json({ message: "User not affiliated!" });

      const assignment_id = parseInt(request.query.assignment_id);
      // 4 - check if assignment exists or not
      const assignment = await assignmentModule.find(
        response,
        assignment_id,
        course.name
      );
      if (!assignment.id) {
        return;
      }

      // 5 - check if student registered the course
      const student = await userAffiliation.check(
        response,
        student_id,
        course.name,
        "active"
      );
      if (!student) {
        return response.status(404).json({ message: "User not affiliated!" });
      }

      // 5 - update grade into db
      await assignmentModule.updateGrade(
        request.body.grade,
        assignment_id,
        student_id
      );

      // 6 - check if final
      if (assignment.name == "Final Exam") {
        await userAffiliation.applyTotalGrade(
          response,
          instructor.total_grade,
          student_id,
          course.name
        );
      }

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
