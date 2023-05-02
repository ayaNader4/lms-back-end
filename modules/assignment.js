const util = require("util");
const connection = require("../db/dbConnection");
const query = util.promisify(connection.query).bind(connection);
const userAffiliation = require("./userAffiliation");

const insert = async (data) => {
  //await query("insert into assignments set ?", data);
  //console.log(data);
  await query(
    "insert into assignments (name, details, total_grade, course_name ) values ?",
    [data]
  );
  return;
  // return response.status(200).json(userData);
};

const assign = async (response, user_id, course_name, affiliation_id) => {
  const assignment_id = await query(
    "select id from `assignments` where course_name = ?",
    course_name
  );
  if (!assignment_id[0]) {
    return response
      .status(404)
      .json({ message: "Course assignment does not exist!" });
  }

  assignment_id.map(async (assignment) => {
    console.log(assignment);
    await query("insert into user_assignments set ?", {
      affiliation_id: affiliation_id,
      user_id: user_id,
      assignment_id: assignment.id,
      grade: null,
    });
  });
  return;
};

const assignAll = async (response, course_name, status) => {
  const students = await query(
    "select * from user_affiliation where course_name = ? and status = ?",
    [course_name, status]
  );

  if (!students[0]) {
    return response.status(404).json({ message: "No students registered" });
  }

  students.map(async (student) => {
    await query("insert into user_assignments set ?", {
      affiliation_id: student.id,
      user_id: student.user_id,
      assignment_id: assignment.id,
      grade: null,
    });
  });
};
const find = async (response, id, course_name) => {
  const assignment = await query(
    "select * from assignments where id = ? and course_name = ?",
    [id, course_name]
  );
  // console.log(course);
  if (!assignment[0]) {
    return response.status(404).json({ message: "Assignment is not found!" });
  }
  return assignment[0];
};

const check = async (response, course_name, name) => {
  const assignment = await query(
    "select * from assignments where course_name = ? and name = ?",
    [course_name, name]
  );
  //console.log(assignment[0]);
  if (assignment[0]) {
    return response.status(409).json({ message: "Assignment already exists" });
  }
  return;
};

const remove = async (response, id) => {
  await query("delete from assignments where id = ?", id);
  return response.status(200).json({
    message: "assignment deleted successfully",
  });
};

const update = async (response, assignData, id) => {
  await query("update assignments set ? where id=?", [assignData, id]);

  return;
};

const updateGrade = async (grade, assignment_id, user_id) => {
  await query(
    "update user_assignments set grade = ? where assignment_id = ? and user_id = ?",
    [grade, assignment_id, user_id]
  );

  return;
};

const sumGrades = async (response, course_name, user_id) => {
  const grades = await query(
    "SELECT sum(grade) as total from user_assignments join assignments on user_assignments.assignment_id = assignments.id where assignments.course_name = ? and user_assignments.user_id = ?",
    [course_name, user_id]
  );
  console.log(grades[0].total);
  if (!grades)
    return response.status(404).json({ message: "User not registered" });
  else return grades[0].total;
};

module.exports = {
  remove,
  find,
  insert,
  assign,
  assignAll,
  update,
  check,
  updateGrade,
  sumGrades,
};
