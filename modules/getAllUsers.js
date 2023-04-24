const util = require("util");
const connection = require("../db/dbConnection");

const getAllInstructor = async (response, searchReq) => {
  const query = util.promisify(connection.query).bind(connection);
  let search = "where type = 'instructor' ";
  if (searchReq) {
    search = `and name LIKE '%${searchReq}%''`;
  }
  const instructors = await query(`select * from users ${search}`);
  return response.status(200).json(instructors);
};

const getAllStudents = async (response, searchReq) => {
  const query = util.promisify(connection.query).bind(connection);
  let search = "where type= 'student'";
  if (searchReq) {
    search = `and name LIKE '%${searchReq}%''`;
  }
  const students = await query(`select * from users ${search}`);
  return response.status(200).json(students);
};

module.exports = { getAllInstructor, getAllStudents };
