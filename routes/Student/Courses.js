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
const getAll = require("../../modules/getAll");
const { IsEligible } = require("../../modules/coursePrequisite");

// STUDENTS
// GET ALL COURSES
router.get("/courses", async (request, response) => {
  try {
    // 1 - get all courses from DB
    const courses = await getAll.courses(response, request.query.search);

    // 2 - convert image_url to full url
    courses.map((course) => {
      course.image_url =
        "http://" + request.hostname + ":4000/" + course.image_url;
    });

    // 3 - return courses
    return response.status(200).json(courses);
  } catch (err) {
    console.log(err);
    return response.status(400).json(err);
  }
});

// SHOW SPECIFIC COURSE
router.get("/course/:id", async (request, response) => {
  try {
    // 1 - check if course exists or not
    const course = await courseModule.find(response, request.params.id);
    if (!course.id) return;

    // 2 - convert image_url to a full url
    if (course.image_url)
      course.image_url =
        "https://" + request.hostname + ":4000/" + course.image_url;

    // 3 - return course
    return response.status(200).json(course);
  } catch (err) {
    console.log(err);
    return response.status(400).json(err);
  }
});

// REGISTER COURSE
router.post("/course/:id", authorized, async (request, response) => {
  try {
    // 1 - check if course exists or not
    const course = await courseModule.find(response, request.params.id);
    if (!course.id) return;

    // 2 - check if user can register course (pre-requisites)
    /*
        1->2 1 fail->2X
        want to register subject, get subject code:
        search(pl) -> cs-112
        subject_code = 112
        query: select * from user_affiliation where code < subject_code
    */
    await IsEligible(response, response.locals.user.id, request.params.id);
    // 3 -
    // 5- insert course object into db
    // await courseModule.insert(response, courseData);
    return response
      .status(200)
      .json({ message: "Course successfully added" })
      .end();
  } catch (err) {
    console.log(err);
    return response.status(500).json({ err: err });
  }
});

module.exports = router;
