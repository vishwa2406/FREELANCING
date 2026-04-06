const MentorRequest = require('../models/MentorRequest');
const User = require('../models/User');
const createNotification = require('../utils/createNotification');

const getMentors = async (req, res, next) => {
  try {
    const mentors = await User.find({
      role: 'mentor',
      isActive: true
    }).select('-password');

    return res.json({
      success: true,
      mentors
    });
  } catch (err) {
    next(err);
  }
};

const sendRequest = async (req, res, next) => {
  try {
    const { mentorId, message } = req.body;

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID is required'
      });
    }

    const mentor = await User.findOne({
      _id: mentorId,
      role: 'mentor',
      isActive: true
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    const existing = await MentorRequest.findOne({
      mentee: req.user._id,
      mentor: mentorId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Request already sent to this mentor'
      });
    }

    const request = await MentorRequest.create({
      mentee: req.user._id,
      mentor: mentorId,
      message: message?.trim() || ''
    });

    await createNotification({
      users: [mentorId],
      title: 'New Mentorship Request',
      message: 'A learner has sent you a mentorship request.',
      type: 'mentor',
      link: '/mentor-dashboard'
    });

    return res.status(201).json({
      success: true,
      message: 'Mentor request sent successfully',
      request
    });
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const requests = await MentorRequest.find({
      mentee: req.user._id
    })
      .sort({ createdAt: -1 })
      .populate('mentor', 'name avatar skills bio email')
      .populate('sessionNotes.addedBy', 'name role');

    return res.json({
      success: true,
      requests
    });
  } catch (err) {
    next(err);
  }
};

const getMentorRequests = async (req, res, next) => {
  try {
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Mentor access required'
      });
    }

    const query = {};

    if (req.user.role === 'mentor') {
      query.mentor = req.user._id;
    }

    const requests = await MentorRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('mentee', 'name avatar email skills interests goals')
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

const updateRequest = async (req, res, next) => {
  try {
    const { status, scheduledAt } = req.body;

    if (!['accepted', 'rejected', 'completed', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const request = await MentorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const isMentorOwner = request.mentor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isMentorOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this request'
      });
    }

    request.status = status;

    if (scheduledAt !== undefined) {
      request.scheduledAt = scheduledAt || null;
    }

    await request.save();

    await createNotification({
      users: [request.mentee],
      title: 'Mentorship Update',
      message: `Your request has been ${status}`,
      type: 'mentor',
      link: '/mentors'
    });

    const populated = await MentorRequest.findById(request._id)
      .populate('mentee', 'name email')
      .populate('mentor', 'name email')
      .populate('sessionNotes.addedBy', 'name role');

    return res.json({
      success: true,
      message: 'Request updated successfully',
      request: populated
    });
  } catch (err) {
    next(err);
  }
};

const addNote = async (req, res, next) => {
  try {
    const request = await MentorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const isMentorOwner = request.mentor.toString() === req.user._id.toString();
    const isMenteeOwner = request.mentee.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isMentorOwner && !isMenteeOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to add notes'
      });
    }

    if (!req.body.note || !req.body.note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const cleanNote = req.body.note.trim();

    request.sessionNotes.push({
      note: cleanNote,
      addedBy: req.user._id
    });

    await request.save();

    if ((isMentorOwner || isAdmin) && request.mentee.toString() !== req.user._id.toString()) {
      await createNotification({
        users: [request.mentee],
        title: 'New Session Note',
        message: 'Your mentor added a new session note. Open mentorship section to view it.',
        type: 'mentor',
        link: '/mentors'
      });
    }

    const populated = await MentorRequest.findById(request._id)
      .populate('mentee', 'name email')
      .populate('mentor', 'name email')
      .populate('sessionNotes.addedBy', 'name role');

    return res.json({
      success: true,
      message: 'Session note added successfully',
      request: populated
    });
  } catch (err) {
    next(err);
  }
};

const rateSession = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    const request = await MentorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.mentee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the mentee can rate this session'
      });
    }

    if (!request.status || !['accepted', 'completed'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'You can only rate accepted or completed mentorship sessions'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    request.rating = rating;
    request.review = review?.trim() || '';
    await request.save();

    await createNotification({
      users: [request.mentor],
      title: 'New Session Rating',
      message: `You received a ${rating}-star rating from your mentee.`,
      type: 'mentor',
      link: '/mentor-dashboard'
    });

    const populated = await MentorRequest.findById(request._id)
      .populate('mentee', 'name email')
      .populate('mentor', 'name email')
      .populate('sessionNotes.addedBy', 'name role');

    return res.json({
      success: true,
      message: 'Session rated successfully',
      request: populated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMentors,
  sendRequest,
  getMyRequests,
  getMentorRequests,
  updateRequest,
  addNote,
  rateSession
};