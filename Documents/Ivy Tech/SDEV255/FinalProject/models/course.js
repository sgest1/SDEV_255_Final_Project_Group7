const mongoose = require('mongoose');

// Define the Course Schema
const courseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: false,
  },
}, { timestamps: true });

// Create the Course Model
const Course = mongoose.model('Course', courseSchema);

// Export the Course Model
module.exports = Course;
