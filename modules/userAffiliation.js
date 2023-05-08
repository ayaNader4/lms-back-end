const connection = require("../db/dbConnection");
const util = require("util");
const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await
const assignmentModule = require("../modules/assignment");

const insert = async (response, token, course_name, status, grade) => {
  const user = await query("select id from users where token = ?", [token]);

  await query("insert into user_affiliation set ?", {
    user_id: user[0].id,
    course_name: course_name,
    status: status,
    total_grade: grade
  });
  return;
  // // it only inserts a single course, need to figure out how we would receive multiple courses from the front-end and insert them
};

const update = async (response, affiliation, user_id, course_name) => {
  // insert the pair into user_affiliation
  const result = await query(
    "update user_affiliation set ? where user_id = ? and course_name = ?",
    [affiliation, user_id, course_name]
  );
  console.log(result.affectedRows);
  const updated_row = await query(
    "select * from user_affiliation where user_id = ? and course_name = ?",
    [user_id, affiliation.course_name]
  );

  return updated_row;
  // it only inserts a single course, need to figure out how we would receive multiple courses from the front-end and insert them
};

const check = async (response, user_id, course_name, status) => {
  // insert the pair into user_affiliation
  const course_taken = await query(
    "select * from user_affiliation where user_id = ? and course_name = ? and status = ?",
    [user_id, course_name, status]
  );
  return course_taken[0];
};

const find = async (response, user_id, course_name, status) => {
  // insert the pair into user_affiliation
  const course_taken = await query(
    "select * from user_affiliation where user_id = ? and course_name = ? and status = ?",
    [user_id, course_name, status]
  );
  if (course_taken[0])
    return response.status(404).json({ message: "User already affiliated!" });
  else return;
};

const remove = async (response, id) => {
  await query("delete from user_affiliation where user_id = ?", id);
  console.log("user failed");
  return;
};

const applyTotalGrade = async (
  response,
  assignment_name,
  total,
  student_id,
  course_name
) => {
  let grades = await assignmentModule.sumGrades(
    response,
    course_name,
    student_id
  );
  let status = "active";

  // determine pass status
  if (assignment_name == "Final Exam") {
    if (grades > total / 2) {
      status = "passed";
    } else {
      // student failed, delete their affiliation
      
      remove(response, student_id);
      return;
    }
  }

  if (grades > total)
    // student can't exceed maximum grade
    grades = total;
  const studentAffiliation = {
    user_id: student_id,
    total_grade: grades,
    status: status,
  };
  console.log(studentAffiliation);
  await update(response, studentAffiliation, student_id, course_name);
  return;
};

module.exports = { insert, update, check, find, remove, applyTotalGrade };
