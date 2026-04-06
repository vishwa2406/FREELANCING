const User = require('../models/User');
const Course = require('../models/Course');
const Job = require('../models/Job');
const Progress = require('../models/Progress');
const MentorRequest = require('../models/MentorRequest');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingGoal = require('../models/SavingGoal');
const FinanceTip = require('../models/FinanceTip');
const Conversation = require('../models/Conversation');
const FreelanceMessage = require('../models/FreelanceMessage');

const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalMentors,
      totalAdmins,
      totalCourses,
      totalJobs,
      totalEnrollments,
      totalMentorRequests,
      pendingMentorRequests,
      acceptedMentorRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'admin' }),
      Course.countDocuments({ status: 'published' }),
      Job.countDocuments({ isActive: true }),
      Progress.countDocuments(),
      MentorRequest.countDocuments(),
      MentorRequest.countDocuments({ status: 'pending' }),
      MentorRequest.countDocuments({ status: 'accepted' })
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt role isActive');

    const topCourses = await Course.find()
      .sort({ enrolledCount: -1, rating: -1 })
      .limit(5)
      .select('title enrolledCount rating status');

    const recentMentorRequests = await MentorRequest.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('mentee', 'name email')
      .populate('mentor', 'name email');

    return res.json({
      success: true,
      analytics: {
        totalUsers,
        totalMentors,
        totalAdmins,
        totalCourses,
        totalJobs,
        totalEnrollments,
        totalMentorRequests,
        pendingMentorRequests,
        acceptedMentorRequests,
        recentUsers,
        topCourses,
        recentMentorRequests
      }
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const role = req.query.role?.trim();
    const search = req.query.search?.trim();

    const query = {};

    if (role) query.role = role;
    else query.role = { $ne: 'admin' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    return res.json({
      success: true,
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'role',
      'skills',
      'interests',
      'goals',
      'bio',
      'avatar',
      'isActive'
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (err) {
    next(err);
  }
};
const getMentors = async (req, res, next) => {
  try {
    const mentors = await User.find({ role: 'mentor' })
      .select('_id name email avatar')
      .sort({ name: 1 });
    return res.json({ success: true, mentors });
  } catch (err) {
    next(err);
  }
};

const getMentorRequestsForAdmin = async (req, res, next) => {
  try {
    const status = req.query.status?.trim();

    const query = {};
    if (status) query.status = status;

    const requests = await MentorRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('mentee', 'name email avatar skills')
      .populate('mentor', 'name email avatar skills')
      .populate('sessionNotes.addedBy', 'name role');

    return res.json({
      success: true,
      requests
    });
  } catch (err) {
    next(err);
  }
};

const getFinanceOverview = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 15);
    const type = req.query.type?.trim();
    const search = req.query.search?.trim();

    // Build tx query
    const txQuery = {};
    if (type) txQuery.type = type;

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }).select('_id');
      txQuery.user = { $in: users.map(u => u._id) };
    }

    const [totalTx, totalBudgets, totalGoals, totalTips, allTx] = await Promise.all([
      Transaction.countDocuments({}),
      Budget.countDocuments({}),
      SavingGoal.countDocuments({}),
      FinanceTip.countDocuments({}),
      Transaction.find({}).select('type amount')
    ]);

    const totalIncome = allTx
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const totalExpense = allTx
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    // Paginated transactions with optional type filter
    const transactions = await Transaction.find(txQuery)
      .populate('user', 'name email avatar')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const txTotal = await Transaction.countDocuments(txQuery);

    // Top spenders
    const topSpenders = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: '$user', totalSpent: { $sum: '$amount' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { totalSpent: 1, 'user.name': 1, 'user.email': 1, 'user.avatar': 1 } }
    ]);

    // Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await Transaction.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent saving goals
    const recentGoals = await SavingGoal.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Finance tips
    const tips = await FinanceTip.find({}).sort({ createdAt: -1 }).limit(10);

    return res.json({
      success: true,
      summary: {
        totalTransactions: totalTx,
        totalBudgets,
        totalGoals,
        totalTips,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      },
      transactions,
      txTotal,
      txPages: Math.ceil(txTotal / limit),
      txPage: page,
      topSpenders,
      categoryBreakdown,
      monthlyTrend,
      recentGoals,
      tips
    });
  } catch (err) {
    next(err);
  }
};

const addFinanceTransaction = async (req, res, next) => {
  try {
    const { user, date, type, category, amount, mode, notes } = req.body;
    if (!user) {
      return res.status(400).json({ success: false, message: 'User is required' });
    }
    const tx = await Transaction.create({
      user,
      date: new Date(date),
      type,
      category,
      amount,
      mode: mode || 'Cash',
      notes: notes || ''
    });
    return res.status(201).json({ success: true, transaction: tx });
  } catch (err) {
    next(err);
  }
};

const updateFinanceTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    return res.json({ success: true, transaction: tx });
  } catch (err) {
    next(err);
  }
};

const deleteFinanceTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findByIdAndDelete(id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    return res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};

const getChatAnalytics = async (req, res, next) => {
  try {
    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await FreelanceMessage.countDocuments();
    
    // Recent conversations with participants
    const conversations = await Conversation.find()
      .populate('participants', 'name email role avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      totalConversations,
      totalMessages,
      conversations
    });
  } catch (err) {
    next(err);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await FreelanceMessage.find({ conversation: conversationId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email role');

    return res.json({
      success: true,
      messages,
      conversation
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalytics,
  getUsers,
  updateUser,
  getMentors,
  getMentorRequestsForAdmin,
  getFinanceOverview,
  addFinanceTransaction,
  updateFinanceTransaction,
  deleteFinanceTransaction,
  getChatAnalytics,
  getChatHistory
};