const util = require("util");
const connection = require("../db/dbConnection");
const query = util.promisify(connection.query).bind(connection);

const insert = async (response, data) => {
  const user = await query("insert into assignments set ?", data);
  return;
  // return response.status(200).json(userData);
};

const assign = async (response, user_id, course_name) => {
  const assignment_id = await query(
    "select id from assignments where course_name = ?",
    course_name
  );
  await query("insert into user_assignments set ?", {
    user_id: user_id,
    assignment_id: assignment_id,
    grade: null,
  });
  return;
};

const assignAll = async () => {};

const find = async (response, id) => {
  const course = await query("select * from courses where id = ?", [id]);
  // console.log(course);
  if (!course[0]) {
    return response.status(404).json({ message: "Course is not found!" });
  }
  return course[0];
};

const check = async (response, code, name) => {
  const course = await query(
    "select * from courses where code = ? or name = ?",
    [code, name]
  );
  if (course[0]) {
    return response.status(404).json({ message: "Course already exists" });
  }
  return;
};

const remove = async (response, id) => {
  await query("delete from courses where id = ?", id);
  return response.status(200).json({
    message: "Course deleted successfully",
  });
};

const update = async (response, courseData, id) => {
  await query("update courses set ? where id=?", [courseData, id]);

  return response.status(200).json({
    message: "Course updated successfully",
  });
};

module.exports = { remove, find, insert, assign, assignAll, update, check };
