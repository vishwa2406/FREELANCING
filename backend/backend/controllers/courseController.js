const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { getRecommendedCourses } = require('../utils/recommend');
const createNotification = require('../utils/createNotification');

const escapeRegex = (value = '') => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getCourses = async (req, res, next) => {
  try {
    const { search, level, tag, category, page = 1, limit = 12 } = req.query;

    const query = { status: 'published' };

    if (level) query.level = level;
    if (tag) query.tags = { $in: [tag] };
    if (category) query.category = category;

    if (search && search.trim()) {
      const tokens = search
        .trim()
        .split(/\s+/)
        .map(token => token.trim())
        .filter(Boolean);

      if (tokens.length > 0) {
        query.$and = tokens.map((token) => {
          const safeToken = escapeRegex(token);
          const regex = new RegExp(safeToken, 'i');

          return {
            $or: [
              { title: regex },
              { description: regex },
              { category: regex },
              { instructor: regex },
              { tags: regex }
            ]
          };
        });
      }
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      success: true,
      courses,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    });
  } catch (err) {
    next(err);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });

    let progress = null;
    if (req.user?._id) {
      progress = await Progress.findOne({
        user: req.user._id,
        course: course._id
      });
    }

    return res.json({
      success: true,
      course,
      lessons,
      progress
    });
  } catch (err) {
    next(err);
  }
};

const getRecommended = async (req, res, next) => {
  try {
    const allCourses = await Course.find({ status: 'published' });
    const recommended = getRecommendedCourses(req.user, allCourses);

    return res.json({
      success: true,
      courses: recommended
    });
  } catch (err) {
    next(err);
  }
};

const toggleBookmark = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const user = await User.findById(req.user._id);

    const alreadyBookmarked = user.bookmarkedCourses.some(
      (id) => id.toString() === courseId
    );

    if (alreadyBookmarked) {
      user.bookmarkedCourses = user.bookmarkedCourses.filter(
        (id) => id.toString() !== courseId
      );
    } else {
      user.bookmarkedCourses.push(courseId);
    }

    await user.save();

    return res.json({
      success: true,
      bookmarked: !alreadyBookmarked,
      bookmarkedCourses: user.bookmarkedCourses
    });
  } catch (err) {
    next(err);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({
      ...req.body,
      createdBy: req.user._id
    });

    const users = await User.find().select('_id');

    await createNotification({
      users: users.map((u) => u._id),
      title: 'New Course Available',
      message: `${course.title} has been added`,
      type: 'course',
      link: `/courses/${course._id}`
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    return res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await Lesson.deleteMany({ course: req.params.id });
    await Progress.deleteMany({ course: req.params.id });

    return res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses,
  getCourse,
  getRecommended,
  toggleBookmark,
  createCourse,
  updateCourse,
  deleteCourse
};