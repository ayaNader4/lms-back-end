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
const assignment = require("../../modules/assignment");
const userAffiliation = require("../../modules/userAffiliation");

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

    // 4 - return courses & assignments
    return response.status(200).json(courses);
  } catch (err) {
    console.log(err);
    return response.status(500).json(err);
  }
});

//GET COURSE ASSIGNMENTS...
router.get(
  "/courses/:course_id",
  authorized,
  instructor,
  upload.single("image"),
  async (request, response) => {
    try {
      const course = await courseModule.find(
        response,
        request.params.course_id
      );
      if (!course.id) {
        return;
      }

      // 2 - convert image_url to a full url
      if (course.image_url)
        course.image_url =
          "http://" + request.hostname + ":4000/" + course.image_url;

      // 3 - get assignments
      const assignments = await getAll.courseAssignments(course.name);

      // 4 - return courses & assignments
      return response
        .status(200)
        .json({ course: course, assignments: assignments });
    } catch (err) {
      console.log(err);
      return response.status(500).json(err);
    }
  }
);

// ADD ASSIGNMENT
router.post(
  "/add-assignments/:id",
  authorized,
  instructor,
  body("name")
    .isString()
    .withMessage("Enter a valid name")
    .isLength({ min: 2, max: 30 })
    .withMessage("Name should be within 5-30 characters"),
  body("details")
    .isString()
    .withMessage("Enter the valid details of the course")
    .isLength({ min: 1, max: 100 })
    .withMessage("Details should be within 5-100 characters"),
  body("total_grade").isNumeric().withMessage("Enter a valid grade"),
  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 2 - check if grade is valid exists
      console.log("done");
      // Check if course exists
      const course = await courseModule.find(response, request.params.id);
      if (!course.id) {
        return;
      }
      const course_name = course.name;
      console.log("course done");

      // Check if assigment is already exists...
      const assign = await assignment.check(
        response,
        course_name,
        request.body.name
      );
      if (assign) {
        return;
      }

      console.log("done2");
      // 3 - prepare object user to save
      const assignData = [
        [
          request.body.name,
          request.body.details,
          request.body.total_grade,
          course_name,
        ],
      ];
      console.log("done3");

      // insert user object into db
      const addedAssignment = await assignment.insert(assignData);
      console.log("done4");

      await assignment.assignAll(response, course_name, addedAssignment.id, "active");

      return response
        .status(200)
        .json({ message: "Assignment inserted sucessfully!" });
    } catch (err) {
      //console.log(err);
      return response.status(500).json({ err: err });
    }
  }
);

// DELETE Assignment
router.delete(
  "/delete/:id", //?assignment_id =
  authorized,
  instructor,
  async (request, response) => {
    try {
      // 1- Check if course exists
      const course = await courseModule.find(response, request.params.id);
      if (!course.id) {
        return;
      }

      // 2 - check if instructor teaches course
      const instructor = await userAffiliation.check(
        response,
        response.locals.user.id,
        course.name,
        "teaching"
      );
      if (!instructor)
        return response.status(404).json({ message: "User not affiliated!" });

      // 3 - check if assignment exists or not
      const assign = await assignment.find(
        response,
        request.query.assignment_id,
        course.name
      );
      if (!assign.id) {
        return;
      }

      // 4 - delete assignment from DB
      await assignment.remove(response, request.query.assignment_id);

      return;
    } catch (err) {
      console.log(err);
      return response.status(500).json(err);
    }
  }
);

// UPDATE
router.put(
  "/update/:id", // ?assignment_id =
  authorized,
  instructor,
  body("name")
    .isString()
    .withMessage("Enter a valid name")
    .isLength({ min: 2, max: 30 })
    .withMessage("Name should be within 5-30 characters"),
  body("details")
    .isLength({ min: 5, max: 100 })
    .withMessage("Details should be within 5-100 characters"),
  body("total_grade").isInt().withMessage("Enter a valid Grade"),
  async (request, response) => {
    try {
      // 1 - validate request (manual, express validation)
      const errors = validate(request, response);
      if (errors) return;

      // 1- Check if course exists
      const course = await courseModule.find(response, request.params.id);
      if (!course.id) {
        return;
      }

      // 2 - check if instructor teaches course
      const instructor = userAffiliation.check(
        response,
        response.locals.user.id,
        course.name,
        "teaching"
      );
      if (!instructor)
        return response.status(403).json({ message: "User not affiliated!" });

      let assignment_id = parseInt(request.query.assignment_id);
      // 4 - check if assignment exists or not
      const assign = await assignment.find(
        response,
        assignment_id,
        course.name
      );
      if (!assign.id) {
        return;
      }

      // 5 - Prepare assignment object
      const assignData = {
        id: assign.id,
        name: request.body.name,
        details: request.body.details,
        total_grade: request.body.total_grade,
        course_name: course.name,
      };

      // insert course object into db
      await assignment.update(response, assignData, assignment_id);

      return response
        .status(200)
        .json({
          assignment: assignData,
          message: "Assignment updated successfully",
        });
    } catch (err) {
      console.log(err);
      response.status(500).json(err);
    }
  }
);

module.exports = router;
