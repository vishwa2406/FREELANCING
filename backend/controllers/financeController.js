const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingGoal = require('../models/SavingGoal');
const FinanceTip = require('../models/FinanceTip');
const { monthBounds, calculateEmi, calculateSip, calculateInflation } = require('../utils/financeHelpers');
const { sendCsv } = require('../utils/csvExporter');
const { sendMonthlyReportPdf } = require('../utils/pdfGenerator');

const sum = (arr) => arr.reduce((acc, item) => acc + Number(item.amount || 0), 0);

const handleError = (next, error, statusCode = 500) => {
  error.statusCode = error.statusCode || statusCode;
  next(error);
};

exports.getDashboard = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const { start, end } = monthBounds(month);

    const [transactions, budgets, goals, tips] = await Promise.all([
      Transaction.find({ user: req.user._id, date: { $gte: start, $lt: end } }).sort({ date: -1 }),
      Budget.find({ user: req.user._id, month }).sort({ category: 1 }),
      SavingGoal.find({ user: req.user._id }).sort({ createdAt: -1 }),
      FinanceTip.find({ active: true }).sort({ createdAt: -1 }).limit(3),
    ]);

    const income = sum(transactions.filter((t) => t.type === 'income'));
    const expense = sum(transactions.filter((t) => t.type === 'expense'));
    const recentTransactions = await Transaction.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 }).limit(5);

    const budgetCards = budgets.map((b) => {
      const spent = sum(transactions.filter((t) => t.type === 'expense' && t.category === b.category));
      const percent = b.limitAmount ? (spent / b.limitAmount) * 100 : 0;
      return {
        ...b.toObject(),
        spent,
        remaining: Math.max(0, b.limitAmount - spent),
        percent,
        alert: percent >= 100 ? 'Exceeded' : percent >= b.alertAtPercent ? 'Near limit' : 'Safe',
      };
    });

    const goalCards = goals.map((g) => ({
      ...g.toObject(),
      progress: g.targetAmount ? (g.savedAmount / g.targetAmount) * 100 : 0,
    }));

    res.json({
      success: true,
      summary: { income, expense, balance: income - expense },
      recentTransactions,
      budgets: budgetCards,
      goals: goalCards,
      tips,
    });
  } catch (error) {
    handleError(next, error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { from, to, type, category } = req.query;
    const query = { user: req.user._id };
    if (from || to) query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
    if (type) query.type = type;
    if (category) query.category = new RegExp(category, 'i');

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    handleError(next, error);
  }
};

exports.addTransaction = async (req, res, next) => {
  try {
    const { date, type, category, amount, mode, notes } = req.body;
    if (!date || !type || !category || !amount) {
      const error = new Error('Missing required transaction fields');
      error.statusCode = 400;
      throw error;
    }

    const transaction = await Transaction.create({ user: req.user._id, date, type, category, amount, mode, notes });
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    handleError(next, error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    Object.assign(transaction, req.body);
    await transaction.save();
    res.json({ success: true, transaction });
  } catch (error) {
    handleError(next, error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    await transaction.deleteOne();
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    handleError(next, error);
  }
};

exports.getBudgets = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ user: req.user._id, month }).sort({ category: 1 });
    const { start, end } = monthBounds(month);
    const expenses = await Transaction.find({ user: req.user._id, type: 'expense', date: { $gte: start, $lt: end } });

    const items = budgets.map((b) => {
      const spent = sum(expenses.filter((e) => e.category === b.category));
      return {
        ...b.toObject(),
        spent,
        remaining: Math.max(0, b.limitAmount - spent),
        percent: b.limitAmount ? (spent / b.limitAmount) * 100 : 0,
      };
    });

    res.json({ success: true, budgets: items });
  } catch (error) {
    handleError(next, error);
  }
};

exports.addBudget = async (req, res, next) => {
  try {
    const { month, category, limitAmount, alertAtPercent } = req.body;
    const budget = await Budget.create({ user: req.user._id, month, category, limitAmount, alertAtPercent });
    res.status(201).json({ success: true, budget });
  } catch (error) {
    handleError(next, error);
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      const error = new Error('Budget not found');
      error.statusCode = 404;
      throw error;
    }
    Object.assign(budget, req.body);
    await budget.save();
    res.json({ success: true, budget });
  } catch (error) {
    handleError(next, error);
  }
};

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await SavingGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    const items = goals.map((g) => ({
      ...g.toObject(),
      progress: g.targetAmount ? (g.savedAmount / g.targetAmount) * 100 : 0,
    }));
    res.json({ success: true, goals: items });
  } catch (error) {
    handleError(next, error);
  }
};

exports.addGoal = async (req, res, next) => {
  try {
    const goal = await SavingGoal.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    handleError(next, error);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      const error = new Error('Goal not found');
      error.statusCode = 404;
      throw error;
    }
    Object.assign(goal, req.body);
    if (Number(goal.savedAmount) >= Number(goal.targetAmount)) goal.status = 'completed';
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) {
    handleError(next, error);
  }
};

exports.getCalculators = async (req, res, next) => {
  try {
    const { kind, principal, annualRate, months, monthlyInvestment, years, currentAmount } = req.query;
    if (kind === 'emi') return res.json({ success: true, result: calculateEmi({ principal, annualRate, months }) });
    if (kind === 'sip') return res.json({ success: true, result: calculateSip({ monthlyInvestment, annualRate, years }) });
    if (kind === 'inflation') return res.json({ success: true, result: calculateInflation({ currentAmount, annualRate, years }) });

    const error = new Error('Invalid calculator kind');
    error.statusCode = 400;
    throw error;
  } catch (error) {
    handleError(next, error);
  }
};

exports.exportTransactionsCsv = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    const rows = transactions.map((t) => ({
      date: new Date(t.date).toISOString().slice(0, 10),
      type: t.type,
      category: t.category,
      amount: t.amount,
      mode: t.mode,
      notes: t.notes,
    }));
    sendCsv(res, 'transactions.csv', rows);
  } catch (error) {
    handleError(next, error);
  }
};

exports.monthlyPdf = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const { start, end } = monthBounds(month);
    const [transactions, budgets, goals] = await Promise.all([
      Transaction.find({ user: req.user._id, date: { $gte: start, $lt: end } }).sort({ date: -1 }),
      Budget.find({ user: req.user._id, month }),
      SavingGoal.find({ user: req.user._id }),
    ]);

    const income = sum(transactions.filter((t) => t.type === 'income'));
    const expense = sum(transactions.filter((t) => t.type === 'expense'));
    const computedBudgets = budgets.map((b) => {
      const spent = sum(transactions.filter((t) => t.type === 'expense' && t.category === b.category));
      return { ...b.toObject(), spent, remaining: Math.max(0, b.limitAmount - spent) };
    });
    const computedGoals = goals.map((g) => ({
      ...g.toObject(),
      progress: g.targetAmount ? (g.savedAmount / g.targetAmount) * 100 : 0,
    }));

    sendMonthlyReportPdf(res, {
      month,
      userName: req.user.name,
      summary: { income, expense, balance: income - expense },
      budgets: computedBudgets,
      goals: computedGoals,
      transactions,
    });
  } catch (error) {
    handleError(next, error);
  }
};
