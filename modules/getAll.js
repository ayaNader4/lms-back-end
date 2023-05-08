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

const AllCourses = async () => {
  const courses = await query(`
  SELECT courses.id, courses.name, courses.code, courses.description, courses.image_url, courses.status, courses.prerequisite, users.name as instructor_name, users.id as instructor_id, user_affiliation.status 
  FROM courses
  LEFT JOIN user_affiliation on courses.name = user_affiliation.course_name
  LEFT JOIN users on user_affiliation.user_id = users.id 
  where user_affiliation.status = 'teaching' or user_affiliation.status is null`);
  return courses;
};

const courses = async (response, id, searchReq, typeReq) => {
  let search = "";
  let type = "";
  if (searchReq && typeReq) {
    search = `and courses.name LIKE '%${searchReq}%'`;
  } else if (searchReq) {
    search = `where name LIKE '%${searchReq}%'`;
  }

  if (typeReq == "available") {
    const courses = await query(
      `select * from courses 
      join user_affiliation on courses.prerequisite = user_affiliation.course_name 
      where user_affiliation.status = "passed" 
      UNION
      select * from courses
      join user_affiliation on courses.name = user_affiliation.course_name 
      where courses.prerequisite is null and courses.name not in (
          select courses.name from courses 
          join user_affiliation on courses.name = user_affiliation.course_name 	
          where user_affiliation.user_id = ? )
      group by courses.name`,
      id
    );
    return courses;
  } else if (typeReq) {
    type = ` where user_affiliation.user_id=${id} and user_affiliation.status LIKE '%${typeReq}%'  `;
  }
  const courses = await query(
    `select name, code, description, image_url, total_grade, courses.id from courses join user_affiliation on courses.name=user_affiliation.course_name ${type} ${search} group by name`
  );
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
    "SELECT *, courses.id as course_id FROM courses JOIN user_affiliation ON courses.name = user_affiliation.course_name WHERE user_id = ? AND user_affiliation.status = 'Teaching'",
    id
  );
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
    "SELECT assignments.id, assignments.name, details, grade, assignments.total_grade FROM user_assignments JOIN assignments ON user_assignments.assignment_id = assignments.id WHERE user_assignments.user_id = ? AND assignments.course_name = ?",
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
  AllCourses,
};
