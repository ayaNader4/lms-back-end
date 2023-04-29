const router = require("express").Router();
const connection = require("../../db/dbConnection");
const { body } = require("express-validator");
const util = require("util");
const crypto = require("crypto");
const authorized = require("../../middleware/authorize");
const student = require("../../middleware/student");
const validate = require("../../modules/validate");
const bcrypt = require("bcrypt");
const checkEmail = require("../../modules/checkEmail.js");
const admin = require("../../middleware/admin");
const courseModule = require("../../modules/course");
const upload = require("../../middleware/uploadImages");
const search = require("../../modules/search");
const getAll = require("../../modules/getAll");
const { IsEligible } = require("../../modules/coursePrequisite");
const userAffiliation = require("../../modules/userAffiliation");
const assignment = require("../../modules/assignment");

// STUDENTS
// GET ALL COURSES
router.get("/courses", authorized, student, async (request, response) => {
  try {
    // 1 - get all courses from DB
    const courses = await getAll.courses(
      response,
      response.locals.user.id,
      request.query.search,
      request.query.type
    );

    // 2 - convert image_url to full url
    courses.map((course) => {
      course.image_url =
        "http://" + request.hostname + ":4000/" + course.image_url;
      delete course.total_grade;
    });

    // 3 - return courses
    return response.status(200).json(courses);
  } catch (err) {
    console.log(err);
    return response.status(400).json(err);
  }
});

// SHOW SPECIFIC COURSE
router.get("/course/:id", authorized, student, async (request, response) => {
  try {
    // 1 - check if course exists or not
    const course = await courseModule.find(response, request.params.id);
    if (!course.id) return;
    // 2 - convert image_url to a full url
    if (course.image_url)
      course.image_url =
        "https://" + request.hostname + ":4000/" + course.image_url;

    // 3 - get assignments
    let assignments;

    const isCourseTaken = await userAffiliation.check(
      response,
      response.locals.user.id,
      course.name,
      "active"
    );
    console.log(isCourseTaken);
    if (isCourseTaken) {
      assignments = await getAll.studentAssignments(
        response.locals.user.id,
        course.name
      );
    }

    // 4 - return course
    return response
      .status(200)
      .json({ course: course, assignments: assignments });
  } catch (err) {
    console.log(err);
    return response.status(400).json(err);
  }
});

// REGISTER COURSE
router.post("/course/:id", authorized, student, async (request, response) => {
  try {
    // 1 - check if course exists or not
    const course = await courseModule.find(response, request.params.id);
    if (!course.id) return;

    // 2 - check if user can register course (pre-requisites)
    const prerequisite = await IsEligible(
      response,
      response.locals.user.id,
      request.params.id
    );
    if (prerequisite) return;

    // 3 - check if student registered the course previously
    const affiliationExists = await userAffiliation.find(
      response,
      response.locals.user.id,
      course.name,
      "active"
    );
    if (affiliationExists) return;

    // 3- insert course object into dlbo
    await userAffiliation.insert(
      response,
      response.locals.user.token,
      course.name,
      "active"
    );

    // 5 - get affiliation id
    const affiliation_id = await userAffiliation.check(
      response,
      response.locals.user.id,
      course.name,
      "active"
    );

    // 4 - add course assignments
    const assignments = await assignment.assign(
      response,
      response.locals.user.id,
      course.name,
      affiliation_id.id
    );
    if (assignments) return;

    return response
      .status(200)
      .json({ message: "Course successfully added" })
      .end();
    // await courseModule.insert(response, courseData);
  } catch (err) {
    console.log(err);
    return response.status(500).json({ err: err });
  }
});

module.exports = router;
