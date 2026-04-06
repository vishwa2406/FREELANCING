const express = require('express');
const { protect } = require('../middleware/auth');
const financeController = require('../controllers/financeController');

const router = express.Router();

router.use(protect);
router.get('/dashboard', financeController.getDashboard);
router.get('/tx', financeController.getTransactions);
router.post('/tx', financeController.addTransaction);
router.patch('/tx/:id', financeController.updateTransaction);
router.delete('/tx/:id', financeController.deleteTransaction);
router.get('/budgets', financeController.getBudgets);
router.post('/budgets', financeController.addBudget);
router.patch('/budgets/:id', financeController.updateBudget);
router.get('/goals', financeController.getGoals);
router.post('/goals', financeController.addGoal);
router.patch('/goals/:id', financeController.updateGoal);
router.get('/calculators', financeController.getCalculators);
router.get('/tx/export.csv', financeController.exportTransactionsCsv);
router.get('/reports/monthly.pdf', financeController.monthlyPdf);

module.exports = router;
