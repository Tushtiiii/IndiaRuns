const Job = require('../models/Job');
const Application = require('../models/Application');
const { parseJobDescription, generateEmbedding } = require('../services/aiService');
const { extractTextFromBuffer } = require('../services/resumeParser');
const multer = require('multer');
const path = require('path');

// Upload for JD files
const jdUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ['.pdf', '.docx', '.doc', '.txt'].includes(ext) ? cb(null, true) : cb(new Error('Invalid file type'));
  },
});

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
exports.createJob = [
  jdUpload.single('jdFile'),
  async (req, res) => {
    try {
      let rawDescription = req.body.description || '';

      // If file uploaded, extract text
      if (req.file) {
        rawDescription = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
      }

      if (!rawDescription || rawDescription.trim().length < 20) {
        return res.status(400).json({ error: 'Job description is required (text or file).' });
      }

      // AI parse the JD
      let parsedProfile = {};
      try {
        parsedProfile = await parseJobDescription(rawDescription);
      } catch (aiErr) {
        console.error('AI JD parse error (non-fatal):', aiErr.message);
      }

      // Generate embedding for semantic search
      let embeddings = [];
      try {
        const embeddingText = `${parsedProfile.title || req.body.title || ''} ${rawDescription}`;
        embeddings = await generateEmbedding(embeddingText);
      } catch (embErr) {
        console.error('Embedding error (non-fatal):', embErr.message);
      }

      const job = await Job.create({
        title: parsedProfile.title || req.body.title || 'Untitled Job',
        company: req.body.company || parsedProfile.company || '',
        location: req.body.location || 'Remote',
        rawDescription,
        parsedProfile,
        embeddings,
        recruiter: req.user._id,
        aiProcessed: Object.keys(parsedProfile).length > 0,
        tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],
      });

      res.status(201).json({
        message: 'Job created and AI-analyzed successfully.',
        job: { ...job.toObject(), embeddings: undefined }, // Don't return large vector
      });
    } catch (err) {
      console.error('Create job error:', err);
      res.status(500).json({ error: err.message || 'Failed to create job.' });
    }
  },
];

// ─── GET /api/jobs ────────────────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Recruiters only see their own jobs; admins see all
    if (req.user.role === 'recruiter') {
      query.recruiter = req.user._id;
    }
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiter', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-embeddings'), // Exclude large vector from list
      Job.countDocuments(query),
    ]);

    res.json({
      jobs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
};

// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email avatar')
      .select('-embeddings');

    if (!job) return res.status(404).json({ error: 'Job not found.' });

    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job.' });
  }
};

// ─── PATCH /api/jobs/:id ──────────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found or unauthorized.' });

    const updatableFields = ['title', 'company', 'location', 'status', 'tags'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.json({ message: 'Job updated.', job });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job.' });
  }
};

// ─── DELETE /api/jobs/:id ─────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user._id,
    });
    if (!job) return res.status(404).json({ error: 'Job not found or unauthorized.' });

    // Clean up applications
    await Application.deleteMany({ jobId: req.params.id });

    res.json({ message: 'Job and all associated applications deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job.' });
  }
};

// ─── GET /api/jobs/:id/stats ──────────────────────────────────────────────────
exports.getJobStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { jobId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$finalScore' },
        },
      },
    ]);

    const totalApplicants = await Application.countDocuments({ jobId: req.params.id });
    const topScore = await Application.findOne({ jobId: req.params.id })
      .sort({ finalScore: -1 })
      .select('finalScore');

    res.json({ stats, totalApplicants, topScore: topScore?.finalScore || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get job stats.' });
  }
};
