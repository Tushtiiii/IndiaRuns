const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');

router.use(protect, authorize('admin'));

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalCandidates, totalApplications, avgScore] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Candidate.countDocuments(),
      Application.countDocuments(),
      Application.aggregate([
        { $match: { finalScore: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$finalScore' } } },
      ]),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('recruiter', 'name')
      .select('title status applicantCount createdAt');

    res.json({
      totalUsers,
      totalJobs,
      totalCandidates,
      totalApplications,
      avgMatchScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
      usersByRole,
      recentJobs,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 30 } = req.query;
    const query = role ? { role } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({ users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ─── PATCH /api/admin/users/:id ────────────────────────────────────────────────
router.patch('/users/:id', async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (role) update.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ message: 'User updated.', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Candidate.findOneAndDelete({ userId: req.params.id });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// ─── GET /api/admin/analytics ─────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    // Applications over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const applicationsOverTime = await Application.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$finalScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top skills across all candidates
    const topSkills = await Candidate.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Score distribution
    const scoreDistribution = await Application.aggregate([
      { $match: { finalScore: { $ne: null } } },
      {
        $bucket: {
          groupBy: '$finalScore',
          boundaries: [0, 20, 40, 60, 70, 80, 90, 100],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    res.json({ applicationsOverTime, topSkills, scoreDistribution });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
