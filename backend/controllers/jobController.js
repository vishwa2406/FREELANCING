const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const createNotification = require('../utils/createNotification');

const normalizeArrayFromBody = (value, separator = ',') => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildJobPayload = (body = {}) => ({
  title: body.title?.trim(),
  company: body.company?.trim(),
  location: body.location?.trim(),
  type: body.type,
  description: body.description?.trim(),
  requirements: normalizeArrayFromBody(body.requirements, '\n'),
  skills: normalizeArrayFromBody(body.skills, ','),
  salary: body.salary?.trim() || 'Not disclosed',
  applyUrl: body.applyUrl?.trim() || '#',
  logo: body.logo?.trim() || '',
  isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  deadline: body.deadline || undefined
});

const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      type,
      location,
      skill,
      page = 1,
      limit = 9,
      sort = 'newest'
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      query.type = type;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (skill) {
      query.skills = { $elemMatch: { $regex: skill, $options: 'i' } };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 9);

    let sortQuery = { createdAt: -1 };
    if (sort === 'deadline') sortQuery = { deadline: 1, createdAt: -1 };
    if (sort === 'company') sortQuery = { company: 1, createdAt: -1 };
    if (sort === 'oldest') sortQuery = { createdAt: 1 };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortQuery)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      success: true,
      jobs,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    });
  } catch (err) {
    next(err);
  }
};

const getAdminJobs = async (req, res, next) => {
  try {
    const { search, type, page = 1, limit = 100 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 100);

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      success: true,
      jobs,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    });
  } catch (err) {
    next(err);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      match: { isActive: true },
      options: { sort: { createdAt: -1 } }
    });

    return res.json({
      success: true,
      jobs: user?.savedJobs || [],
      total: user?.savedJobs?.length || 0
    });
  } catch (err) {
    next(err);
  }
};

const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.json({
      success: true,
      job
    });
  } catch (err) {
    next(err);
  }
};

const getRecommendedJobs = async (req, res, next) => {
  try {
    const userSkills = (req.user.skills || []).map((s) => s.toLowerCase());

    const jobs = await Job.find({ isActive: true });

    const scored = jobs
      .map((job) => {
        const matchedSkills = (job.skills || []).filter((skill) =>
          userSkills.includes(String(skill).toLowerCase())
        ).length;

        return {
          job,
          score: matchedSkills
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.job.createdAt) - new Date(a.job.createdAt);
      })
      .slice(0, 6)
      .map((item) => item.job);

    return res.json({
      success: true,
      jobs: scored
    });
  } catch (err) {
    next(err);
  }
};

const toggleSaveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedJobs.some((id) => id.toString() === jobId);

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();

    return res.json({
      success: true,
      saved: !alreadySaved,
      savedJobs: user.savedJobs
    });
  } catch (err) {
    next(err);
  }
};

const createJob = async (req, res, next) => {
  try {
    const payload = buildJobPayload(req.body);

    const job = await Job.create({
      ...payload,
      postedBy: req.user._id
    });

    const users = await User.find().select('_id');

    await createNotification({
      users: users.map((u) => u._id),
      title: 'New Job Posted',
      message: `${job.title} at ${job.company}`,
      type: 'job',
      link: '/jobs'
    });

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (err) {
    next(err);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const payload = buildJobPayload(req.body);

    const job = await Job.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobs,
  getAdminJobs,
  getSavedJobs,
  getJob,
  getRecommendedJobs,
  toggleSaveJob,
  createJob,
  updateJob,
  deleteJob
};