const util = require("util");
const connection = require("../db/dbConnection");
const query = util.promisify(connection.query).bind(connection);
const courseModule = require("../modules/course");

const check = async (response, name) => {
  const course = await query("select * from courses where name = ?", name);
  //   console.log(course);

  if (!course[0]) {
    return response
      .status(404)
      .json({ message: "Prerequisite course does not exist!" });
  }
  return;
};

const IsEligible = async (response, user_id, course_id) => {
  // const course_name = await query(
  //   "select name from courses where id = ?",
  //   course_id
  // );
  // 1 - get course's name
  const course_name = await courseModule.find(response, course_id);

  // 2 - get course's prerequisites
  const prerequisite = await query(
    "select prerequisite from courses where name = ?",
    course_name.name
  );
  // 3 - get prerequisite's status
  const status = await query(
    "select status from user_affiliation where user_id = ? and course_name = ?",
    [user_id, prerequisite[0].prerequisite]
  );

  // console.log(course_name.name);
  // console.log(prerequisite[0].prerequisite);
  // console.log(status[0].status);
  //?
  prereq: if (prerequisite[0].prerequisite) {
    if (!status[0]) {
      break prereq;
    } else if (status[0].status == "passed") {
      return;
    }
  } else {
    return;
  }
  return response
    .status(400)
    .json({ message: "Ineligible to register the course" });
};
module.exports = { check, IsEligible };
