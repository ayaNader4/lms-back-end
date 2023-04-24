const util = require("util");
const connection = require("../db/dbConnection");
const query = util.promisify(connection.query).bind(connection);

const insert = async (response, courseData) => {
  const user = await query("insert into courses set ?", courseData);
  delete courseData.password;
  return;
  // return response.status(200).json(userData);
};

const find = async (response, id) => {
  const course = await query("select * from courses where id = ?", [id]);
  if (!course[0]) {
    return response.status(404).json({ message: "Course is not found!" });
  }
  return course[0];
};

const check = async (response, code) => {
  const course = await query("select * from courses where code = ?", [code]);
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
  await query("update users set ? where id=?", [courseData, id]);
  console.log("user updated");
  return;
  //   return response.status(200).json({
  //     msg: "user updated successfully",
  //   });
};

module.exports = { remove, find, insert, update, check };
