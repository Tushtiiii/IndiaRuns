const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: String,
  title: String,
  startDate: String,
  endDate: String, // "Present" or date string
  duration: String, // e.g. "2 years 3 months"
  description: String,
  technologies: [String],
  achievements: [String],
  isCurrent: { type: Boolean, default: false },
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startYear: String,
  endYear: String,
  gpa: String,
  honors: String,
});

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  technologies: [String],
  role: String,
  impact: String,
  url: String,
  duration: String,
});

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  year: String,
  expiryYear: String,
  credentialId: String,
  url: String,
});

const candidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Raw resume text (for re-parsing if needed)
    resumeRawText: {
      type: String,
      select: false,
    },
    resumeFileName: String,
    resumeUploadedAt: Date,

    // Parsed profile
    headline: String, // e.g. "Senior MERN Developer with 5 years experience"
    summary: String,
    skills: [String],
    experience: [experienceSchema],
    education: [educationSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    achievements: [String],
    languages: [String],

    // Contact info (extracted from resume)
    phone: String,
    linkedIn: String,
    github: String,
    portfolio: String,
    location: String,

    // Computed fields
    totalExperienceYears: {
      type: Number,
      default: 0,
    },
    topDomains: [String], // e.g. ["Full Stack", "Cloud", "DevOps"]

    // Platform activity score (0-100)
    activityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    // Vector embedding for semantic search
    embeddings: {
      type: [Number],
      default: [],
      select: false,
    },

    // Processing flags
    profileComplete: {
      type: Boolean,
      default: false,
    },
    aiProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Note: userId index is already created by unique:true on the field definition above
candidateSchema.index({ skills: 1 });
candidateSchema.index({ totalExperienceYears: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
