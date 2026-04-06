const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User'); // 🔥 needed
const createNotification = require('../utils/createNotification'); // 🔥 needed

const getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1 });

    res.json({
      success: true,
      lessons
    });
  } catch (err) {
    next(err);
  }
};

const getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      lesson
    });
  } catch (err) {
    next(err);
  }
};

const createLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.create({
      ...req.body,
      course: req.params.courseId
    });

    // 🔥 GET COURSE INFO (for notification message)
    const course = await Course.findById(req.params.courseId);

    // 🔥 GET ALL USERS (you can later filter by enrolled users)
    const users = await User.find().select('_id');

    // 🔥 CREATE NOTIFICATION
    await createNotification({
      users: users.map(u => u._id),
      title: 'New Lesson Added',
      message: `${lesson.title || 'A new lesson'} added in ${course?.title || 'course'}`,
      type: 'lesson',
      link: `/courses/${req.params.courseId}/watch`
    });

    res.status(201).json({
      success: true,
      lesson
    });
  } catch (err) {
    next(err);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      lesson
    });
  } catch (err) {
    next(err);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      message: 'Lesson deleted'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
};