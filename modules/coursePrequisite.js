const util = require("util");
const connection = require("../db/dbConnection");
const query = util.promisify(connection.query).bind(connection);

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
  const course_name = await query(
    "select name from courses where id = ?",
    course_id
  );

  const prerequisite = await query(
    "select prerequisite from courses where name = ?",
    course_name[0].name
  );

  const status = await query(
    "select status from user_affiliation where user_id = ? and course_name = ?",
    [user_id, prerequisite[0].prerequisite]
  );

  console.log(course_name[0].name);
  console.log(prerequisite[0].prerequisite);
  console.log(status);

  //prerquesetd
  /*
    if (prereq)
        if(status = passed)
            insert
        elsedd
            return failed response2
    else
        insert
*/
  //   if (!prerequisite[0].prerequisite && status[0] == "passed") {
  //     return await query("insert into user_affiliation set ?", {
  //       user_id: user_id,
  //       course_name: course_name[0].name,
  //       status: "active",
  //     });
  //   }

  if (!prerequisite[0].prerequisite) {
    return await query("insert into user_affiliation set ?", {
      user_id: user_id,
      course_name: course_name[0].name,
      status: "active",
    });
  } else {
    if (status[0].status == "passed") {
      return await query("insert into user_affiliation set ?", {
        user_id: user_id,
        course_name: course_name[0].name,
        status: "active",
      });
    }
  }
  return response
    .status(400)
    .json({ message: "Ineligible to register the course" });
};
module.exports = { check, IsEligible };
