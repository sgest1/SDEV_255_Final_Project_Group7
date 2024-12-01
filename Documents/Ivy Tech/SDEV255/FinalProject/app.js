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
    { id: 'CS101', name: 'CS101', description: 'Offers a broad overview of computer science designed to provide students with an introduction to the field of computer science and an orientation to the Computer Science department and the computing environment at the university. Includes a project to introduce problem solving using computers. All computer science majors are required to take this course within their first year.', instructor: 'Prof. Brown' },
    { id: 'MATH101', name: 'MATH101', description: 'Introductory college algebra course, covering fundamental mathematical concepts like basic arithmetic operations, exponents, algebraic expressions, solving linear equations and inequalities, graphing linear functions, and often includes an emphasis on practical applications of these skills in real-world scenarios; essentially providing a foundation for further mathematics studies.', instructor: 'Prof. Johnson' },
    { id: 'ENG101', name: 'ENG101', description: 'Introductory college writing course that focuses on developing fundamental writing skills, including critical reading, the writing process (pre-writing, drafting, revising), and constructing well-organized essays with clear arguments, appropriate style, and proper grammar, preparing students for academic writing in other college courses.', instructor: 'Prof. Smith' },
    { id: 'SDEV255', name: 'SDEV255', description: 'Focuses on teaching students how to build interactive web applications by utilizing both client-side and server-side scripting languages, including application programming interfaces (APIs), to create dynamic data-driven web interfaces, often involving technologies like HTML, JavaScript, and a database to store information; it builds upon foundational web development knowledge to implement full-stack web applications.', instructor: 'Prof. Hamby' }
];

// Dummy data for available courses (this will be displayed on the homepage)
let availableCourses = [
    { id: 'CS101', name: 'CS101', description: 'Offers a broad overview of computer science designed to provide students with an introduction to the field of computer science and an orientation to the Computer Science department and the computing environment at the university. Includes a project to introduce problem solving using computers. All computer science majors are required to take this course within their first year.', instructor: 'Prof. Brown', credits: '' },
    { id: 'SDEV255', name: 'SDEV255', description: 'Focuses on teaching students how to build interactive web applications by utilizing both client-side and server-side scripting languages, including application programming interfaces (APIs), to create dynamic data-driven web interfaces, often involving technologies like HTML, JavaScript, and a database to store information; it builds upon foundational web development knowledge to implement full-stack web applications.', instructor: 'Prof. Hamby' },
    { id: 'MATH101', name: 'MATH101', description: 'Introductory college algebra course, covering fundamental mathematical concepts like basic arithmetic operations, exponents, algebraic expressions, solving linear equations and inequalities, graphing linear functions, and often includes an emphasis on practical applications of these skills in real-world scenarios; essentially providing a foundation for further mathematics studies.', instructor: 'Prof. Johnson' },
    { id: 'ENG101', name: 'ENG101', description: 'Introductory college writing course that focuses on developing fundamental writing skills, including critical reading, the writing process (pre-writing, drafting, revising), and constructing well-organized essays with clear arguments, appropriate style, and proper grammar, preparing students for academic writing in other college courses.', instructor: 'Prof. Smith' }
];

// Home page
app.get('/', (req, res) => {
    res.render('index', { active: 'home', availableCourses });
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
    if (course_id && course_name && description && instructor) {
        courses.push({ id: course_id, name: course_name, description, instructor });
        res.redirect('/view-courses');
    } else {
        res.status(400).send('All fields are required.');
    }
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
app.post('/courses/edit/:id', (req, res) => {
    const { courseName, courseDescription, courseInstructor, courseCredits } = req.body;
    const course = courses.find(c => c.id === req.params.id);
    
    if (course) {
        course.name = courseName;
        course.description = courseDescription;
        course.instructor = courseInstructor;
        course.credits = courseCredits; // Update credits here

        res.redirect('/view-courses'); // Redirect to the course list after updating
    } else {
        res.status(404).send('Course not found');
    }
});


// Handle deleting a course
app.post('/delete-course/:id', (req, res) => {
    const courseId = req.params.id;
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
        // Remove the course from the array
        courses.splice(courseIndex, 1);
        // Redirect to view courses page
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
