const mongoose = require('mongoose');
const Course = require('./models/course');  

const mongoDBURI = 'mongodb+srv://group7:group7@group7project.baaev.mongodb.net/?retryWrites=true&w=majority&appName=Group7Project';  // Your MongoDB URI

mongoose.connect(mongoDBURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    const courses = [
        { id: 'CS101', name: 'Introduction to Computer Science', description: 'Learn the fundamentals of computer science, including algorithms, data structures, and basic programming concepts.', instructor: 'Dr. Jane Brown', credits: 3 },
        { id: 'MATH101', name: 'College Algebra', description: 'A comprehensive course on algebraic concepts including linear equations, quadratic functions, and polynomial operations.', instructor: 'Prof. David Johnson', credits: 3 },
        { id: 'MKTG201', name: 'Principles of Marketing', description: 'Study the principles of marketing, consumer behavior, market research, and strategies for product promotion.', instructor: 'Dr. Emily Carter', credits: 3 },
        { id: 'PSY101', name: 'General Psychology', description: 'Explore the human mind and behavior through the study of perception, memory, development, and mental health.', instructor: 'Dr. Sarah Thompson', credits: 3 },
        { id: 'ENV201', name: 'Environmental Science', description: 'An introduction to environmental issues, including ecosystems, conservation, pollution, and climate change.', instructor: 'Prof. Michael Green', credits: 4 },
        { id: 'BIO101', name: 'Introduction to Biology', description: 'Learn about living organisms, ecosystems, and biological processes.', instructor: 'Dr. Lisa White', credits: 3 },
        { id: 'HIST101', name: 'World History', description: 'Explore world history, key events, and civilizations from ancient to modern times.', instructor: 'Dr. Robert Lee', credits: 3 },
        { id: 'ENG101', name: 'English Literature', description: 'Read and analyze literature from various periods, focusing on themes, styles, and authors.', instructor: 'Prof. Linda Davis', credits: 3 },
        { id: 'CHEM101', name: 'General Chemistry', description: 'Learn the fundamentals of chemistry, including atomic structure, chemical reactions, and periodic trends.', instructor: 'Dr. Emily Carter', credits: 4 },
        { id: 'PHIL101', name: 'Introduction to Philosophy', description: 'Study major philosophical concepts and thinkers from ancient to modern times.', instructor: 'Prof. Sarah Black', credits: 3 },
      ];

    // Insert each course, ensuring no duplicates based on 'id'
    for (const course of courses) {
      await Course.findOneAndUpdate(
        { id: course.id },  // Find the course by id
        course,  // Update the course data
        { upsert: true }  // If the course doesn't exist, insert it
      );
    }
    console.log('Courses added/updated successfully');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
