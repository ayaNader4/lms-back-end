const bcrypt = require("bcrypt");
const util = require("util");
const connection = require("../db/dbConnection");

const checkPassword = async (password, response, email) => {
  const query = util.promisify(connection.query).bind(connection);
  const user = await query("select * from users where email = ?", [email]);
  const passwordExists = await bcrypt.compare(password, user[0].password);
  if (passwordExists) {
    delete user[0].password;
    return response.status(200).json(user[0]);
  } else {
    return response.status(404).json({
      message: "E-mail or password not found",
    });
  }
};

module.exports = checkPassword;
