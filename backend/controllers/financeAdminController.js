const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingGoal = require('../models/SavingGoal');
const FinanceTip = require('../models/FinanceTip');
const User = require('../models/User');

const handleError = (next, error, statusCode = 500) => {
  error.statusCode = error.statusCode || statusCode;
  next(error);
};

exports.getOverview = async (req, res, next) => {
  try {
    const [users, transactions, budgets, goals, tips] = await Promise.all([
      User.countDocuments({ role: { $in: ['user', 'finance_admin'] }, isActive: true }),
      Transaction.find({}).populate('user', 'name email').sort({ date: -1, createdAt: -1 }).limit(8),
      Budget.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(8),
      SavingGoal.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(8),
      FinanceTip.find({}).sort({ createdAt: -1 })
    ]);

    const totalIncome = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpense = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    res.json({
      success: true,
      summary: {
        users,
        transactions: await Transaction.countDocuments({}),
        budgets: await Budget.countDocuments({}),
        goals: await SavingGoal.countDocuments({}),
        tips: tips.length,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      },
      recentTransactions: transactions,
      recentBudgets: budgets,
      recentGoals: goals,
      tips
    });
  } catch (error) {
    handleError(next, error);
  }
};

exports.getTips = async (req, res, next) => {
  try {
    const tips = await FinanceTip.find({}).sort({ createdAt: -1 });
    res.json({ success: true, tips });
  } catch (error) {
    handleError(next, error);
  }
};

exports.addTip = async (req, res, next) => {
  try {
    const { title, content, tag, active } = req.body;
    if (!title || !content) {
      const error = new Error('Title and content are required');
      error.statusCode = 400;
      throw error;
    }

    const tip = await FinanceTip.create({ title, content, tag, active });
    res.status(201).json({ success: true, tip });
  } catch (error) {
    handleError(next, error);
  }
};

exports.updateTip = async (req, res, next) => {
  try {
    const tip = await FinanceTip.findById(req.params.id);
    if (!tip) {
      const error = new Error('Finance tip not found');
      error.statusCode = 404;
      throw error;
    }
    Object.assign(tip, req.body);
    await tip.save();
    res.json({ success: true, tip });
  } catch (error) {
    handleError(next, error);
  }
};

exports.deleteTip = async (req, res, next) => {
  try {
    const tip = await FinanceTip.findById(req.params.id);
    if (!tip) {
      const error = new Error('Finance tip not found');
      error.statusCode = 404;
      throw error;
    }
    await tip.deleteOne();
    res.json({ success: true, message: 'Finance tip deleted successfully' });
  } catch (error) {
    handleError(next, error);
  }
};
