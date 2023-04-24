const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "lms",
  port: "3306",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("db connected");
});

module.exports = connection;
