/**
 * seedDemo.js  — run with:  node src/scripts/seedDemo.js
 *
 * Creates:
 *   Recruiter  →  demo.recruiter@talentai.dev  / Demo@1234
 *   Candidate  →  demo.candidate@talentai.dev  / Demo@1234
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User      = require('../models/User');
const Candidate = require('../models/Candidate');

const RECRUITER = {
  name:     'Sarah Mitchell',
  email:    'demo.recruiter@talentai.dev',
  password: 'Demo@1234',
  role:     'recruiter',
  avatar:   'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
};

const CANDIDATE = {
  name:     'Arjun Sharma',
  email:    'demo.candidate@talentai.dev',
  password: 'Demo@1234',
  role:     'candidate',
  avatar:   'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
};

const CANDIDATE_PROFILE = {
  headline: 'Senior Full-Stack Developer | React · Node.js · MongoDB | 5 Years',
  summary:
    'Results-driven full-stack developer with 5+ years of experience building scalable web applications. ' +
    'Strong background in React, Node.js, and cloud infrastructure. Passionate about clean code and developer experience.',
  skills: [
    'React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Redis',
    'AWS', 'Docker', 'GraphQL', 'REST APIs', 'Git', 'CI/CD',
    'Express.js', 'Next.js', 'Tailwind CSS', 'Jest', 'Python',
  ],
  totalExperienceYears: 5,
  topDomains: ['Full Stack Development', 'Cloud Infrastructure', 'API Design'],
  location: 'Bangalore, India',
  linkedIn: 'https://linkedin.com/in/arjunsharma-demo',
  github:   'https://github.com/arjunsharma-demo',
  activityScore: 78,
  profileComplete: true,
  aiProcessed: true,
  languages: ['English', 'Hindi'],

  education: [
    {
      institution: 'Indian Institute of Technology Bombay',
      degree: 'Bachelor of Technology',
      field: 'Computer Science & Engineering',
      startYear: '2016',
      endYear: '2020',
      gpa: '8.4/10',
    },
  ],

  experience: [
    {
      company: 'Flipkart',
      title: 'Senior Software Engineer',
      startDate: 'Jul 2022',
      endDate: 'Present',
      isCurrent: true,
      duration: '2 years',
      description:
        'Led development of the seller dashboard microservices handling 50K+ concurrent users. ' +
        'Reduced page load time by 42% through SSR optimization and Redis caching.',
      technologies: ['React', 'Node.js', 'Redis', 'MongoDB', 'AWS ECS'],
      achievements: [
        'Reduced API latency by 60% through query optimization',
        'Led a team of 4 engineers to deliver a major feature in 6 weeks',
        'Received "Engineer of the Quarter" award Q2 2023',
      ],
    },
    {
      company: 'Razorpay',
      title: 'Software Engineer',
      startDate: 'Aug 2020',
      endDate: 'Jun 2022',
      isCurrent: false,
      duration: '2 years',
      description:
        'Built and maintained payment gateway integrations for major banking partners. ' +
        'Developed real-time transaction monitoring dashboards.',
      technologies: ['React', 'Express.js', 'PostgreSQL', 'TypeScript', 'Docker'],
      achievements: [
        'Integrated 5 new banking APIs, increasing payment success rate by 15%',
        'Built transaction anomaly detection system reducing fraud by 23%',
      ],
    },
  ],

  projects: [
    {
      name: 'OpenTrack — Real-time Shipment Tracker',
      description:
        'Full-stack SaaS application for real-time logistics tracking. Handles 10K daily active users.',
      technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'AWS Lambda'],
      role: 'Solo Developer',
      impact: '4.8/5 stars on Product Hunt, 2,000+ users in first month',
      url: 'https://opentrack.demo',
      duration: '3 months',
    },
    {
      name: 'DevPulse — Developer Analytics CLI',
      description: 'Open-source CLI tool that provides GitHub contribution analytics and productivity insights.',
      technologies: ['Node.js', 'TypeScript', 'GitHub API'],
      role: 'Creator & Maintainer',
      impact: '1,200+ GitHub stars, 300+ weekly downloads on npm',
      url: 'https://github.com/arjunsharma-demo/devpulse',
      duration: '1 month',
    },
  ],

  certifications: [
    {
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      year: '2023',
      credentialId: 'AWS-SAA-C03-DEMO',
    },
    {
      name: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Coursera / Meta',
      year: '2022',
    },
  ],

  achievements: [
    'Winner – Flipkart Hack Day 2023 (out of 150 teams)',
    'Speaker – ReactConf India 2023: "Building Scalable Micro-Frontends"',
    'Open source contributor: 3 accepted PRs to Next.js',
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Recruiter ──────────────────────────────────────────────
    let recruiter = await User.findOne({ email: RECRUITER.email });
    if (recruiter) {
      console.log('ℹ️  Recruiter demo account already exists — skipping creation.');
    } else {
      recruiter = await User.create(RECRUITER);
      console.log(`✅ Recruiter created: ${recruiter.email}`);
    }

    // ── Candidate user ──────────────────────────────────────────
    let candidateUser = await User.findOne({ email: CANDIDATE.email });
    if (candidateUser) {
      console.log('ℹ️  Candidate demo account already exists — skipping creation.');
    } else {
      candidateUser = await User.create(CANDIDATE);
      console.log(`✅ Candidate user created: ${candidateUser.email}`);
    }

    // ── Candidate profile ───────────────────────────────────────
    const existingProfile = await Candidate.findOne({ userId: candidateUser._id });
    if (existingProfile) {
      console.log('ℹ️  Candidate profile already exists — skipping.');
    } else {
      await Candidate.create({ userId: candidateUser._id, ...CANDIDATE_PROFILE });
      console.log('✅ Candidate profile seeded with rich mock data');
    }

    console.log('\n🎉 Demo accounts ready!\n');
    console.log('  👤 Candidate  →  demo.candidate@talentai.dev  |  Demo@1234');
    console.log('  💼 Recruiter  →  demo.recruiter@talentai.dev  |  Demo@1234\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
