const util = require("util");
const connection = require("../db/dbConnection");

const instructors = async (response, searchReq) => {
  const query = util.promisify(connection.query).bind(connection);
  let search = "where type = 'instructor' ";
  if (searchReq) {
    search += `and name LIKE '%${searchReq}%''`;
  }
  const instructors = await query(`select * from users ${search}`);
  return instructors;
};

const students = async (response, searchReq) => {
  const query = util.promisify(connection.query).bind(connection);
  let search = "where type= 'student'";
  if (searchReq) {
    search += `and name LIKE '%${searchReq}%''`;
  }
  const students = await query(`select * from users ${search}`);
  return students;
};

const courses = async (response, searchReq) => {
  const query = util.promisify(connection.query).bind(connection);
  let search = "";
  if (searchReq) {
    search += `where name LIKE '%${searchReq}%''`;
  }
  const courses = await query(`select * from courses ${search}`);
  return courses;
};

module.exports = { instructors, students, courses };
