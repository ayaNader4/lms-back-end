const util = require('util')
const connection = require('../db/dbConnection')

const getCourses = async (request, response, next) => {
    const query = util.promisify(connection.query).bind(connection); // transforms mysql queries to promises so we can use async/await
    const courses = await query("select name from courses");
    response.locals.courses = courses;
}
module.exports=getCourses;