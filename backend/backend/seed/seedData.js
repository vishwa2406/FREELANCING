require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Job = require('../models/Job');
const Progress = require('../models/Progress');
const MentorRequest = require('../models/MentorRequest');

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    Lesson.deleteMany(),
    Quiz.deleteMany(),
    Job.deleteMany(),
    Progress.deleteMany(),
    MentorRequest.deleteMany()
  ]);

  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@cegp.com',
    password: 'Admin123A',
    role: 'admin',
    skills: ['management', 'cms', 'analytics'],
    interests: ['education', 'platform growth'],
    goals: 'Manage the platform'
  });

  const mentors = await User.create([
  {
    name: 'Aarav Mehta',
    email: 'mentor1@cegp.com',
    password: 'Mentor123A',
    role: 'mentor',
    bio: 'Frontend mentor focused on HTML, CSS, JavaScript and React.',
    skills: ['html', 'css', 'javascript', 'react'],
    interests: ['frontend', 'career guidance'],
    goals: 'Help students become frontend developers'
  },
  {
    name: 'Priya Shah',
    email: 'mentor2@cegp.com',
    password: 'Mentor123A',
    role: 'mentor',
    bio: 'Backend mentor for Node.js, Express and MongoDB.',
    skills: ['node', 'express', 'mongodb', 'api'],
    interests: ['backend', 'system design'],
    goals: 'Guide students in backend development'
  },
  {
    name: 'Rohan Patel',
    email: 'mentor3@cegp.com',
    password: 'Mentor123A',
    role: 'mentor',
    bio: 'Java and DSA mentor for interview preparation.',
    skills: ['java', 'dsa', 'oops', 'sql'],
    interests: ['placements', 'problem solving'],
    goals: 'Prepare learners for job interviews'
  },
  {
    name: 'Nisha Verma',
    email: 'mentor4@cegp.com',
    password: 'Mentor123A',
    role: 'mentor',
    bio: 'Python mentor for beginners and automation projects.',
    skills: ['python', 'automation', 'flask'],
    interests: ['python', 'learning paths'],
    goals: 'Make Python easy for beginners'
  },
  {
    name: 'Kabir Joshi',
    email: 'mentor5@cegp.com',
    password: 'Mentor123A',
    role: 'mentor',
    bio: 'Full-stack mentor for MERN project guidance.',
    skills: ['react', 'node', 'mongodb', 'mern'],
    interests: ['full stack', 'project mentoring'],
    goals: 'Help students build strong portfolio projects'
  }
]);

  const user = await User.create({
    name: 'Student User',
    email: 'user@cegp.com',
    password: 'User1234A',
    role: 'user',
    skills: ['html', 'css', 'javascript'],
    interests: ['web development', 'frontend'],
    goals: 'Become a frontend developer'
  });

  const users = [admin, ...mentors, user];
  for (const u of users) {
    u.calcProfileCompletion();
    await u.save();
  }

  const courses = await Course.insertMany([
    {
      title: 'Complete Web Development Bootcamp',
      description: 'Master HTML, CSS, JavaScript, React, and Node.js from scratch.',
      instructor: 'Dr. Arjun Mehta',
      level: 'beginner',
      tags: ['javascript', 'html', 'css', 'react', 'node', 'web development'],
      category: 'Web Development',
      estimatedHours: 40,
      rating: 4.8,
      enrolledCount: 1240,
      status: 'published',
      isFeatured: true,
      outcomes: ['Build full-stack web apps', 'Understand REST APIs', 'Deploy to cloud'],
      createdBy: admin._id
    },
    {
      title: 'React.js Mastery',
      description: 'Advanced React hooks, Redux, optimization, and production apps.',
      instructor: 'Priya Sharma',
      level: 'intermediate',
      tags: ['react', 'javascript', 'frontend', 'redux', 'web development'],
      category: 'Frontend',
      estimatedHours: 25,
      rating: 4.9,
      enrolledCount: 890,
      status: 'published',
      isFeatured: true,
      outcomes: ['Advanced React patterns', 'State management', 'Performance optimization'],
      createdBy: admin._id
    },
    {
      title: 'Node.js & Express Backend',
      description: 'Build scalable APIs with Node, Express, MongoDB, and JWT.',
      instructor: 'Vikram Joshi',
      level: 'intermediate',
      tags: ['node', 'express', 'javascript', 'backend', 'mongodb'],
      category: 'Backend',
      estimatedHours: 28,
      rating: 4.7,
      enrolledCount: 560,
      status: 'published',
      isFeatured: false,
      outcomes: ['REST API design', 'Authentication', 'Database design'],
      createdBy: admin._id
    }
  ]);

  const lessons = await Lesson.insertMany([
    {
      course: courses[0]._id,
      title: 'Introduction to HTML',
      description: 'Learn HTML basics',
      videoUrl: 'https://www.youtube.com/embed/qz0aGYrrlhU',
      order: 1,
      duration: 45,
      isPreview: true
    },
    {
      course: courses[0]._id,
      title: 'CSS Styling & Flexbox',
      description: 'Learn CSS and layout',
      videoUrl: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
      order: 2,
      duration: 60
    },
    {
      course: courses[0]._id,
      title: 'JavaScript Fundamentals',
      description: 'Learn JS basics',
      videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
      order: 3,
      duration: 75
    }
  ]);

  await Quiz.create({
    course: courses[0]._id,
    lesson: lessons[2]._id,
    title: 'JavaScript Fundamentals Quiz',
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        question: 'Which keyword declares a block-scoped variable in JavaScript?',
        options: ['var', 'let', 'const', 'Both let and const'],
        correctAnswer: 3,
        explanation: 'Both let and const are block-scoped.'
      },
      {
        question: 'What does === check?',
        options: ['Value only', 'Type only', 'Value and type', 'Neither'],
        correctAnswer: 2,
        explanation: 'Strict equality checks both value and type.'
      }
    ]
  });

  await Job.insertMany([
    {
      title: 'Frontend Developer',
      company: 'TechCorp India',
      location: 'Bangalore',
      type: 'full-time',
      description: 'Build modern React applications.',
      requirements: ['React knowledge', 'REST API integration'],
      skills: ['react', 'javascript', 'css', 'frontend'],
      salary: '₹8–14 LPA',
      applyUrl: 'https://example.com/apply',
      postedBy: admin._id
    },
    {
      title: 'Node.js Backend Developer',
      company: 'CloudBase',
      location: 'Hyderabad',
      type: 'full-time',
      description: 'Build and maintain scalable REST APIs.',
      requirements: ['Node.js', 'Express', 'MongoDB'],
      skills: ['node', 'express', 'mongodb', 'backend', 'javascript'],
      salary: '₹9–16 LPA',
      applyUrl: 'https://example.com/apply',
      postedBy: admin._id
    }
  ]);

  console.log('✅ Seed data inserted successfully');
  console.log('Admin => admin@cegp.com / Admin123A');
  console.log('Mentor 1 => mentor1@cegp.com / Mentor123A');
  console.log('Mentor 2 => mentor2@cegp.com / Mentor123A');
  console.log('Mentor 3 => mentor3@cegp.com / Mentor123A');
  console.log('Mentor 4 => mentor4@cegp.com / Mentor123A');
  console.log('Mentor 5 => mentor5@cegp.com / Mentor123A');
  console.log('User => user@cegp.com / User1234A');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});