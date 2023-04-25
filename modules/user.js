const util = require("util");
const connection = require("../db/dbConnection");
const query = util.promisify(connection.query).bind(connection);

const insert = async (response, userData) => {
  const user = await query("insert into users set ?", userData);
  console.log("inserted user");
  delete userData.password;
  return;
  // return response.status(200).json(userData);
};

const find = async (response, id) => {
  const user = await query("select * from users where id = ?", [id]);
  if (!user[0]) {
    return response.status(404).json({ message: "User is not found!" });
  }
  return user[0];
};

const remove = async (response, id) => {
  await query("delete from users where id = ?", id);
  return response.status(200).json({
    message: "User deleted successfully",
  });
};

const update = async (response, userData, id) => {
  await query("update users set ? where id=?", [userData, id]);
  return;
  //   return response.status(200).json({
  //     msg: "user updated successfully",
  //   });
};

module.exports = { remove, find, insert, update };
