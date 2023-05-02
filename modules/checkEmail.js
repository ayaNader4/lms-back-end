const connection = require("../db/dbConnection");
const util = require("util");

const Exists = async (response, email) => {
  const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await
  const user = await query(`select * from users where email = '${email}'`);
  if (user.length != 0)
    return response.status(409).json({ message: "E-mail already exist" });
  return;
};

const NotExists = async (response, email) => {
  const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await
  const user = await query(`select * from users where email = '${email}'`);
  if (user.length == 0)
    return response.status(404).json({ message: "E-mail not found" });
  return;
};

module.exports = { Exists, NotExists };
