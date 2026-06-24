const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  rankCandidates,
  generateInsights,
  generateInterviewQuestions,
  chat,
  getStatus,
  getRankedApplications,
} = require('../controllers/aiController');

router.use(protect);

router.get('/status', getStatus);
router.post('/rank-candidates', authorize('recruiter', 'admin'), rankCandidates);
router.post('/generate-insights', authorize('recruiter', 'admin'), generateInsights);
router.post('/interview-questions', authorize('recruiter', 'admin'), generateInterviewQuestions);
router.post('/chat', authorize('recruiter', 'admin'), chat);
router.get('/ranked-applications/:jobId', authorize('recruiter', 'admin'), getRankedApplications);

module.exports = router;
