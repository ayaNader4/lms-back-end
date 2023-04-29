const connection = require("../db/dbConnection");
const util = require("util");
const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await
const assignmentModule = require("../modules/assignment");

const insert = async (response, token, course_name, status) => {
  const user = await query("select id from users where token = ?", [token]);

  await query("insert into user_affiliation set ?", {
    user_id: user[0].id,
    course_name: course_name,
    status: status,
  });
  return;
  // // it only inserts a single course, need to figure out how we would receive multiple courses from the front-end and insert them
};

const update = async (response, affiliation) => {
  // insert the pair into user_affiliation
  await query("update user_affiliation set ? where user_id = ?", [
    affiliation,
    affiliation.id,
  ]);

  return;
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
  await query("delete from user_affiliation where id = ?", id);
  console.log("user failed");
  return;
};

const applyTotalGrade = async (response, total, student_id, course_name) => {
  let grades = await assignmentModule.sumGrades(
    response,
    course_name,
    student_id
  );
  console.log(grades, total);
  let status = "";
  if (grades > total / 2) {
    status = "passed";
    if (grades > total) grades = total;
  } else {
    remove(response, student_id);
    return;
  }

  const studentAffiliation = {
    user_id: student_id,
    total_grade: grades,
    status: status,
  };
  console.log(studentAffiliation);
  await update(response, studentAffiliation);
  return;
};

module.exports = { insert, update, check, find, remove, applyTotalGrade };
