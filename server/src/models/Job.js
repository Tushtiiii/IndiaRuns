const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      default: 'Remote',
    },
    rawDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    // AI-parsed structured profile
    parsedProfile: {
      requiredSkills: [String],
      preferredSkills: [String],
      experienceRange: {
        min: Number,
        max: Number,
        label: String, // e.g. "4-6 Years"
      },
      educationRequirements: [String],
      softSkills: [String],
      responsibilities: [String],
      industryDomain: String,
      seniorityLevel: {
        type: String,
        enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive', ''],
        default: '',
      },
      employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'freelance', ''],
        default: 'full-time',
      },
    },
    // Vector embedding for semantic search (stored as flat array)
    embeddings: {
      type: [Number],
      default: [],
      select: false, // Don't return by default (large array)
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'archived'],
      default: 'active',
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
    shortlistedCount: {
      type: Number,
      default: 0,
    },
    aiProcessed: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for text search
jobSchema.index({ title: 'text', rawDescription: 'text' });
jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
