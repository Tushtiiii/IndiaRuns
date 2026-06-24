const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobStats,
} = require('../controllers/jobController');

router.use(protect);

router.post('/', authorize('recruiter', 'admin'), createJob);
router.get('/', getJobs);
router.get('/:id', getJob);
router.get('/:id/stats', authorize('recruiter', 'admin'), getJobStats);
router.patch('/:id', authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
