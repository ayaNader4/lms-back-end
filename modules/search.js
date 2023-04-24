const util = require("util");
const connection = require("../db/dbConnection");

const search = async (items, table) => {
  const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await
  const result = await query(`select ${items} from ${table}`);
  return result;
};

const searchWithCondition = async (items, table, condition, value) => {
  const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await
  const result = await query(
    `select ${items} from ${table} where ${condition} = '${value}'`
  );
  return result;
};

module.exports = { search, searchWithCondition };
