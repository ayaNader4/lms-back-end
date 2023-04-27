const util = require("util");
const connection = require("../db/dbConnection");
const query = util.promisify(connection.query).bind(connection);

const instructors = async (response, searchReq) => {
  let search = "where type = 'instructor' ";
  if (searchReq) {
    search += `and name LIKE '%${searchReq}%''`;
  }
  const instructors = await query(`select * from users ${search}`);
  return instructors;
};

const students = async (response, searchReq) => {
  let search = "where type= 'student'";
  if (searchReq) {
    search += `and name LIKE '%${searchReq}%''`;
  }
  const students = await query(`select * from users ${search}`);
  return students;
};

const courses = async (response, searchReq) => {
  let search = "";
  if (searchReq) {
    search += `where name LIKE '%${searchReq}%''`;
  }
  const courses = await query(`select * from courses ${search}`);
  return courses;
};

const assignments = async (user_id) => {
  const assignments = await query(
    "SELECT * FROM courses JOIN assignments ON courses.name = assignments.course_name JOIN user_affiliation ON courses.name = user_affiliation.course_name WHERE user_affiliation.user_id = ? ",
    user_id
  );
  return assignments;
};

const registeredCourses = async (id) => {
  const courses = await query(
    "SELECT * FROM courses JOIN user_affiliation ON courses.name = user_affiliation.course_name WHERE user_id = ? AND user_affiliation.status = 'active'",
    id
  );

  return courses;
};
const passedCourses = async (id) => {
  const courses = await query(
    "SELECT * FROM courses JOIN user_affiliation ON courses.name = user_affiliation.course_name WHERE user_id = ? AND user_affiliation.status = 'passed'",
    id
  );

  return courses;
};

//Teached Courses
const teachingCourses = async (id) => {
  const courses = await query(
    "SELECT * FROM courses JOIN user_affiliation ON courses.name = user_affiliation.course_name WHERE user_id = ? AND user_affiliation.status = 'Teaching'",
    id
  );

  return courses;
};

// get all students in each course
const courseStudents = async (name) => {
  const students = await query(
    "SELECT * FROM users JOIN user_affiliation ON users.id = user_affiliation.user_id WHERE user_affiliation.course_name = ?  AND user_affiliation.status='active'",
    name
  );
  return students;
};

module.exports = {
  instructors,
  students,
  courses,
  assignments,
  registeredCourses,
  passedCourses,
  teachingCourses,
  courseStudents,
};
