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

// GET TEACHING COURSES
router.get("/courses", authorized, instructor, async (request, response) => {
  try {
    // 1 - get taught courses from DB
    const courses = await getAll.teachingCourses(response.locals.user.id);

    // 2 - convert image_url to full url
    courses.map((course) => {
      course.image_url =
        "http://" + request.hostname + ":4000/" + course.image_url;
    });

    // 3 - get assignments
    const assignments = await getAll.assignments(response.locals.user.id);

    // 4 - return courses & assignments
    return response
      .status(200)
      .json({ courses: courses, assignments: assignments });
  } catch (err) {
    console.log(err);
    return response.status(400).json(err);
  }
});

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

      // 2 get students of the course
      const students = await getAll.courseStudents(course.name);

      // 3 - return the course Students
      return response.status(200).json(students);
    } catch (err) {
      console.log(err);
      return response.status(400).json(err);
    }
  }
);

// SET ASSIGNMENT GRADE

module.exports = router;
