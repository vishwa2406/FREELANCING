const express = require('express');
const router = express.Router();

const {
  getJobs,
  getAdminJobs,
  getSavedJobs,
  getJob,
  getRecommendedJobs,
  toggleSaveJob,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');

const { protect } = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};

router.get('/', getJobs);
router.get('/recommended', protect, getRecommendedJobs);
router.get('/saved', protect, getSavedJobs);
router.get('/admin/all', protect, adminOnly, getAdminJobs);

router.get('/:id', getJob);
router.post('/:id/save', protect, toggleSaveJob);

router.post('/', protect, adminOnly, createJob);
router.patch('/:id', protect, adminOnly, updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);

module.exports = router;