const User = require('../models/User');
const FreelancerRequest = require('../models/FreelancerRequest');
const Project = require('../models/Project');
const Order = require('../models/Order');
const Service = require('../models/Service');
const FreelanceMessage = require('../models/FreelanceMessage');
const PDFDocument = require('pdfkit');

// ──────────────────────────────────────────────
// FREELANCER JOIN / REQUEST
// ──────────────────────────────────────────────

exports.requestFreelancer = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (user.role === 'freelancer') {
      return res.status(400).json({ success: false, message: 'You are already a freelancer.' });
    }

    const existing = await FreelancerRequest.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Request already ${existing.status}.`,
        request: existing
      });
    }

    const {
      bio,
      skills,
      portfolio,
      experienceLevel,
      yearsOfExperience,
      rate,
      availability,
      timezone,
      primarySkills,
      screeningAnswers
    } = req.body;
    const request = await FreelancerRequest.create({
      user: userId,
      bio,
      skills,
      portfolio,
      experienceLevel,
      yearsOfExperience,
      rate,
      availability,
      timezone,
      primarySkills,
      screeningAnswers
    });

    res.status(201).json({ success: true, message: 'Request submitted successfully.', request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyFreelancerRequest = async (req, res) => {
  try {
    const request = await FreelancerRequest.findOne({ user: req.user._id });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// PROJECTS (CLIENT SIDE)
// ──────────────────────────────────────────────

exports.createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline, skills } = req.body;

    // Compare date parts only — prevents timezone-related false rejections
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      deadlineDate.setUTCHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        return res.status(400).json({ success: false, message: 'Deadline cannot be in the past.' });
      }
    }

    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      budget,
      deadline,
      skills
    });
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user._id })
      .populate('proposals.freelancer', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToProposal = async (req, res) => {
  try {
    const { projectId, proposalId } = req.params;
    const { action } = req.body; // 'accepted' | 'rejected'

    const project = await Project.findOne({ _id: projectId, client: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const proposal = project.proposals.id(proposalId);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found.' });

    proposal.status = action;

    if (action === 'accepted') {
      project.status = 'in_progress';
      // Reject all other proposals
      project.proposals.forEach(p => {
        if (p._id.toString() !== proposalId) p.status = 'rejected';
      });
      // Create order
      await Order.create({
        project: projectId,
        client: req.user._id,
        freelancer: proposal.freelancer,
        amount: proposal.bidAmount
      });
    }

    await project.save();
    res.json({ success: true, message: `Proposal ${action}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// ORDERS (CLIENT SIDE)
// ──────────────────────────────────────────────

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ client: req.user._id })
      .populate('project', 'title description')
      .populate('service', 'title price')
      .populate('freelancer', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.payOrder = async (req, res) => {
  try {
    const { pin } = req.body;
    if (pin !== '123') {
      return res.status(400).json({ success: false, message: 'Invalid PIN. Payment failed.' });
    }

    const order = await Order.findOne({ _id: req.params.orderId, client: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.paymentStatus = 'paid';
    order.orderStatus = 'completed';
    const now = new Date();
    order.invoiceGeneratedAt = now;
    order.invoiceExpiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
    await order.save();

    res.json({ success: true, message: 'Payment successful!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// INVOICE
// ──────────────────────────────────────────────

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('project', 'title description budget')
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Access control: client or freelancer only
    const userId = req.user._id.toString();
    if (
      order.client._id.toString() !== userId &&
      order.freelancer._id.toString() !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Check 60-day expiry
    if (order.invoiceExpiresAt && new Date() > order.invoiceExpiresAt) {
      return res.status(410).json({ success: false, message: 'Invoice has expired (60-day limit).' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${order._id}.pdf"`
    );
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(`Invoice ID: ${order._id}`);
    doc.text(`Date: ${order.invoiceGeneratedAt ? new Date(order.invoiceGeneratedAt).toDateString() : 'N/A'}`);
    doc.text(`Expires: ${order.invoiceExpiresAt ? new Date(order.invoiceExpiresAt).toDateString() : 'N/A'}`);
    doc.moveDown();
    doc.fontSize(13).font('Helvetica-Bold').text('Client Details');
    doc.fontSize(11).font('Helvetica').text(`Name: ${order.client.name}`);
    doc.text(`Email: ${order.client.email}`);
    doc.moveDown();
    doc.fontSize(13).font('Helvetica-Bold').text('Freelancer Details');
    doc.fontSize(11).font('Helvetica').text(`Name: ${order.freelancer.name}`);
    doc.text(`Email: ${order.freelancer.email}`);
    doc.moveDown();
    doc.fontSize(13).font('Helvetica-Bold').text('Project Details');
    doc.fontSize(11).font('Helvetica').text(`Title: ${order.project.title}`);
    doc.text(`Description: ${order.project.description}`);
    doc.moveDown();
    doc.fontSize(13).font('Helvetica-Bold').text('Payment');
    doc.fontSize(11).font('Helvetica').text(`Amount: $${order.amount}`);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);
    doc.text(`Order Status: ${order.orderStatus.toUpperCase()}`);

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// MESSAGES
// ──────────────────────────────────────────────

exports.getMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const userId = req.user._id.toString();
    if (
      order.client.toString() !== userId &&
      order.freelancer.toString() !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const messages = await FreelanceMessage.find({ order: orderId })
      .populate('sender', 'name avatar role')
      .sort('createdAt');

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content, fileUrl, fileType, fileName } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const userId = req.user._id.toString();
    if (order.client.toString() !== userId && order.freelancer.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const message = await FreelanceMessage.create({
      order: orderId,
      sender: req.user._id,
      content,
      fileUrl,
      fileType,
      fileName
    });

    await message.populate('sender', 'name avatar role');
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// FREELANCER PANEL
// ──────────────────────────────────────────────

exports.getFreelancerOverview = async (req, res) => {
  try {
    const fId = req.user._id;
    const [totalOrders, activeOrders, paidOrders, proposals] = await Promise.all([
      Order.countDocuments({ freelancer: fId }),
      Order.countDocuments({ freelancer: fId, orderStatus: 'active' }),
      Order.find({ freelancer: fId, paymentStatus: 'paid' }),
      Project.find({ 'proposals.freelancer': fId, 'proposals.status': 'pending' })
    ]);

    const totalEarnings = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const pendingProposals = proposals.reduce((count, proj) => {
      return count + proj.proposals.filter(p => p.freelancer.toString() === fId.toString() && p.status === 'pending').length;
    }, 0);

    const recentOrders = await Order.find({ freelancer: fId })
      .populate('project', 'title')
      .populate('service', 'title')
      .populate('client', 'name avatar')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      overview: { totalOrders, activeOrders, totalEarnings, pendingProposals, completedOrders: paidOrders.length, recentOrders }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClientOverview = async (req, res) => {
  try {
    const cId = req.user._id;
    const [totalProjects, activeOrders, paidOrders, recentOrders] = await Promise.all([
      Project.countDocuments({ client: cId }),
      Order.countDocuments({ client: cId, orderStatus: { $ne: 'completed' } }),
      Order.find({ client: cId, paymentStatus: 'paid' }),
      Order.find({ client: cId })
        .populate('project', 'title')
        .populate('service', 'title')
        .populate('freelancer', 'name avatar')
        .sort('-createdAt')
        .limit(5)
    ]);

    const totalSpent = paidOrders.reduce((sum, o) => sum + o.amount, 0);

    res.json({
      success: true,
      overview: { totalProjects, activeOrders, totalSpent, recentOrders }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Services (Offerings)
exports.createService = async (req, res) => {
  try {
    const service = await Service.create({ freelancer: req.user._id, ...req.body });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all active services (public)
exports.getActiveServices = async (req, res) => {
  try {
    const services = await Service.find({ status: 'active' })
      .populate('freelancer', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create order from a service (client hires a freelancer)
exports.createOrderFromService = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    if (service.status !== 'active') return res.status(400).json({ success: false, message: 'Service is not active.' });
    const order = await Order.create({
      client: req.user._id,
      freelancer: service.freelancer,
      service: service._id,
      amount: service.price,
      // project left undefined for direct service hire
    });
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ freelancer: req.user._id }).sort('-createdAt');
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, freelancer: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.findOneAndDelete({ _id: req.params.id, freelancer: req.user._id });
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Browse & Send Proposals
exports.browseProjects = async (req, res) => {
  try {
    const { search, minBudget, maxBudget, skill } = req.query;
    const query = { status: 'open' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minBudget) query.budget = { ...query.budget, $gte: Number(minBudget) };
    if (maxBudget) query.budget = { ...query.budget, $lte: Number(maxBudget) };
    if (skill) query.skills = { $in: [skill] };

    const projects = await Project.find(query)
      .populate('client', 'name avatar')
      .sort('-createdAt');

    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendProposal = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { coverLetter, bidAmount, deliveryDays } = req.body;
    const freelancerId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (project.status !== 'open') return res.status(400).json({ success: false, message: 'Project is no longer open.' });

    const alreadySent = project.proposals.some(p => p.freelancer.toString() === freelancerId.toString());
    if (alreadySent) return res.status(400).json({ success: false, message: 'You already sent a proposal.' });

    project.proposals.push({ freelancer: freelancerId, coverLetter, bidAmount, deliveryDays });
    await project.save();

    res.status(201).json({ success: true, message: 'Proposal sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyProposals = async (req, res) => {
  try {
    const freelancerId = req.user._id;
    const projects = await Project.find({ 'proposals.freelancer': freelancerId })
      .populate('client', 'name avatar email')
      .sort('-updatedAt');

    const proposals = projects.map(proj => {
      const proposal = proj.proposals.find(p => p.freelancer.toString() === freelancerId.toString());
      return {
        projectId: proj._id,
        projectTitle: proj.title,
        projectBudget: proj.budget,
        projectStatus: proj.status,
        client: proj.client,
        proposal
      };
    });

    res.json({ success: true, proposals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Freelancer Orders
exports.getFreelancerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ freelancer: req.user._id })
      .populate('project', 'title description')
      .populate('service', 'title price')
      .populate('client', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Recording
exports.startRecording = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, freelancer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.recording.isRecording = true;
    order.recording.startedAt = new Date();
    order.recording.stoppedAt = undefined;
    await order.save();

    res.json({ success: true, message: 'Recording started.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.stopRecording = async (req, res) => {
  try {
    const { recordingData } = req.body;
    const order = await Order.findOne({ _id: req.params.orderId, freelancer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.recording.isRecording = false;
    order.recording.stoppedAt = new Date();
    if (recordingData) order.recording.data = recordingData;
    await order.save();

    res.json({ success: true, message: 'Recording stopped.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Freelancer earnings
exports.getEarnings = async (req, res) => {
  try {
    const orders = await Order.find({ freelancer: req.user._id, paymentStatus: 'paid' })
      .populate('project', 'title')
      .populate('service', 'title')
      .populate('client', 'name')
      .sort('-updatedAt');

    const total = orders.reduce((sum, o) => sum + o.amount, 0);
    res.json({ success: true, totalEarnings: total, completedOrders: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// ADMIN
// ──────────────────────────────────────────────

exports.adminGetRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await FreelancerRequest.find(filter)
      .populate('user', 'name email avatar role')
      .sort('-createdAt');
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminHandleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // 'approve' | 'reject'

    const request = await FreelancerRequest.findById(id).populate('user');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (action === 'approve') {
      request.status = 'approved';
      // Promote the user's role permanently
      await User.findByIdAndUpdate(request.user._id, { role: 'freelancer' });
    } else if (action === 'reject') {
      request.status = 'rejected';
      request.rejectionReason = rejectionReason || '';
    }

    await request.save();
    res.json({ success: true, message: `Request ${action}d.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminGetRecordings = async (req, res) => {
  try {
    const orders = await Order.find({ 'recording.startedAt': { $exists: true } })
      .populate('freelancer', 'name email')
      .populate('client', 'name email')
      .populate('project', 'title')
      .select('recording orderStatus createdAt client freelancer project amount')
      .sort('-recording.startedAt');

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// RECORDING UPLOAD (multer-saved file)
// ──────────────────────────────────────────────

exports.uploadRecording = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, freelancer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    // Build a public URL for the saved file
    const fileUrl = `http://localhost:5000/uploads/recordings/${req.file.filename}`;

    order.recording.isRecording = false;
    order.recording.stoppedAt = new Date();
    order.recording.data = fileUrl;
    await order.save();

    res.json({ success: true, message: 'Recording uploaded.', url: fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// MARK ORDER AS COMPLETED (Freelancer)
// ──────────────────────────────────────────────

exports.markOrderCompleted = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, freelancer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.orderStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Order already completed.' });
    }

    order.orderStatus = 'delivered';
    await order.save();

    res.json({ success: true, message: 'Order marked as delivered!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
