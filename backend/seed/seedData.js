require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Job = require('../models/Job');
const Progress = require('../models/Progress');
const MentorRequest = require('../models/MentorRequest');

const ytEmbed = (id) => `https://www.youtube.com/embed/${id}`;
const ytThumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

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
      name: 'Mansi Mehta',
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
      name: 'Isha Patel',
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
      name: 'Mittal Joshi',
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

  const courseDefs = [
    {
      title: 'Complete Web Development Bootcamp',
      description:
        'A complete beginner-friendly web development course inspired by Apna College. Covers HTML, CSS, JavaScript, responsive layouts, Git and practical frontend foundations.',
      thumbnail: ytThumb('HcOc7P5BMi4'),
      instructor: 'Apna College',
      videoUrl: ytEmbed('l1EssrLxt7E'),
      level: 'beginner',
      tags: ['html', 'css', 'javascript', 'git', 'github', 'web development', 'frontend'],
      category: 'web',
      estimatedHours: 42,
      enrolledCount: 1240,
      status: 'published',
      isFeatured: true,
      prerequisites: ['Basic computer usage', 'A laptop with internet connection'],
      outcomes: [
        'Build static and responsive websites',
        'Understand HTML, CSS and JavaScript basics',
        'Use Git and GitHub for version control',
        'Prepare for React and full-stack learning'
      ],
      createdBy: admin._id
    },
    {
      title: 'React.js Mastery',
      description:
        'A practical React course based on CodeWithHarry style learning. Covers JSX, components, props, state, hooks and mini-project style implementation.',
      thumbnail: ytThumb('-mJFZp84TIY'),
      instructor: 'CodeWithHarry',
      videoUrl: ytEmbed('-mJFZp84TIY'),
      level: 'intermediate',
      tags: ['react', 'jsx', 'hooks', 'frontend', 'javascript', 'spa'],
      category: 'web',
      estimatedHours: 26,
      enrolledCount: 890,
      status: 'published',
      isFeatured: true,
      prerequisites: ['HTML basics', 'CSS basics', 'JavaScript fundamentals'],
      outcomes: [
        'Build React components',
        'Manage state with hooks',
        'Pass and validate props',
        'Create reusable UI structure'
      ],
      createdBy: admin._id
    },
    {
      title: 'Node.js & Express Backend',
      description:
        'Backend development course based on CodeWithHarry backend tutorials. Covers Node.js fundamentals, Express.js, npm, routing and API-oriented backend structure.',
      thumbnail: ytThumb('BLl32FvcdVM'),
      instructor: 'CodeWithHarry',
      videoUrl: ytEmbed('BLl32FvcdVM'),
      level: 'intermediate',
      tags: ['node', 'express', 'backend', 'api', 'javascript', 'npm'],
      category: 'web',
      estimatedHours: 28,
      enrolledCount: 560,
      status: 'published',
      isFeatured: false,
      prerequisites: ['JavaScript fundamentals', 'Basic command line knowledge'],
      outcomes: [
        'Understand backend architecture',
        'Build Express applications',
        'Create REST-style routes',
        'Work with middleware and npm packages'
      ],
      createdBy: admin._id
    },
    {
      title: 'Python for Beginners & Automation',
      description:
        'A beginner Python course based on CodeWithHarry. Covers syntax, variables, control flow, functions, modules and practical automation-oriented learning.',
      thumbnail: ytThumb('UrsmFxEIp5k'),
      instructor: 'CodeWithHarry',
      videoUrl: ytEmbed('UrsmFxEIp5k'),
      level: 'beginner',
      tags: ['python', 'automation', 'programming', 'beginners', 'scripting'],
      category: 'web',
      estimatedHours: 24,
      enrolledCount: 1120,
      status: 'published',
      isFeatured: true,
      prerequisites: ['Basic computer usage'],
      outcomes: [
        'Write Python programs confidently',
        'Understand functions and modules',
        'Handle files and exceptions',
        'Start simple automation scripts'
      ],
      createdBy: admin._id
    },
    {
      title: 'Java DSA & Interview Preparation',
      description:
        'Data structures and algorithms course inspired by Apna College Java placement series. Covers arrays, linked lists, recursion, sorting and trees for placements.',
      thumbnail: ytThumb('NTHVTY6w2Co'),
      instructor: 'Apna College',
      videoUrl: ytEmbed('NTHVTY6w2Co'),
      level: 'intermediate',
      tags: ['java', 'dsa', 'arrays', 'linked list', 'sorting', 'trees', 'placements'],
      category: 'web',
      estimatedHours: 36,
      enrolledCount: 980,
      status: 'published',
      isFeatured: true,
      prerequisites: ['Core Java basics', 'Loops and functions', 'Basic OOP understanding'],
      outcomes: [
        'Solve interview-focused DSA problems',
        'Implement common data structures in Java',
        'Analyze algorithm complexity',
        'Prepare for placement rounds'
      ],
      createdBy: admin._id
    },
    {
      title: 'DBMS Complete Course',
      description:
        'A strong DBMS course inspired by Gate Smashers. Covers database concepts, keys, normalization, SQL and transaction basics for exams and interviews.',
      thumbnail: ytThumb('kBdlM6hNDAE'),
      instructor: 'Gate Smashers',
      videoUrl: ytEmbed('kBdlM6hNDAE'),
      level: 'intermediate',
      tags: ['dbms', 'sql', 'normalization', 'transactions', 'database', 'gate'],
      category: 'web',
      estimatedHours: 30,
      enrolledCount: 760,
      status: 'published',
      isFeatured: true,
      prerequisites: ['Basic programming knowledge'],
      outcomes: [
        'Understand DBMS architecture',
        'Learn keys and normalization',
        'Revise SQL basics',
        'Prepare for exams and technical interviews'
      ],
      createdBy: admin._id
    },
    {
      title: 'Operating Systems Fundamentals',
      description:
        'Operating systems course based on Gate Smashers. Covers OS basics, process management, synchronization and memory management in simple form.',
      thumbnail: ytThumb('WJ-UaAaumNA'),
      instructor: 'Gate Smashers',
      videoUrl: ytEmbed('WJ-UaAaumNA'),
      level: 'intermediate',
      tags: ['operating systems', 'os', 'deadlock', 'memory management', 'processes'],
      category: 'mobile',
      estimatedHours: 27,
      enrolledCount: 640,
      status: 'published',
      isFeatured: false,
      prerequisites: ['Basic computer fundamentals'],
      outcomes: [
        'Understand process and scheduling basics',
        'Learn synchronization and deadlocks',
        'Revise memory management',
        'Strengthen exam and interview preparation'
      ],
      createdBy: admin._id
    },
    {
      title: 'Computer Networks Fundamentals',
      description:
        'Computer networks course based on Gate Smashers. Covers OSI model, TCP/IP, transport layer, data link layer and application layer protocols.',
      thumbnail: ytThumb('4D55Cmj2t-A'),
      instructor: 'Gate Smashers',
      videoUrl: ytEmbed('4D55Cmj2t-A'),
      level: 'intermediate',
      tags: ['computer networks', 'osi model', 'tcp', 'udp', 'http', 'networking'],
      category: 'data',
      estimatedHours: 29,
      enrolledCount: 690,
      status: 'published',
      isFeatured: false,
      prerequisites: ['Basic computer fundamentals'],
      outcomes: [
        'Understand network layers and protocols',
        'Learn TCP/IP and OSI model clearly',
        'Revise transport and application layer concepts',
        'Prepare for exams and interviews'
      ],
      createdBy: admin._id
    },

    // MOBILE CATEGORY
    {
      title: 'Android Development with Java',
      description:
        'A beginner-friendly Android development course inspired by Apna College and CodeWithHarry style teaching. Covers Android Studio, activities, layouts, intents and UI building.',
      thumbnail: ytThumb('mXjZQX3UzOs'),
      instructor: 'Apna College',
      videoUrl: ytEmbed('mXjZQX3UzOs'),
      level: 'beginner',
      tags: ['android', 'java', 'mobile', 'android studio', 'xml', 'app development'],
      category: 'mobile',
      estimatedHours: 32,
      enrolledCount: 720,
      status: 'published',
      isFeatured: true,
      prerequisites: ['Basic Java knowledge', 'Basic XML understanding'],
      outcomes: [
        'Build Android UI screens',
        'Understand activities and intents',
        'Work with Android Studio',
        'Create beginner Android apps'
      ],
      createdBy: admin._id
    },
    {
      title: 'Flutter App Development Basics',
      description:
        'A mobile development starter course covering Flutter basics, widgets, Dart fundamentals, layouts and simple app building.',
      thumbnail: ytThumb('VPvVD8t02U8'),
      instructor: 'CodeWithHarry',
      videoUrl: ytEmbed('VPvVD8t02U8'),
      level: 'beginner',
      tags: ['flutter', 'dart', 'mobile', 'widgets', 'ui', 'app development'],
      category: 'mobile',
      estimatedHours: 30,
      enrolledCount: 680,
      status: 'published',
      isFeatured: true,
      prerequisites: ['Basic programming knowledge'],
      outcomes: [
        'Understand Flutter widgets',
        'Build simple mobile app screens',
        'Learn Dart basics',
        'Create cross-platform apps'
      ],
      createdBy: admin._id
    },

    // DESIGN CATEGORY
    {
      title: 'UI UX Design Fundamentals',
      description:
        'A design fundamentals course for beginners. Covers design principles, layout hierarchy, typography, color theory and user-centered design basics.',
      thumbnail: ytThumb('c9Wg6Cb_YlU'),
      instructor: 'CodeWithHarry',
      videoUrl: ytEmbed('c9Wg6Cb_YlU'),
      level: 'beginner',
      tags: ['ui', 'ux', 'design', 'typography', 'color theory', 'wireframe'],
      category: 'design',
      estimatedHours: 20,
      enrolledCount: 540,
      status: 'published',
      isFeatured: true,
      prerequisites: ['No prior experience required'],
      outcomes: [
        'Understand UI and UX basics',
        'Apply typography and color theory',
        'Create better screen layouts',
        'Design beginner-friendly interfaces'
      ],
      createdBy: admin._id
    },
    {
      title: 'Figma for App and Web Design',
      description:
        'A practical Figma course for creating wireframes, components, screens and interface prototypes for web and mobile design.',
      thumbnail: ytThumb('FTFaQWZBqQ8'),
      instructor: 'CodeWithHarry',
      videoUrl: ytEmbed('FTFaQWZBqQ8'),
      level: 'beginner',
      tags: ['figma', 'ui design', 'prototype', 'wireframe', 'mobile design', 'web design'],
      category: 'design',
      estimatedHours: 18,
      enrolledCount: 610,
      status: 'published',
      isFeatured: false,
      prerequisites: ['Basic design interest'],
      outcomes: [
        'Create wireframes in Figma',
        'Build reusable design components',
        'Design screens and prototypes',
        'Understand interface design workflow'
      ],
      createdBy: admin._id
    }
  ];

  const courses = await Course.insertMany(courseDefs);

  const courseMap = {};
  courses.forEach((course) => {
    courseMap[course.title] = course;
  });

  const lessonDefs = [
    {
      courseTitle: 'Complete Web Development Bootcamp',
      title: 'HTML Fundamentals',
      description: 'Learn HTML tags, structure, forms, media and semantic elements.',
      videoUrl: ytEmbed('HcOc7P5BMi4'),
      order: 1,
      duration: 90,
      isPreview: true
    },
    {
      courseTitle: 'Complete Web Development Bootcamp',
      title: 'CSS Fundamentals',
      description: 'Learn selectors, box model, flexbox, styling and responsive basics.',
      videoUrl: ytEmbed('ESnrn1kAD4E'),
      order: 2,
      duration: 95
    },
    {
      courseTitle: 'Complete Web Development Bootcamp',
      title: 'JavaScript Basics',
      description: 'Learn JavaScript introduction, variables, DOM and programming basics.',
      videoUrl: ytEmbed('B7wHpNUUT4Y'),
      order: 3,
      duration: 80
    },
    {
      courseTitle: 'Complete Web Development Bootcamp',
      title: 'Git & GitHub for Beginners',
      description: 'Learn repositories, commits, push, pull and collaboration basics.',
      videoUrl: ytEmbed('Ez8F0nW6S-w'),
      order: 4,
      duration: 55
    },

    {
      courseTitle: 'React.js Mastery',
      title: 'Introduction to React & Installation',
      description: 'Understand what React is and how to set up the environment.',
      videoUrl: ytEmbed('-mJFZp84TIY'),
      order: 1,
      duration: 21,
      isPreview: true
    },
    {
      courseTitle: 'React.js Mastery',
      title: 'JavaScript Refresher for React',
      description: 'Refresh modern JavaScript concepts required before learning React deeply.',
      videoUrl: ytEmbed('kFe-RRaOy48'),
      order: 2,
      duration: 19
    },
    {
      courseTitle: 'React.js Mastery',
      title: 'Understanding State & Events',
      description: 'Learn how state works and how React handles events.',
      videoUrl: ytEmbed('leBpCqU8wdg'),
      order: 3,
      duration: 10
    },
    {
      courseTitle: 'React.js Mastery',
      title: 'Using useState Hook',
      description: 'Build functional components with useState and dynamic behavior.',
      videoUrl: ytEmbed('Sx2y4TjRZ9g'),
      order: 4,
      duration: 7
    },

    {
      courseTitle: 'Node.js & Express Backend',
      title: 'Node.js Crash Course',
      description: 'Understand Node.js runtime, modules and backend fundamentals.',
      videoUrl: ytEmbed('BLl32FvcdVM'),
      order: 1,
      duration: 91,
      isPreview: true
    },
    {
      courseTitle: 'Node.js & Express Backend',
      title: 'Express.js Crash Course',
      description: 'Learn routing, middleware and request-response flow using Express.',
      videoUrl: ytEmbed('7H_QH9nipNs'),
      order: 2,
      duration: 72
    },
    {
      courseTitle: 'Node.js & Express Backend',
      title: 'Introduction to Express.js',
      description: 'Build a simple server and understand Express application structure.',
      videoUrl: ytEmbed('R11tvGM3nDY'),
      order: 3,
      duration: 18
    },
    {
      courseTitle: 'Node.js & Express Backend',
      title: 'Backend, Node.js & npm Basics',
      description: 'Use npm, packages and backend tools properly in real projects.',
      videoUrl: ytEmbed('NoWRBo3Uf8E'),
      order: 4,
      duration: 23
    },

    {
      courseTitle: 'Python for Beginners & Automation',
      title: 'Complete Python Course Overview',
      description: 'Start Python from basics and understand the overall roadmap.',
      videoUrl: ytEmbed('UrsmFxEIp5k'),
      order: 1,
      duration: 180,
      isPreview: true
    },
    {
      courseTitle: 'Python for Beginners & Automation',
      title: 'Introduction to Programming & Python',
      description: 'Begin with syntax, setup and foundational Python concepts.',
      videoUrl: ytEmbed('7wnove7K-ZQ'),
      order: 2,
      duration: 18
    },
    {
      courseTitle: 'Python for Beginners & Automation',
      title: 'Some Amazing Python Programs',
      description: 'See Python basics applied through practical beginner examples.',
      videoUrl: ytEmbed('Tto8TS-fJQU'),
      order: 3,
      duration: 18
    },
    {
      courseTitle: 'Python for Beginners & Automation',
      title: 'Why Learn Python?',
      description: 'Understand the value of Python and where it is commonly used.',
      videoUrl: ytEmbed('vrQlEhmVFDA'),
      order: 4,
      duration: 14
    },

    {
      courseTitle: 'Java DSA & Interview Preparation',
      title: 'Arrays Introduction in Java',
      description: 'Learn array basics, indexing and common interview usage.',
      videoUrl: ytEmbed('NTHVTY6w2Co'),
      order: 1,
      duration: 20,
      isPreview: true
    },
    {
      courseTitle: 'Java DSA & Interview Preparation',
      title: 'Introduction to Linked List',
      description: 'Understand linked list structure, nodes and traversal.',
      videoUrl: ytEmbed('oAja8-Ulz6o'),
      order: 2,
      duration: 25
    },
    {
      courseTitle: 'Java DSA & Interview Preparation',
      title: 'Sorting in Java',
      description: 'Learn bubble sort, selection sort and insertion sort with logic.',
      videoUrl: ytEmbed('PkJIc5tBRUE'),
      order: 3,
      duration: 46
    },
    {
      courseTitle: 'Java DSA & Interview Preparation',
      title: 'Binary Search Trees',
      description: 'Understand BST construction, traversal and interview usage.',
      videoUrl: ytEmbed('qAeitQWjNNg'),
      order: 4,
      duration: 39
    },

    {
      courseTitle: 'DBMS Complete Course',
      title: 'DBMS Syllabus & Introduction',
      description: 'Start DBMS with a complete introduction and structured syllabus.',
      videoUrl: ytEmbed('kBdlM6hNDAE'),
      order: 1,
      duration: 13,
      isPreview: true
    },
    {
      courseTitle: 'DBMS Complete Course',
      title: 'Introduction to DBMS',
      description: 'Understand what DBMS is and why it is used.',
      videoUrl: ytEmbed('3EJlovevfcA'),
      order: 2,
      duration: 14
    },
    {
      courseTitle: 'DBMS Complete Course',
      title: 'Normalization in DBMS',
      description: 'Learn anomalies and why normalization is required.',
      videoUrl: ytEmbed('5GDTIUVlHB8'),
      order: 3,
      duration: 11
    },
    {
      courseTitle: 'DBMS Complete Course',
      title: 'Second Normal Form',
      description: 'Understand 2NF with examples and DBMS design improvement.',
      videoUrl: ytEmbed('tkbAA--wKOc'),
      order: 4,
      duration: 9
    },

    {
      courseTitle: 'Operating Systems Fundamentals',
      title: 'Introduction to Operating System',
      description: 'Learn what an OS is and its basic functions.',
      videoUrl: ytEmbed('WJ-UaAaumNA'),
      order: 1,
      duration: 13,
      isPreview: true
    },
    {
      courseTitle: 'Operating Systems Fundamentals',
      title: 'Types of Operating Systems',
      description: 'Understand batch, multiprogramming and other OS types.',
      videoUrl: ytEmbed('povNcHSasgs'),
      order: 2,
      duration: 8
    },
    {
      courseTitle: 'Operating Systems Fundamentals',
      title: 'Process Synchronization',
      description: 'Study synchronization, race condition and process coordination.',
      videoUrl: ytEmbed('3Eaw1SSIqRg'),
      order: 3,
      duration: 15
    },
    {
      courseTitle: 'Operating Systems Fundamentals',
      title: 'Memory Management',
      description: 'Understand memory management basics and related concepts.',
      videoUrl: ytEmbed('eESIFJz7mJw'),
      order: 4,
      duration: 14
    },

    {
      courseTitle: 'Computer Networks Fundamentals',
      title: 'Introduction to Computer Networks',
      description: 'Start with the basics of networks and OSI model.',
      videoUrl: ytEmbed('4D55Cmj2t-A'),
      order: 1,
      duration: 11,
      isPreview: true
    },
    {
      courseTitle: 'Computer Networks Fundamentals',
      title: 'Data Link Layer',
      description: 'Understand responsibilities of the data link layer.',
      videoUrl: ytEmbed('JRgmPco0KWI'),
      order: 2,
      duration: 19
    },
    {
      courseTitle: 'Computer Networks Fundamentals',
      title: 'Transport Layer',
      description: 'Learn transport layer responsibilities, TCP and UDP context.',
      videoUrl: ytEmbed('kAty4mKczEg'),
      order: 3,
      duration: 15
    },
    {
      courseTitle: 'Computer Networks Fundamentals',
      title: 'Application Layer Protocols',
      description: 'Study HTTP, FTP, SMTP, POP and other application layer concepts.',
      videoUrl: ytEmbed('8An0dRalJeM'),
      order: 4,
      duration: 14
    },

    // MOBILE
    {
      courseTitle: 'Android Development with Java',
      title: 'Android Studio Setup',
      description: 'Set up Android Studio and understand the Android project structure.',
      videoUrl: ytEmbed('mXjZQX3UzOs'),
      order: 1,
      duration: 25,
      isPreview: true
    },
    {
      courseTitle: 'Android Development with Java',
      title: 'Activities and Layout Basics',
      description: 'Learn about activities, XML layouts and UI arrangement.',
      videoUrl: ytEmbed('fis26HvvDII'),
      order: 2,
      duration: 35
    },
    {
      courseTitle: 'Android Development with Java',
      title: 'Intents and Navigation',
      description: 'Understand explicit and implicit intents in Android.',
      videoUrl: ytEmbed('u0IT4Q4BuGg'),
      order: 3,
      duration: 28
    },
    {
      courseTitle: 'Android Development with Java',
      title: 'Building a Simple Android App',
      description: 'Create a small app using layouts, buttons and screen transitions.',
      videoUrl: ytEmbed('BBWyXo-3JGQ'),
      order: 4,
      duration: 40
    },

    {
      courseTitle: 'Flutter App Development Basics',
      title: 'Flutter and Dart Introduction',
      description: 'Understand Flutter basics and Dart setup for app development.',
      videoUrl: ytEmbed('VPvVD8t02U8'),
      order: 1,
      duration: 30,
      isPreview: true
    },
    {
      courseTitle: 'Flutter App Development Basics',
      title: 'Widgets and Layouts',
      description: 'Learn stateless widgets, stateful widgets and common layouts.',
      videoUrl: ytEmbed('1xipg02Wu8s'),
      order: 2,
      duration: 34
    },
    {
      courseTitle: 'Flutter App Development Basics',
      title: 'Navigation and Routing',
      description: 'Move between screens and manage app navigation in Flutter.',
      videoUrl: ytEmbed('CdYJ6Xg7n4M'),
      order: 3,
      duration: 26
    },
    {
      courseTitle: 'Flutter App Development Basics',
      title: 'Mini Flutter App Project',
      description: 'Build a simple mobile interface with widgets and basic logic.',
      videoUrl: ytEmbed('j-LOab_PzzU'),
      order: 4,
      duration: 42
    },

    // DESIGN
    {
      courseTitle: 'UI UX Design Fundamentals',
      title: 'Introduction to UI and UX',
      description: 'Understand the difference between UI and UX and why both matter.',
      videoUrl: ytEmbed('c9Wg6Cb_YlU'),
      order: 1,
      duration: 18,
      isPreview: true
    },
    {
      courseTitle: 'UI UX Design Fundamentals',
      title: 'Design Principles and Visual Hierarchy',
      description: 'Learn hierarchy, spacing, alignment and contrast.',
      videoUrl: ytEmbed('QKjJ9iHKeQA'),
      order: 2,
      duration: 24
    },
    {
      courseTitle: 'UI UX Design Fundamentals',
      title: 'Typography and Color Theory',
      description: 'Use fonts and colors effectively in digital products.',
      videoUrl: ytEmbed('wIuVvCuiJhU'),
      order: 3,
      duration: 21
    },
    {
      courseTitle: 'UI UX Design Fundamentals',
      title: 'Wireframing and User Flow',
      description: 'Create wireframes and think through user journeys.',
      videoUrl: ytEmbed('qpH7-KFWZRI'),
      order: 4,
      duration: 27
    },

    {
      courseTitle: 'Figma for App and Web Design',
      title: 'Figma Interface Overview',
      description: 'Learn the Figma workspace, tools and essential controls.',
      videoUrl: ytEmbed('FTFaQWZBqQ8'),
      order: 1,
      duration: 16,
      isPreview: true
    },
    {
      courseTitle: 'Figma for App and Web Design',
      title: 'Frames, Shapes and Auto Layout',
      description: 'Design responsive screens using frames and auto layout.',
      videoUrl: ytEmbed('4W4LvJnNegA'),
      order: 2,
      duration: 22
    },
    {
      courseTitle: 'Figma for App and Web Design',
      title: 'Components and Reusable Design System',
      description: 'Build reusable buttons, cards and shared components.',
      videoUrl: ytEmbed('kbZejnPXyLM'),
      order: 3,
      duration: 20
    },
    {
      courseTitle: 'Figma for App and Web Design',
      title: 'Prototype a Mobile App Screen',
      description: 'Connect screens and create an interactive prototype.',
      videoUrl: ytEmbed('xW0m1S0Ft8Q'),
      order: 4,
      duration: 24
    }
  ];

  const lessons = await Lesson.insertMany(
    lessonDefs.map((lesson) => ({
      course: courseMap[lesson.courseTitle]._id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
      isPreview: lesson.isPreview || false
    }))
  );

  const quizDefs = [
    {
      courseTitle: 'Complete Web Development Bootcamp',
      lessonTitle: 'Git & GitHub for Beginners',
      title: 'Web Development Basics Quiz',
      passingScore: 70,
      maxAttempts: 3,
      questions: [
        { question: 'Which tag is used to create the largest heading in HTML?', options: ['<h6>', '<head>', '<h1>', '<header>'], correctAnswer: 2, explanation: '<h1> is the largest heading tag.' },
        { question: 'Which CSS property controls text color?', options: ['font-style', 'background', 'color', 'text-transform'], correctAnswer: 2, explanation: 'color sets text color.' },
        { question: 'Which JavaScript keyword is used to declare a variable?', options: ['int', 'let', 'define', 'float'], correctAnswer: 1, explanation: 'let declares a variable.' },
        { question: 'Which HTML tag is used for links?', options: ['<a>', '<p>', '<img>', '<div>'], correctAnswer: 0, explanation: '<a> creates hyperlinks.' },
        { question: 'Which CSS layout model aligns items in one direction?', options: ['Grid', 'Flexbox', 'Table', 'Float'], correctAnswer: 1, explanation: 'Flexbox is one-dimensional layout.' },
        { question: 'DOM stands for?', options: ['Data Object Model', 'Document Object Model', 'Display Object Model', 'Document Order Model'], correctAnswer: 1, explanation: 'DOM means Document Object Model.' },
        { question: 'Which Git command sends code to remote repo?', options: ['git clone', 'git push', 'git init', 'git log'], correctAnswer: 1, explanation: 'git push uploads commits.' },
        { question: 'Which symbol is used for CSS id selector?', options: ['.', '#', '*', '&'], correctAnswer: 1, explanation: '# is for id selector.' },
        { question: 'Which method prints in browser console?', options: ['print()', 'echo()', 'console.log()', 'write()'], correctAnswer: 2, explanation: 'console.log() prints to console.' },
        { question: 'GitHub is mainly used for?', options: ['Database hosting', 'Version control collaboration', 'Compiling CSS', 'Designing UI'], correctAnswer: 1, explanation: 'GitHub supports collaboration and code hosting.' }
      ]
    },
    {
      courseTitle: 'React.js Mastery',
      lessonTitle: 'Using useState Hook',
      title: 'React Fundamentals Quiz',
      passingScore: 75,
      maxAttempts: 3,
      questions: [
        { question: 'React is mainly used for building?', options: ['Databases', 'User interfaces', 'Operating systems', 'Compilers'], correctAnswer: 1, explanation: 'React builds UIs.' },
        { question: 'JSX stands for?', options: ['Java Syntax XML', 'JavaScript XML', 'JSON XML', 'Joined Syntax Extension'], correctAnswer: 1, explanation: 'JSX means JavaScript XML.' },
        { question: 'Which hook manages local state?', options: ['useEffect', 'useMemo', 'useState', 'useRef'], correctAnswer: 2, explanation: 'useState manages state.' },
        { question: 'Props are used to?', options: ['Mutate DOM', 'Pass data to components', 'Connect DB', 'Create CSS'], correctAnswer: 1, explanation: 'Props pass data.' },
        { question: 'A React component should return?', options: ['Only number', 'Only array', 'JSX/element/null', 'Only boolean'], correctAnswer: 2, explanation: 'A component returns valid JSX or null.' },
        { question: 'State in React is used to?', options: ['Install packages', 'Store changing data', 'Create routes', 'Delete components'], correctAnswer: 1, explanation: 'State stores dynamic data.' },
        { question: 'JavaScript in JSX is written inside?', options: ['[]', '()', '{}', '<>'], correctAnswer: 2, explanation: 'Curly braces are used.' },
        { question: 'Why are keys important in list rendering?', options: ['Improve CSS', 'Help React identify items', 'Create hooks', 'Replace props'], correctAnswer: 1, explanation: 'Keys identify list items.' },
        { question: 'useState returns?', options: ['One object', 'String', 'State and setter', 'Promise'], correctAnswer: 2, explanation: 'useState returns state and setter.' },
        { question: 'React apps are built from?', options: ['Tables', 'Components', 'Schemas', 'Drivers'], correctAnswer: 1, explanation: 'React is component-based.' }
      ]
    },
    {
      courseTitle: 'Node.js & Express Backend',
      lessonTitle: 'Backend, Node.js & npm Basics',
      title: 'Backend Development Quiz',
      passingScore: 75,
      maxAttempts: 3,
      questions: [
        { question: 'Node.js is used for?', options: ['Running Java', 'Running JavaScript on server', 'Styling HTML', 'Managing BIOS'], correctAnswer: 1, explanation: 'Node runs JS on the server.' },
        { question: 'Express.js is a?', options: ['Database', 'Node.js framework', 'CSS library', 'Browser plugin'], correctAnswer: 1, explanation: 'Express is a web framework.' },
        { question: 'npm is used to?', options: ['Draw UI', 'Manage packages', 'Store SQL tables', 'Compile Java'], correctAnswer: 1, explanation: 'npm manages packages.' },
        { question: 'GET route in Express uses?', options: ['app.get()', 'app.push()', 'app.render()', 'app.file()'], correctAnswer: 0, explanation: 'app.get() handles GET route.' },
        { question: 'Middleware is used to?', options: ['Handle request flow', 'Create CSS', 'Encrypt images', 'Render PDF'], correctAnswer: 0, explanation: 'Middleware handles req-res cycle.' },
        { question: 'Which object contains request data?', options: ['res', 'req', 'app', 'module'], correctAnswer: 1, explanation: 'req contains request data.' },
        { question: 'Which object sends response?', options: ['req', 'router', 'res', 'npm'], correctAnswer: 2, explanation: 'res sends response.' },
        { question: 'JSON stands for?', options: ['Java Source Object Notation', 'JavaScript Object Notation', 'Joined Syntax Object Network', 'Java Object Notation'], correctAnswer: 1, explanation: 'JSON means JavaScript Object Notation.' },
        { question: 'REST APIs commonly exchange data in?', options: ['Binary', 'JSON', 'PDF', 'CSS'], correctAnswer: 1, explanation: 'JSON is common for REST APIs.' },
        { question: 'Project dependencies are stored in?', options: ['server.js', 'package.json', 'index.html', 'style.css'], correctAnswer: 1, explanation: 'package.json stores dependencies.' }
      ]
    },
    {
      courseTitle: 'Python for Beginners & Automation',
      lessonTitle: 'Why Learn Python?',
      title: 'Python Basics Quiz',
      passingScore: 70,
      maxAttempts: 3,
      questions: [
        { question: 'Which symbol starts a comment in Python?', options: ['//', '#', '/*', '--'], correctAnswer: 1, explanation: '# starts a comment.' },
        { question: 'Which keyword defines a function?', options: ['func', 'define', 'def', 'function'], correctAnswer: 2, explanation: 'def defines a function.' },
        { question: 'Which data type is mutable and ordered?', options: ['tuple', 'set', 'list', 'int'], correctAnswer: 2, explanation: 'Lists are ordered and mutable.' },
        { question: 'input() returns?', options: ['int', 'bool', 'str', 'float'], correctAnswer: 2, explanation: 'input() returns a string.' },
        { question: 'Exception handling uses?', options: ['if else', 'switch', 'try except', 'case'], correctAnswer: 2, explanation: 'try-except handles exceptions.' },
        { question: 'Which function prints output?', options: ['echo()', 'display()', 'console()', 'print()'], correctAnswer: 3, explanation: 'print() outputs text.' },
        { question: 'Exponent operator in Python?', options: ['^', '**', '//', '%%'], correctAnswer: 1, explanation: '** means power.' },
        { question: 'Which collection is immutable?', options: ['list', 'dictionary', 'tuple', 'set'], correctAnswer: 2, explanation: 'Tuple is immutable.' },
        { question: 'Which loop is easiest for sequence traversal?', options: ['for', 'switch', 'goto', 'case'], correctAnswer: 0, explanation: 'for is used for iteration.' },
        { question: 'Modules are useful because?', options: ['Reduce storage', 'Organize and reuse code', 'Replace variables', 'Stop exceptions'], correctAnswer: 1, explanation: 'Modules improve reuse.' }
      ]
    },
    {
      courseTitle: 'Java DSA & Interview Preparation',
      lessonTitle: 'Binary Search Trees',
      title: 'Java DSA Quiz',
      passingScore: 75,
      maxAttempts: 3,
      questions: [
        { question: 'Binary search time complexity?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 1, explanation: 'Binary search is O(log n).' },
        { question: 'LIFO order is followed by?', options: ['Queue', 'Stack', 'Tree', 'Graph'], correctAnswer: 1, explanation: 'Stack follows LIFO.' },
        { question: 'FIFO order is followed by?', options: ['Stack', 'Queue', 'Tree', 'Heap'], correctAnswer: 1, explanation: 'Queue follows FIFO.' },
        { question: 'Linked list node contains?', options: ['Only data', 'Only pointer', 'Data and reference', 'Only array'], correctAnswer: 2, explanation: 'Node has data and next reference.' },
        { question: 'Which sort compares adjacent elements?', options: ['Merge', 'Bubble', 'Heap', 'Quick'], correctAnswer: 1, explanation: 'Bubble sort compares adjacent values.' },
        { question: 'In BST left child is usually?', options: ['Greater', 'Equal', 'Less', 'Random'], correctAnswer: 2, explanation: 'Left child is smaller.' },
        { question: 'Recursion must have?', options: ['Package', 'Base case', 'Queue', 'HashMap'], correctAnswer: 1, explanation: 'Base case stops recursion.' },
        { question: 'Traversal visiting root first?', options: ['Inorder', 'Preorder', 'Postorder', 'Reverse'], correctAnswer: 1, explanation: 'Preorder visits root first.' },
        { question: 'Arrays allow faster index access because?', options: ['Always sorted', 'Contiguous memory', 'Hash based', 'Recursive'], correctAnswer: 1, explanation: 'Contiguous memory helps indexing.' },
        { question: 'Algorithm efficiency is measured by?', options: ['UI design', 'Big-O notation', 'Bootstrap', 'API schema'], correctAnswer: 1, explanation: 'Big-O measures performance.' }
      ]
    },
    {
      courseTitle: 'DBMS Complete Course',
      lessonTitle: 'Second Normal Form',
      title: 'DBMS Quiz',
      passingScore: 75,
      maxAttempts: 3,
      questions: [
        { question: 'DBMS stands for?', options: ['Data Backup Management System', 'Database Management System', 'Digital Base Model System', 'Data Binary Mapping Structure'], correctAnswer: 1, explanation: 'DBMS means Database Management System.' },
        { question: 'Which key uniquely identifies a row?', options: ['Foreign key', 'Primary key', 'Composite key', 'Candidate key'], correctAnswer: 1, explanation: 'Primary key uniquely identifies a row.' },
        { question: 'Normalization is used to?', options: ['Increase redundancy', 'Reduce redundancy', 'Delete all keys', 'Convert SQL to HTML'], correctAnswer: 1, explanation: 'Normalization reduces redundancy.' },
        { question: 'Foreign key is used to?', options: ['Color rows', 'Link related tables', 'Sort data', 'Delete schema'], correctAnswer: 1, explanation: 'Foreign key links tables.' },
        { question: 'SQL command to retrieve data?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctAnswer: 2, explanation: 'SELECT fetches data.' },
        { question: 'Which normal form removes partial dependency?', options: ['1NF', '2NF', 'BCNF', '5NF'], correctAnswer: 1, explanation: '2NF removes partial dependency.' },
        { question: 'A in ACID stands for?', options: ['Association', 'Atomicity', 'Allocation', 'Aggregation'], correctAnswer: 1, explanation: 'A means Atomicity.' },
        { question: 'Candidate key is?', options: ['Always foreign key', 'Possible primary key', 'Only nullable field', 'CSS key'], correctAnswer: 1, explanation: 'Candidate key can become primary key.' },
        { question: 'Which anomaly is reduced by normalization?', options: ['Syntax anomaly', 'Update anomaly', 'Pixel anomaly', 'Compiler anomaly'], correctAnswer: 1, explanation: 'Normalization reduces update anomalies.' },
        { question: 'Transactions are used to?', options: ['Render UI', 'Manage grouped operations safely', 'Create CSS', 'Compile JS'], correctAnswer: 1, explanation: 'Transactions manage grouped DB operations.' }
      ]
    },
    {
      courseTitle: 'Operating Systems Fundamentals',
      lessonTitle: 'Memory Management',
      title: 'Operating Systems Quiz',
      passingScore: 75,
      maxAttempts: 3,
      questions: [
        { question: 'Operating system acts as?', options: ['Browser only', 'Interface between user and hardware', 'Text editor', 'Database engine'], correctAnswer: 1, explanation: 'OS connects software and hardware.' },
        { question: 'A process is?', options: ['A file', 'Program in execution', 'Keyboard', 'Compiler'], correctAnswer: 1, explanation: 'A process is an executing program.' },
        { question: 'Deadlock happens when?', options: ['Extra memory exists', 'Processes wait indefinitely for resources', 'CPU speed increases', 'Files are deleted'], correctAnswer: 1, explanation: 'Deadlock is infinite waiting.' },
        { question: 'Arrival-order scheduling algorithm?', options: ['SJF', 'Round Robin', 'FCFS', 'Priority inversion'], correctAnswer: 2, explanation: 'FCFS serves by arrival time.' },
        { question: 'Memory management handles?', options: ['CSS', 'Primary memory allocation', 'Graphs', 'APIs'], correctAnswer: 1, explanation: 'Memory management handles RAM use.' },
        { question: 'Round Robin uses?', options: ['Time quantum', 'Foreign key', 'Recursion', 'Page color'], correctAnswer: 0, explanation: 'Round Robin uses time quantum.' },
        { question: 'Synchronization is needed to?', options: ['Slow systems', 'Coordinate shared resource access', 'Delete processes', 'Install drivers'], correctAnswer: 1, explanation: 'Synchronization coordinates access.' },
        { question: 'Which is memory management concept?', options: ['Paging', 'Styling', 'Hooks', 'Branching'], correctAnswer: 0, explanation: 'Paging is a memory concept.' },
        { question: 'CPU scheduler chooses?', options: ['File path', 'Next process', 'HTML tag', 'CSS selector'], correctAnswer: 1, explanation: 'Scheduler selects next process.' },
        { question: 'Context switching means?', options: ['Changing screen', 'Saving and loading process state', 'Formatting disk', 'Creating account'], correctAnswer: 1, explanation: 'Context switching swaps process states.' }
      ]
    },
    {
      courseTitle: 'Computer Networks Fundamentals',
      lessonTitle: 'Application Layer Protocols',
      title: 'Computer Networks Quiz',
      passingScore: 75,
      maxAttempts: 3,
      questions: [
        { question: 'OSI stands for?', options: ['Open Systems Interconnection', 'Online System Integration', 'Open Service Internet', 'Object Server Interface'], correctAnswer: 0, explanation: 'OSI means Open Systems Interconnection.' },
        { question: 'Which layer handles routing?', options: ['Physical', 'Network', 'Session', 'Presentation'], correctAnswer: 1, explanation: 'Network layer handles routing.' },
        { question: 'TCP is known for?', options: ['Unreliable delivery', 'Reliable connection-oriented communication', 'UI rendering', 'DB indexing'], correctAnswer: 1, explanation: 'TCP is reliable and connection-oriented.' },
        { question: 'UDP is?', options: ['Connection-oriented', 'Heavier than TCP', 'Connectionless', 'Only for databases'], correctAnswer: 2, explanation: 'UDP is connectionless.' },
        { question: 'HTTP is used for?', options: ['Email only', 'Web communication', 'Device drivers', 'Memory paging'], correctAnswer: 1, explanation: 'HTTP powers web communication.' },
        { question: 'Which is application layer protocol?', options: ['HTTP', 'ARP', 'Frame Relay', 'Parity'], correctAnswer: 0, explanation: 'HTTP belongs to application layer.' },
        { question: 'Data link layer mainly deals with?', options: ['Framing and MAC', 'HTML parsing', 'Compiler optimization', 'Drivers'], correctAnswer: 0, explanation: 'Data link handles framing.' },
        { question: 'Transport layer responsibility?', options: ['End-to-end communication', 'Page replacement', 'Color formatting', 'Image compression'], correctAnswer: 0, explanation: 'Transport layer manages end-to-end communication.' },
        { question: 'SMTP is associated with?', options: ['Web pages', 'Email sending', 'Routing packets', 'Congestion only'], correctAnswer: 1, explanation: 'SMTP sends emails.' },
        { question: 'HTTPS is secure because of?', options: ['Only UDP', 'Encryption/TLS', 'More HTML tags', 'Different keyboard'], correctAnswer: 1, explanation: 'HTTPS uses TLS/SSL encryption.' }
      ]
    },

    // MOBILE QUIZZES
    {
      courseTitle: 'Android Development with Java',
      lessonTitle: 'Building a Simple Android App',
      title: 'Android Development Quiz',
      passingScore: 75,
      maxAttempts: 3,
      questions: [
        { question: 'Android apps are commonly built in?', options: ['Photoshop', 'Android Studio', 'Excel', 'Figma only'], correctAnswer: 1, explanation: 'Android Studio is the official IDE.' },
        { question: 'An Activity in Android represents?', options: ['Database table', 'A single app screen', 'A CSS file', 'A server'], correctAnswer: 1, explanation: 'Activity represents a screen.' },
        { question: 'Layouts in Android are usually defined in?', options: ['XML', 'SQL', 'JSON', 'TXT'], correctAnswer: 0, explanation: 'Android layouts are commonly written in XML.' },
        { question: 'Intent is used to?', options: ['Style text', 'Navigate or communicate between components', 'Compile Java', 'Store images'], correctAnswer: 1, explanation: 'Intent helps navigation and communication.' },
        { question: 'Button click handling is done in?', options: ['CSS', 'Java/Kotlin code', 'Only XML', 'Database schema'], correctAnswer: 1, explanation: 'Click logic is handled in app code.' },
        { question: 'AndroidManifest.xml is used for?', options: ['Only colors', 'App configuration and components', 'Only images', 'Quiz questions'], correctAnswer: 1, explanation: 'Manifest defines app settings and components.' },
        { question: 'Which language is common for Android?', options: ['Java', 'PHP', 'Ruby', 'C only'], correctAnswer: 0, explanation: 'Java is a common Android language.' },
        { question: 'What is a View in Android?', options: ['A UI element', 'A database relation', 'A package manager', 'A route file'], correctAnswer: 0, explanation: 'View is a UI component.' },
        { question: 'LinearLayout arranges children?', options: ['In random order', 'In one direction', 'In database rows only', 'As graphs'], correctAnswer: 1, explanation: 'LinearLayout arranges in one direction.' },
        { question: 'Mobile app UI is important because?', options: ['It replaces backend', 'It affects user experience', 'It removes code', 'It controls BIOS'], correctAnswer: 1, explanation: 'UI strongly impacts user experience.' }
      ]
    },
    {
      courseTitle: 'Flutter App Development Basics',
      lessonTitle: 'Mini Flutter App Project',
      title: 'Flutter Basics Quiz',
      passingScore: 75,
      maxAttempts: 3,
      questions: [
        { question: 'Flutter is mainly used for?', options: ['Only DB design', 'Cross-platform app development', 'SEO only', 'OS kernel development'], correctAnswer: 1, explanation: 'Flutter builds cross-platform apps.' },
        { question: 'Flutter uses which language?', options: ['Java', 'Python', 'Dart', 'C#'], correctAnswer: 2, explanation: 'Flutter uses Dart.' },
        { question: 'A widget in Flutter is?', options: ['A server', 'A building block of UI', 'A DB record', 'A browser tab'], correctAnswer: 1, explanation: 'Widgets are the core UI building blocks.' },
        { question: 'StatelessWidget is used when?', options: ['UI never changes', 'Data always changes', 'SQL required', 'Server required'], correctAnswer: 0, explanation: 'StatelessWidget is for static UI.' },
        { question: 'StatefulWidget is used when?', options: ['No change needed', 'UI changes over time', 'Only CSS is needed', 'Only routing is needed'], correctAnswer: 1, explanation: 'StatefulWidget supports dynamic UI.' },
        { question: 'Which function starts a Flutter app?', options: ['startApp()', 'runApp()', 'mainUI()', 'flutterRun()'], correctAnswer: 1, explanation: 'runApp() launches the app widget tree.' },
        { question: 'Scaffold is commonly used for?', options: ['DB schema', 'Basic screen structure', 'Package installation', 'Encryption'], correctAnswer: 1, explanation: 'Scaffold provides page structure.' },
        { question: 'AppBar is used for?', options: ['Database indexing', 'Top app section/header', 'Network routing', 'File storage'], correctAnswer: 1, explanation: 'AppBar is the screen top bar.' },
        { question: 'Flutter supports mobile platforms like?', options: ['Android and iOS', 'Only Windows XP', 'Only Linux server', 'Only web'], correctAnswer: 0, explanation: 'Flutter supports Android and iOS.' },
        { question: 'Why is Flutter popular?', options: ['No UI support', 'Fast UI building with single codebase', 'Only because of SQL', 'It replaces Git'], correctAnswer: 1, explanation: 'Flutter enables fast multi-platform UI development.' }
      ]
    },

    // DESIGN QUIZZES
    {
      courseTitle: 'UI UX Design Fundamentals',
      lessonTitle: 'Wireframing and User Flow',
      title: 'UI UX Design Quiz',
      passingScore: 70,
      maxAttempts: 3,
      questions: [
        { question: 'UI stands for?', options: ['User Interface', 'Unique Interaction', 'User Internet', 'Unified Input'], correctAnswer: 0, explanation: 'UI means User Interface.' },
        { question: 'UX stands for?', options: ['User Xray', 'User Experience', 'Unified Experience', 'User Extension'], correctAnswer: 1, explanation: 'UX means User Experience.' },
        { question: 'Wireframe is used to?', options: ['Deploy backend', 'Plan screen layout', 'Write SQL queries', 'Compile apps'], correctAnswer: 1, explanation: 'Wireframes plan layout and structure.' },
        { question: 'Typography refers to?', options: ['Icons only', 'Use of fonts and text style', 'Database tables', 'Routing rules'], correctAnswer: 1, explanation: 'Typography is about text and font styling.' },
        { question: 'Color theory helps with?', options: ['Server speed', 'Visual communication and aesthetics', 'Database joins', 'API security'], correctAnswer: 1, explanation: 'Color theory improves visual design.' },
        { question: 'Good UX mainly focuses on?', options: ['Confusing screens', 'User needs and usability', 'Only animation', 'Only logos'], correctAnswer: 1, explanation: 'UX focuses on usability and user satisfaction.' },
        { question: 'Visual hierarchy helps users?', options: ['Get confused', 'Understand importance of elements', 'Delete layouts', 'Create server routes'], correctAnswer: 1, explanation: 'Hierarchy guides user attention.' },
        { question: 'Spacing in design is important because?', options: ['It wastes space', 'It improves readability and clarity', 'It slows app', 'It removes content'], correctAnswer: 1, explanation: 'Spacing makes interfaces cleaner.' },
        { question: 'User flow means?', options: ['App color palette', 'Path user follows through screens', 'Font family list', 'Package manager'], correctAnswer: 1, explanation: 'User flow maps user steps.' },
        { question: 'Design consistency helps?', options: ['Reduce trust', 'Improve usability and familiarity', 'Break navigation', 'Replace backend'], correctAnswer: 1, explanation: 'Consistency improves usability.' }
      ]
    },
    {
      courseTitle: 'Figma for App and Web Design',
      lessonTitle: 'Prototype a Mobile App Screen',
      title: 'Figma Design Quiz',
      passingScore: 70,
      maxAttempts: 3,
      questions: [
        { question: 'Figma is mainly used for?', options: ['DB management', 'UI/UX design and prototyping', 'Backend hosting', 'Compiling Java'], correctAnswer: 1, explanation: 'Figma is a design and prototyping tool.' },
        { question: 'A frame in Figma is used as?', options: ['Only font', 'Canvas/container for design', 'Server route', 'Database table'], correctAnswer: 1, explanation: 'Frames act like design containers.' },
        { question: 'Components in Figma help with?', options: ['Code execution', 'Reusable design elements', 'Server deployment', 'SQL queries'], correctAnswer: 1, explanation: 'Components improve reuse and consistency.' },
        { question: 'Prototype feature is used to?', options: ['Insert SQL', 'Link screens interactively', 'Compile app', 'Delete pages'], correctAnswer: 1, explanation: 'Prototype connects screens for interaction.' },
        { question: 'Auto Layout helps with?', options: ['Responsive arrangement of elements', 'Database indexing', 'Network routing', 'Package installation'], correctAnswer: 0, explanation: 'Auto Layout helps responsive design.' },
        { question: 'Figma is especially useful for?', options: ['Design collaboration', 'Only gaming', 'Only BIOS update', 'Only database creation'], correctAnswer: 0, explanation: 'Figma supports collaborative design.' },
        { question: 'A design system contains?', options: ['Only passwords', 'Reusable styles and components', 'Only SQL tables', 'Only routers'], correctAnswer: 1, explanation: 'Design systems organize reusable UI assets.' },
        { question: 'Which is important in app screen design?', options: ['No alignment', 'Clear spacing and consistency', 'Random font use', 'Overcrowded layout'], correctAnswer: 1, explanation: 'Spacing and consistency improve design.' },
        { question: 'Prototype transitions help show?', options: ['Only colors', 'How screens behave and connect', 'Server logs', 'Package.json'], correctAnswer: 1, explanation: 'Transitions demonstrate interaction flow.' },
        { question: 'Figma is commonly used for both?', options: ['UI and prototypes', 'SQL and APIs', 'OS and networks', 'Only command line'], correctAnswer: 0, explanation: 'Figma is used for UI design and prototyping.' }
      ]
    }
  ];

  await Quiz.insertMany(
    quizDefs.map((quiz) => {
      const course = courseMap[quiz.courseTitle];
      const lesson = lessons.find(
        (l) =>
          l.course.toString() === course._id.toString() &&
          l.title === quiz.lessonTitle
      );

      return {
        course: course._id,
        lesson: lesson ? lesson._id : undefined,
        title: quiz.title,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        questions: quiz.questions
      };
    })
  );

    await Job.insertMany([
    {
      title: 'Software Developer (Fresher)',
      company: 'Associative',
      location: 'Pune, Maharashtra, India',
      type: 'full-time',
      description:
        'Associative is hiring a fresher Software Developer for a full-time, in-office role in Pune. This role is suitable for candidates who want to work on real software development projects and grow with a product and service-based engineering team.',
      requirements: [
        'Ready to join a full-time in-office role',
        'Basic knowledge of programming fundamentals',
        'Understanding of web development concepts',
        'Good problem-solving skills',
        'Willingness to attend in-person interviews in Pune'
      ],
      skills: [
        'javascript',
        'html',
        'css',
        'react',
        'node.js',
        'problem solving'
      ],
      salary: 'Not disclosed',
      applyUrl: 'https://in.linkedin.com/jobs/view/software-developer-fresher-at-associative-4389912033',
      logo: 'https://www.google.com/s2/favicons?domain=associative.in&sz=128',
      deadline: new Date('2026-04-30'),
      isActive: true,
      postedBy: admin._id
    },
    {
      title: 'Full Stack Developer Intern',
      company: 'Tutedude',
      location: 'India',
      type: 'part-time',
      description:
        'Tutedude is hiring a Full Stack Developer Intern for a part-time role. This opportunity is suitable for students or early-career developers who want practical experience in full-stack development while working with a fast-growing edtech platform.',
      requirements: [
        'Interest in full-stack web development',
        'Basic understanding of HTML, CSS and JavaScript',
        'Familiarity with React or frontend frameworks',
        'Basic backend understanding is a plus',
        'Ability to learn quickly and contribute in a remote work setup'
      ],
      skills: [
        'html',
        'css',
        'javascript',
        'react',
        'node.js',
        'mongodb'
      ],
      salary: 'Not disclosed',
      applyUrl: 'https://in.linkedin.com/jobs/view/full-stack-developer-intern-at-tutedude-4391867343',
      logo: 'https://www.google.com/s2/favicons?domain=tutedude.com&sz=128',
      deadline: new Date('2026-04-20'),
      isActive: true,
      postedBy: admin._id
    },
    {
      title: 'Remote Software Engineer (Ruby)',
      company: 'Turing',
      location: 'Mumbai, Maharashtra, India',
      type: 'remote',
      description:
        'Turing is hiring a remote Software Engineer with Ruby expertise. This is a remote engineering opportunity for developers who want to work on globally distributed software projects with strong engineering standards.',
      requirements: [
        'Strong programming fundamentals',
        'Experience with Ruby',
        'Understanding of software engineering best practices',
        'Ability to work in a remote environment',
        'Good communication and collaboration skills'
      ],
      skills: [
        'ruby',
        'software engineering',
        'api',
        'git',
        'remote collaboration',
        'problem solving'
      ],
      salary: 'Not disclosed',
      applyUrl: 'https://in.linkedin.com/jobs/view/remote-software-engineer-ruby-at-turing-4391581850',
      logo: 'https://www.google.com/s2/favicons?domain=turing.com&sz=128',
      deadline: new Date('2026-04-25'),
      isActive: true,
      postedBy: admin._id
    },
    {
      title: 'Backend Intern',
      company: 'FRND',
      location: 'Bengaluru, Karnataka, India',
      type: 'internship',
      description:
        'FRND is hiring a Backend Intern for an in-office internship in Bengaluru. The role focuses on backend systems, APIs, databases and learning through real startup engineering work.',
      requirements: [
        'Available for a 6-month in-office internship',
        'Strong understanding of at least one backend language such as Python, Node.js, Java or Go',
        'Knowledge of databases',
        'Familiarity with REST APIs and basic networking concepts',
        'Eagerness to learn and solve real engineering problems'
      ],
      skills: [
        'node.js',
        'python',
        'java',
        'go',
        'rest api',
        'databases'
      ],
      salary: 'Not disclosed',
      applyUrl: 'https://www.linkedin.com/jobs/view/4393522865',
      logo: 'https://www.google.com/s2/favicons?domain=frnd.app&sz=128',
      deadline: new Date('2026-04-18'),
      isActive: true,
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