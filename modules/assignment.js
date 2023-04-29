const util = require("util");
const connection = require("../db/dbConnection");
const query = util.promisify(connection.query).bind(connection);

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

const assign = async (response, user_id, course_name) => {
  const assignment_id = await query(
    "select id from `assignments` where course_name = ?",
    course_name
  );
  if (!assignment_id[0]) {
    return response
      .status(404)
      .json({ message: "Course assignment does not exist!" });
  }
  await query("insert into user_assignments set ?", {
    user_id: user_id,
    assignment_id: assignment_id[0].id,
    grade: null,
  });
  return;
};

const assignAll = async () => {};

const find = async (response, id) => {
  const assignment = await query("select * from assignments where id = ?", [
    id,
  ]);
  // console.log(course);
  if (!assignment[0]) {
    return response.status(404).json({ message: "assignment is not found!" });
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
    return response.status(404).json({ message: "assignment already exists" });
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

  return response.status(200).json({
    message: "assignment updated successfully",
  });
};

const updateGrade = async (grade, assignment_id, user_id) => {
  await query(
    "update user_assignments set grade = ? where assignment_id = ? and user_id = ?",
    [grade, assignment_id, user_id]
  );

  return;
};

// const getAllAssignment

module.exports = {
  remove,
  find,
  insert,
  assign,
  assignAll,
  update,
  check,
  updateGrade,
};
