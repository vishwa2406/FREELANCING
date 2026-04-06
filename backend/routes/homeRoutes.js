const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    portal: 'Community Empowerment & Growth Portal',
    modules: [
      {
        id: 'A',
        title: 'Career & Skill Development',
        description: 'Courses, lessons, quizzes, progress tracking, jobs, and mentors.',
        route: '/dashboard',
        status: 'active'
      },
      {
        id: 'B',
        title: 'Financial Literacy & Personal Budgeting',
        description: 'Transactions, budgets, saving goals, calculators, reports, and exports.',
        route: '/finance/dashboard',
        status: 'active'
      },
      {
        id: 'C',
        title: 'Micro-Enterprise & Freelance Launcher',
        description: 'Offerings, leads, orders, invoices, and freelance workflow support.',
        route: '/login',
        status: 'planned'
      }
    ]
  });
});

module.exports = router;
