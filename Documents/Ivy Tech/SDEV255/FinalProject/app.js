const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.set('view engine', 'ejs'); 
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ extended: true })); 

// Dummy data for courses
let courses = [
    { id: 'CS101', name: 'CS101', description: 'Basics of computer science.', instructor: 'Prof. Brown' },
    { id: 'MATH201', name: 'MATH201', description: 'Learn about advanced calculus topics.', instructor: 'Prof. Johnson' },
    { id: 'ENG101', name: 'ENG101', description: 'Fundamentals of the English language.', instructor: 'Prof. Smith' },
    { id: 'SDEV255', name: 'SDEV255', description: 'Web application development.', instructor: 'Prof. Hamby' }
];


// Home page
app.get('/', (req, res) => {
    res.render('index', { active: 'home' });
});

// Sign-up page
app.get('/sign-up', (req, res) => {
    res.render('sign-up', { active: 'sign-up' });
});

// View courses page
app.get('/view-courses', (req, res) => {
    res.render('view-courses', { active: 'view-courses', courses });
});

// Add course page
app.get('/add-course', (req, res) => {
    res.render('add-course', { active: 'add-course' });
});

// Handle adding a new course
app.post('/add-course', (req, res) => {
    const { course_id, course_name, description, instructor } = req.body;
    courses.push({ id: course_id, name: course_name, description, instructor });
    res.redirect('/view-courses');
});

// Edit course page (pre-filling form)
app.get('/edit-course/:id', (req, res) => {
    const course = courses.find(c => c.id === req.params.id);
    if (course) {
        res.render('edit-course', { active: 'edit-course', course });
    } else {
        res.status(404).send('Course not found');
    }
});

// Handle editing a course
app.post('/edit-course', (req, res) => {
    const { course_id, course_name, description, instructor } = req.body;
    const course = courses.find(c => c.id === course_id);
    if (course) {
        course.name = course_name;
        course.description = description;
        course.instructor = instructor;
    }
    res.redirect('/view-courses');
});

// 404 page
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
