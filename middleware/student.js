const student = async (request, response, next) => {
    user = response.locals.user;
    if (user.type == "student") {
      next();
    } else {
      response.status(403).json({
        message: "You are not authorized to access this route",
      });
    }
  };
  
  module.exports = student;
  