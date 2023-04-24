// INITIALIZE EXPRESS APP
const express = require("express");
const app = express();

// GLOBAL MIDDLEWARE
app.use(express.json()); // access json in postman
app.use(express.urlencoded({ extended: true })); // access url form encoded
app.use(express.static("upload"));
const cors = require("cors");
app.use(cors()); // allow http requests through local hosts

// REQUIRE MODULE
const auth = require("./routes/Auth");
//const courses = require("./routes/Courses");
const manage_instructors = require("./routes/Admin/Instructors");
const manage_courses = require("./routes/Admin/Courses");
// RUN THE APP
app.listen(4000, "127.0.0.1", () => {
  console.log("server is running");
});

// API ROUTES/ENDPOINTS
app.use("/auth", auth);
//app.use('/courses', courses);
app.use("/admin/manage", manage_instructors);
app.use("/admin/courses", manage_courses);
