const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/courseAppDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error: ", err));

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true } // role could be 'student' or 'teacher'
});

const User = mongoose.model('User', userSchema);

// Dummy data for courses (you already have this)
let courses = [
  { id: 'CS101', name: 'CS101', description: 'Overview of computer science', instructor: 'Prof. Brown' },
  { id: 'MATH101', name: 'MATH101', description: 'Introductory algebra', instructor: 'Prof. Johnson' }
];

let availableCourses = [
  { id: 'CS101', name: 'CS101', description: 'Overview of computer science', instructor: 'Prof. Brown' },
  { id: 'SDEV255', name: 'SDEV255', description: 'Web development course', instructor: 'Prof. Hamby' }
];

// Set up session
app.use(session({
  secret: 'your-secret-key', // Replace this with a more secure key in production
  resave: false,
  saveUninitialized: false
}));

// Middleware to check if user is logged in
function checkLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Home page
app.get('/', (req, res) => {
  res.render('index', { active: 'home', availableCourses });
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { active: 'login' });
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user; // Store user data in session
    res.redirect('/dashboard');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Dashboard page (protected)
app.get('/dashboard', checkLogin, (req, res) => {
  if (req.session.user.role === 'student') {
    res.send(`Welcome, Student ${req.session.user.username}`);
  } else if (req.session.user.role === 'teacher') {
    res.send(`Welcome, Teacher ${req.session.user.username}`);
  }
});

// View courses page
app.get('/view-courses', checkLogin, (req, res) => {
  res.render('view-courses', { active: 'view-courses', courses });
});

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.redirect('/login');
  });
});

// Sign-up page
app.get('/sign-up', (req, res) => {
  res.render('sign-up', { active: 'sign-up' });
});

// Handle sign-up form submission
app.post('/sign-up', async (req, res) => {
  const { username, password, role } = req.body;

  // Check if the username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).send('Username already taken');
  }

  // Hash the password before saving it to the database
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create a new user
  const newUser = new User({ username, password: hashedPassword, role });

  try {
    await newUser.save();
    res.redirect('/login');  // Redirect to login page after successful registration
  } catch (err) {
    res.status(500).send('Error saving user');
  }
});

// Handle adding a new course
app.post('/add-course', checkLogin, (req, res) => {
  const { course_id, course_name, description, instructor } = req.body;
  if (course_id && course_name && description && instructor) {
    courses.push({ id: course_id, name: course_name, description, instructor });
    res.redirect('/view-courses');
  } else {
    res.status(400).send('All fields are required.');
  }
});

// Edit course page (pre-filling form)
app.get('/edit-course/:id', checkLogin, (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (course) {
    res.render('edit-course', { active: 'edit-course', course });
  } else {
    res.status(404).send('Course not found');
  }
});

// Handle editing a course
app.post('/courses/edit/:id', checkLogin, (req, res) => {
  const { courseName, courseDescription, courseInstructor, courseCredits } = req.body;
  const course = courses.find(c => c.id === req.params.id);

  if (course) {
    course.name = courseName;
    course.description = courseDescription;
    course.instructor = courseInstructor;
    course.credits = courseCredits;

    res.redirect('/view-courses');
  } else {
    res.status(404).send('Course not found');
  }
});

// Handle deleting a course
app.post('/delete-course/:id', checkLogin, (req, res) => {
  const courseId = req.params.id;
  const courseIndex = courses.findIndex(c => c.id === courseId);
  if (courseIndex !== -1) {
    courses.splice(courseIndex, 1);
    res.redirect('/view-courses');
  } else {
    res.status(404).send('Course not found');
  }
});

// Route to show details for a specific course
app.get('/course/:id', (req, res) => {
  const courseId = req.params.id;
  const course = courses.find(c => c.id === courseId);
  if (course) {
    res.render('course-details', { active: 'course-details', course });
  } else {
    res.status(404).send('Course not found');
  }
});

// 404 page
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
