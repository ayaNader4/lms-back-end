const connection = require("../db/dbConnection");
const util = require("util");
const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await

const insert = async (response, token, course_name, status) => {
 
  const user = await query("select id from users where token = ?", [token]);

  // insert the pair into user_affiliation
  const course_taken = await query(
    "select * from user_affiliation where user_id = ? and course_name = ?",
    [user[0].id, course_name]
  );

  if (!course_taken[0]) {
    return await query("insert into user_affiliation set ?", {
      user_id: user[0].id,
      course_name: course_name,
      status: status,
    });
  }

  return;
  // // it only inserts a single course, need to figure out how we would receive multiple courses from the front-end and insert them
};

const update = async (response, id, course_name) => {
  // insert the pair into user_affiliation
  const us = await query("update user_affiliation set ? where user_id = ?", [
    { user_id: id, course_name: course_name },
    id,
  ]);

  return;
  // it only inserts a single course, need to figure out how we would receive multiple courses from the front-end and insert them
};

const check = async (response, user_id, course_name) => {
  // insert the pair into user_affiliation
  const course_taken = await query(
    "select * from user_affiliation where user_id = ? and course_name = ? and status = 'active'",
    [user_id, course_name]
  );

  return course_taken;
};

module.exports = { insert, update, check };
