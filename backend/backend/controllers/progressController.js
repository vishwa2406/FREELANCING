const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

const getProgress = async (req, res, next) => {
  try {
    const { courseId } = req.query;

    const query = { user: req.user._id };
    if (courseId) query.course = courseId;

    const progress = await Progress.find(query)
      .populate('course', 'title thumbnail category')
      .populate('completedLessons', 'title order');

    return res.json({
      success: true,
      progress
    });
  } catch (err) {
    next(err);
  }
};

const startCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'courseId is required'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
        completedLessons: [],
        percentage: 0,
        isCompleted: false,
        lastAccessedAt: new Date()
      });

      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrolledCount: 1 }
      });
    } else {
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    return res.json({
      success: true,
      message: 'Course started successfully',
      progress
    });
  } catch (err) {
    next(err);
  }
};

const markLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId, isCourseLevel } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'courseId is required'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
        completedLessons: [],
        percentage: 0,
        isCompleted: false
      });

      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrolledCount: 1 }
      });
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });

    if (lessonId) {
      const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      const alreadyCompleted = progress.completedLessons.some(
        (id) => id.toString() === lessonId
      );

      if (!alreadyCompleted) {
        progress.completedLessons.push(lessonId);
      }

      progress.percentage =
        totalLessons > 0
          ? Math.round((progress.completedLessons.length / totalLessons) * 100)
          : 100;
    } else if (isCourseLevel || totalLessons === 0) {
      progress.percentage = 100;
      progress.isCompleted = true;
      progress.completedAt = new Date();
    } else {
      return res.status(400).json({
        success: false,
        message: 'lessonId is required for courses that have lessons'
      });
    }

    progress.lastAccessedAt = new Date();

    if (progress.percentage >= 100) {
      progress.isCompleted = true;
      if (!progress.completedAt) {
        progress.completedAt = new Date();
      }
    }

    await progress.save();

    return res.json({
      success: true,
      message: lessonId ? 'Lesson progress updated' : 'Course marked as completed',
      progress
    });
  } catch (err) {
    next(err);
  }
};

const getCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    }).populate('course', 'title');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found for this course'
      });
    }

    if (!progress.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Complete the course first'
      });
    }

    if (!progress.certificateIssued) {
      return res.status(400).json({
        success: false,
        message: 'Pass the quiz to unlock certificate'
      });
    }

    const quizzes = await Quiz.find({ course: courseId });

    let bestPassedAttempt = null;

    quizzes.forEach((quiz) => {
      const passedAttempts = (quiz.attempts || []).filter(
        (attempt) =>
          attempt.user.toString() === req.user._id.toString() &&
          attempt.passed === true
      );

      passedAttempts.forEach((attempt) => {
        if (!bestPassedAttempt || attempt.percentage > bestPassedAttempt.percentage) {
          bestPassedAttempt = attempt;
        }
      });
    });

    if (!bestPassedAttempt) {
      return res.status(400).json({
        success: false,
        message: 'No passed quiz attempt found'
      });
    }

    return res.json({
      success: true,
      certificate: {
        userName: req.user.name,
        courseTitle: progress.course?.title || 'Course',
        completedAt: progress.completedAt || new Date(),
        quizPercentage: bestPassedAttempt.percentage,
        projectTitle: 'CEGP - Community Empowerment & Growth Portal'
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMyStats = async (req, res, next) => {
  try {
    const allProgress = await Progress.find({ user: req.user._id }).populate(
      'course',
      'title category'
    );

    const completed = allProgress.filter((p) => p.isCompleted).length;
    const inProgress = allProgress.filter(
      (p) => !p.isCompleted && p.percentage > 0
    ).length;

    const avgPercentage =
      allProgress.length > 0
        ? Math.round(
            allProgress.reduce((acc, p) => acc + p.percentage, 0) /
              allProgress.length
          )
        : 0;

    return res.json({
      success: true,
      stats: {
        total: allProgress.length,
        completed,
        inProgress,
        avgPercentage,
        progress: allProgress
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProgress,
  startCourse,
  markLesson,
  getCertificate,
  getMyStats
};