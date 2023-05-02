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

const courses = async (response, id, searchReq, typeReq) => {
  let search = "";
  if (searchReq) {
    search += `where name LIKE '%${searchReq}%''`;
  }
  const courses = await query(`select * from courses ${search}`);
  return courses;
};

// get all students in each course
const courseStudents = async (name) => {
  const students = await query(
    "SELECT users.id as user_id, users.name, user_affiliation.course_name, user_affiliation.total_grade FROM users JOIN user_affiliation ON users.id = user_affiliation.user_id WHERE user_affiliation.course_name = ?  AND user_affiliation.status='active'",
    name
  );
  return students;
};

const studentAssignments = async (user_id, course_name) => {
  const assignments = await query(
    "SELECT assignments.name, details, grade, assignments.total_grade FROM user_assignments JOIN assignments ON user_assignments.assignment_id = assignments.id WHERE user_assignments.user_id = ? AND assignments.course_name = ?",
    [user_id, course_name]
  );
  return assignments;
};

const courseAssignments = async (course_name) => {
  const assignments = await query(
    "SELECT * FROM `assignments` WHERE course_name =?",
    [course_name]
  );
  return assignments;
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
  studentAssignments,
  courseAssignments,
};
