const mongoose = require('mongoose');

const scoreBreakdownSchema = new mongoose.Schema({
  skillMatch: { type: Number, default: 0 },        // 0-100
  experienceMatch: { type: Number, default: 0 },   // 0-100
  projectRelevance: { type: Number, default: 0 },  // 0-100
  careerGrowth: { type: Number, default: 0 },      // 0-100
  certifications: { type: Number, default: 0 },    // 0-100
  softSkills: { type: Number, default: 0 },        // 0-100
  platformActivity: { type: Number, default: 0 },  // 0-100
  semanticSimilarity: { type: Number, default: 0 }, // raw cosine similarity 0-1
});

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'shortlisted', 'interview', 'offer', 'rejected', 'hired', 'withdrawn'],
      default: 'applied',
    },

    // Composite score (0–100)
    finalScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    scoreBreakdown: scoreBreakdownSchema,

    // LLM-generated insights
    aiInsights: {
      summary: String,           // Narrative paragraph about candidate fit
      strengths: [String],       // Bullet points
      concerns: [String],        // Bullet points
      recommendation: {
        type: String,
        enum: ['strong_yes', 'yes', 'maybe', 'no', 'strong_no', ''],
        default: '',
      },
      interviewFocus: [String],  // Suggested interview topics
    },

    // Matched / missing skills
    matchedSkills: [String],
    missingSkills: [String],

    // Ranking within this job (1 = best)
    rank: {
      type: Number,
      default: null,
    },

    // Recruiter notes
    recruiterNotes: String,
    isShortlisted: {
      type: Boolean,
      default: false,
    },

    // When AI was last run
    aiProcessedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, finalScore: -1 }); // For ranked lists
applicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
