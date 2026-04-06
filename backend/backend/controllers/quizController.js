const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');

const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (req.user?.role === 'admin') {
      return res.json({
        success: true,
        quiz
      });
    }

    const safeQuiz = {
      _id: quiz._id,
      course: quiz.course,
      lesson: quiz.lesson,
      title: quiz.title,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options
      }))
    };

    return res.json({
      success: true,
      quiz: safeQuiz
    });
  } catch (err) {
    next(err);
  }
};

const getQuizzesByCourse = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select(
      'title lesson passingScore maxAttempts questions createdAt'
    );

    return res.json({
      success: true,
      quizzes
    });
  } catch (err) {
    next(err);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const userAttempts = quiz.attempts.filter(
      (a) => a.user.toString() === req.user._id.toString()
    );

    if (userAttempts.length >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${quiz.maxAttempts} attempts reached`
      });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Please submit answers for all questions'
      });
    }

    let correct = 0;

    const results = quiz.questions.map((q, idx) => {
      const selectedAnswer = answers[idx];
      const isCorrect = Number(selectedAnswer) === q.correctAnswer;

      if (isCorrect) correct++;

      return {
        question: q.question,
        selectedAnswer: Number(selectedAnswer),
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = correct;
    const percentage = Math.round((correct / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    quiz.attempts.push({
      user: req.user._id,
      answers: answers.map(Number),
      score,
      percentage,
      passed
    });

    await quiz.save();

    // certificate issue condition:
    // 1. quiz passed
    // 2. course completed
    if (passed) {
      const progress = await Progress.findOne({
        user: req.user._id,
        course: quiz.course
      });

      if (progress && progress.isCompleted) {
        progress.certificateIssued = true;
        await progress.save();
      }
    }

    return res.json({
      success: true,
      message: 'Quiz submitted successfully',
      results,
      score,
      percentage,
      passed,
      totalQuestions: quiz.questions.length,
      attemptNumber: userAttempts.length + 1
    });
  } catch (err) {
    next(err);
  }
};

const getUserAttempts = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const attempts = quiz.attempts.filter(
      (a) => a.user.toString() === req.user._id.toString()
    );

    return res.json({
      success: true,
      attempts,
      maxAttempts: quiz.maxAttempts,
      remaining: Math.max(quiz.maxAttempts - attempts.length, 0)
    });
  } catch (err) {
    next(err);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      course: req.params.courseId
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (err) {
    next(err);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        lesson: req.body.lesson || null,
        questions: req.body.questions || [],
        passingScore: req.body.passingScore,
        maxAttempts: req.body.maxAttempts
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    return res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQuiz,
  getQuizzesByCourse,
  submitQuiz,
  getUserAttempts,
  createQuiz,
  updateQuiz
};