const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const fc = require('../controllers/freelancerController');

// ── Multer config — save recordings to /uploads/recordings/ ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'recordings'));
  },
  filename: (req, file, cb) => {
    const unique = `${req.params.orderId}_${Date.now()}.webm`;
    cb(null, unique);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files allowed'));
  }
});

// ── Freelancer Join ──
router.post('/request', protect, fc.requestFreelancer);
router.get('/request/me', protect, fc.getMyFreelancerRequest);

// ── User (Client) routes ──
router.get('/client-overview', protect, fc.getClientOverview);
router.post('/projects', protect, fc.createProject);
router.get('/projects/mine', protect, fc.getMyProjects);
router.patch('/projects/:projectId/proposals/:proposalId', protect, fc.respondToProposal);
router.get('/orders/mine', protect, fc.getMyOrders);
router.post('/orders/:orderId/pay', protect, fc.payOrder);
router.get('/orders/:orderId/invoice', protect, fc.downloadInvoice);

// ── Messaging ──
router.get('/messages/:orderId', protect, fc.getMessages);
router.post('/messages/:orderId', protect, fc.sendMessage);

// ── Freelancer panel routes ──
router.get('/overview', protect, fc.getFreelancerOverview);
router.post('/services', protect, fc.createService);
router.get('/services/mine', protect, fc.getMyServices);
router.patch('/services/:id', protect, fc.updateService);
router.delete('/services/:id', protect, fc.deleteService);
router.get('/browse', protect, fc.browseProjects);
router.post('/browse/:projectId/propose', protect, fc.sendProposal);
router.get('/proposals/mine', protect, fc.getMyProposals);

// FIX: was /freelancer/orders (double-prefix), corrected to /orders/freelancer
router.get('/orders/freelancer', protect, fc.getFreelancerOrders);

// Recording
router.post('/orders/:orderId/recording/start', protect, fc.startRecording);
router.post('/orders/:orderId/recording/stop', protect, fc.stopRecording);
router.post('/orders/:orderId/recording/upload', protect, upload.single('recording'), fc.uploadRecording);

// Mark completed
router.patch('/orders/:orderId/complete', protect, fc.markOrderCompleted);

router.get('/earnings', protect, fc.getEarnings);

// ── Admin routes ──
router.get('/admin/requests', protect, isAdmin, fc.adminGetRequests);
router.patch('/admin/requests/:id', protect, isAdmin, fc.adminHandleRequest);
router.get('/admin/recordings', protect, isAdmin, fc.adminGetRecordings);

module.exports = router;
