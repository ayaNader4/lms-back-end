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


router.get("/courses", authorized, instructor,  async (request, response) => {
    try {
      // 1 - get TeachingCourses courses from DB
      const courses = await getAll.TeachingCourses(response.locals.user.id);
  
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

router.get("/course-Students/:id", authorized, instructor, async (request, response) => {
    try {
      // 1 - get all course-Students from DB;
         const course = await courseModule.find(response, request.params.id);
        if (!course.id) return;
        
        const course_Students = await getAll.courseStudents(course.name);
  
      // 2 - return the course Students
      return response.status(200).json(courseStudents);
    } catch (err) {
      console.log(err);
      return response.status(400).json(err);
    }
  });



module.exports = router;
