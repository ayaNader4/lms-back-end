const connection = require("../db/dbConnection");
const util = require("util"); // helper

const authorized = async (request, response, next) => {
  const query = util.promisify(connection.query).bind(connection);
  const { token } = request.headers;
  const user = await query("select * from users where token = ?", [token]);
  if (user[0]) {
    response.locals.user = user[0]
    next();
  } else {
    response.status(403).json({
      msg: "You are not authorized to access this route",
    });
  }
};

module.exports = authorized;
