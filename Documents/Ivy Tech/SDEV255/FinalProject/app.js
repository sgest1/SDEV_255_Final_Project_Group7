const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const port = 3000;
const User = require('./models/user');
const Course = require('./models/course');

// MongoDB Atlas URI 
const dbURI = 'mongodb+srv://group7:group7@group7project.baaev.mongodb.net/?retryWrites=true&w=majority&appName=Group7Project';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global middleware to make 'user' available in all views
app.use((req, res, next) => {
  res.locals.user = req.user; 
  next();
});

// Connect to MongoDB Atlas
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Course Schema
const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  credits: { type: Number, required: false },
});

// Configure passport
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

function isTeacher(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('User:', req.user); // Log user details
    if (req.user.role === 'teacher') {
      return next();
    }
    console.log('Unauthorized: Not a teacher');
  } else {
    console.log('Unauthorized: Not authenticated');
  }
  req.flash('error', 'You are not authorized to perform this action.');
  res.redirect('/login');
}

function isStudent(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('User:', req.user); // Log user details
    if (req.user.role === 'student') {
      return next();
    }
    console.log('Unauthorized: Not a student');
  } else {
    console.log('Unauthorized: Not authenticated');
  }
  res.redirect('/login');
}


// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Home page
app.get('/', isAuthenticated, async (req, res) => {
  const availableCourses = await Course.find(); 
  res.render('index', { active: 'home', availableCourses, user: req.user });
});

// Route to render available courses
app.get('/available-courses', async (req, res) => {
  try {
    const availableCourses = await Course.find({});
    res.render('available-courses', { availableCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Error fetching available courses');
  }
});

// View courses
app.get('/view-courses', isAuthenticated, async (req, res) => {
  try {
    const courses = await Course.find({});
    res.render('view-courses', { courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Error fetching courses');
  }
});

// Route to view course details
app.get('/course/:id', isAuthenticated, async (req, res) => {
  const courseId = req.params.id;
  try {
    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.render('course-details', { course });
  } catch (error) {
    console.error(`Error fetching course with ID ${courseId}:`, error);
    res.status(500).send('Error fetching course details');
  }
});

// Route to render the edit course form
app.get('/edit-course/:id', isTeacher, async (req, res) => {
  const courseId = req.params.id;
  try {
    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.render('edit-course', { course });
  } catch (error) {
    console.error(`Error fetching course with ID ${courseId}:`, error);
    res.status(500).send('Error fetching course details');
  }
});

// Route to handle the course update
app.post('/edit-course/:id', isTeacher, async (req, res) => {
  const courseId = req.params.id;
  const { name, description, instructor, credits } = req.body;
  try {
    const course = await Course.findOneAndUpdate(
      { id: courseId },
      { name, description, instructor, credits },
      { new: true }
    );
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.redirect('/view-courses');
  } catch (error) {
    console.error(`Error updating course with ID ${courseId}:`, error);
    res.status(500).send('Error updating course');
  }
});

// Route to handle deleting a course
app.post('/delete-course/:id', isTeacher, async (req, res) => {
  const courseId = req.params.id;
  try {
    const course = await Course.findOneAndDelete({ id: courseId });
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.redirect('/view-courses');
  } catch (error) {
    console.error(`Error deleting course with ID ${courseId}:`, error);
    res.status(500).send('Error deleting course');
  }
});

// Display student's enrolled courses
app.get('/my-schedule', isStudent, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('courses');
    res.render('my-schedule', { courses: student.courses });
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    req.flash('error', 'Error fetching your schedule. Please try again.');
    res.redirect('/');
  }
});

// Handle adding a new course (teachers) - Render form
app.get('/add-course', isTeacher, (req, res) => {
  res.render('add-course');
});

// Handle adding a new course (teachers) - Submit form
app.post('/add-course', isTeacher, async (req, res) => {
  const { course_id, course_name, description, instructor, credits } = req.body;
  try {
    const newCourse = new Course({
      id: course_id,
      name: course_name,
      description,
      instructor,
      credits,
    });
    await newCourse.save();
    req.flash('success', 'Course added successfully!');
    res.redirect('/view-courses');
  } catch (error) {
    console.error('Error adding course:', error);
    req.flash('error', 'Error adding course. Please try again.');
    res.redirect('/add-course');
  }
});

// Handle adding a course to a student's personal schedule
app.post('/add-course/:id', isStudent, async (req, res) => {
  const courseId = req.params.id;
  try {
    const course = await Course.findOne({ id: courseId });
    if (!course) {
      req.flash('error', 'Course not found.');
      return res.redirect('/available-courses');
    }

    const student = await User.findById(req.user.id);
    if (student.courses.includes(courseId)) {
      req.flash('error', 'You are already enrolled in this course.');
      return res.redirect('/available-courses');
    }

    student.courses.push(courseId);
    await student.save();

    req.flash('success', `Successfully added ${course.name} to your schedule.`);
    res.redirect('/available-courses');
  } catch (err) {
    console.error(`Error adding course ${courseId}:`, err);
    req.flash('error', 'Error adding course. Please try again.');
    res.redirect('/available-courses');
  }
});


// Sign-up page
app.get('/sign-up', (req, res) => {
  res.render('sign-up', { active: 'sign-up', user: req.user, messages: req.flash('error') });
});

app.post('/sign-up', async (req, res) => {
  const { full_name, email, password, role } = req.body;
  try {
    if (!['teacher', 'student'].includes(role)) {
      req.flash('error', 'Invalid role selected.');
      return res.redirect('/sign-up');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName: full_name,
      email,
      password: hashedPassword,
      role, // Make sure this is coming from the form
      courses: [],
    });
    await newUser.save();
    req.login(newUser, (err) => {
      if (err) {
        req.flash('error', 'There was an error logging you in.');
        return res.redirect('/login');
      }
      return res.redirect('/');
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error during sign-up. Please try again.');
    res.redirect('/sign-up');
  }
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { active: 'login', messages: req.flash('error') });
});

// Handle login
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
