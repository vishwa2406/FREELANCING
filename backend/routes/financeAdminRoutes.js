const express = require('express');
const { protect } = require('../middleware/auth');
const isFinanceAdmin = require('../middleware/isFinanceAdmin');
const controller = require('../controllers/financeAdminController');

const router = express.Router();

router.use(protect, isFinanceAdmin);
router.get('/overview', controller.getOverview);
router.get('/tips', controller.getTips);
router.post('/tips', controller.addTip);
router.patch('/tips/:id', controller.updateTip);
router.delete('/tips/:id', controller.deleteTip);

module.exports = router;
