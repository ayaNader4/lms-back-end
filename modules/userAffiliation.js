const connection = require("../db/dbConnection");
const util = require("util");
const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await

const insert = async (response, token, course_name, status) => {
  // get course id
  // const course = await query("select id from courses where name = ?", [
  //   course_name,
  // ]);

  // get user id
  const user = await query("select id from users where token = ?", [token]);

  // insert the pair into user_affiliation
  await query("insert into user_affiliation set ?", {
    user_id: user[0].id,
    course_name: course_name,
    status: status,
  });
  return response
    .status(200)
    .json({ message: "User affiliation inserted successfully" });
  // it only inserts a single course, need to figure out how we would receive multiple courses from the front-end and insert them
  //return response.status(200).json({ course: course, user: user });
};

const update = async (response, id, course_name) => {
  // get course id
  // const course = await query("select id from courses where name = ?", [
  //   course_name,
  // ]);

  // insert the pair into user_affiliation
  const us = await query("update user_affiliation set ? where user_id = ?", [
    { user_id: id, course_name: course_name },
    id,
  ]);

  console.log(us);
  return response
    .status(200)
    .json({ message: "User affiliation updated successfully" });
  // it only inserts a single course, need to figure out how we would receive multiple courses from the front-end and insert them
  //return response.status(200).json({ course: course, user: user });
};


module.exports = { insert, update };
