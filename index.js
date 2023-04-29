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

const manage_instructors = require("./routes/Admin/Instructors");
const manage_courses = require("./routes/Admin/Courses");
const manage_students = require("./routes/Admin/Students");

const manage_assignments = require("./routes/Instructor/Courses");
const manage_course_students = require("./routes/Instructor/Students");

const student = require("./routes/Student/Courses");

// RUN THE APP
app.listen(4000, "127.0.0.1", () => {
  console.log("server is running");
});

// API ROUTES/ENDPOINTS
app.use("/auth", auth);
app.use("/admin/manage", manage_instructors);
app.use("/admin/courses", manage_courses);
app.use("/admin/students", manage_students);

app.use("/instructor/manage", manage_assignments);
app.use("/instructor/students", manage_course_students);

app.use("/", student);
