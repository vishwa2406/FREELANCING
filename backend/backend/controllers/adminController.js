const User = require('../models/User');
const Course = require('../models/Course');
const Job = require('../models/Job');
const Progress = require('../models/Progress');
const MentorRequest = require('../models/MentorRequest');

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

module.exports = {
  getAnalytics,
  getUsers,
  updateUser,
  getMentorRequestsForAdmin
};