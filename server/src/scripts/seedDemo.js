/**
 * seedDemo.js — run with:  npm run seed
 *
 * Seeds MongoDB with:
 *   - 1 Recruiter  → demo.recruiter@talentai.dev  / Demo@1234
 *   - 6 Candidates → demo.candidate1@talentai.dev … demo.candidate6@talentai.dev  / Demo@1234
 *   - 5 Jobs       (owned by the recruiter)
 *   - Applications linking candidates to jobs
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User        = require('../models/User');
const Candidate   = require('../models/Candidate');
const Job         = require('../models/Job');
const Application = require('../models/Application');

// ─── Users ────────────────────────────────────────────────────────────────────
const RECRUITER = {
  name: 'Sarah Mitchell', email: 'demo.recruiter@talentai.dev',
  password: 'Demo@1234', role: 'recruiter',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
};

const CANDIDATES_RAW = [
  { name: 'Arjun Sharma',    email: 'demo.candidate1@talentai.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun' },
  { name: 'Priya Nair',      email: 'demo.candidate2@talentai.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
  { name: 'Rahul Gupta',     email: 'demo.candidate3@talentai.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul' },
  { name: 'Sneha Patel',     email: 'demo.candidate4@talentai.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha' },
  { name: 'Vikram Singh',    email: 'demo.candidate5@talentai.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram' },
  { name: 'Ananya Krishnan', email: 'demo.candidate6@talentai.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya' },
];

// ─── Candidate Profiles ───────────────────────────────────────────────────────
function buildProfiles(userIds) {
  return [
    {
      userId: userIds[0],
      headline: 'Senior Full-Stack Developer | React · Node.js · AWS | 5 Years',
      summary: 'Results-driven full-stack developer with 5+ years building scalable web apps. Expert in React, Node.js, and cloud infrastructure.',
      skills: ['React','Node.js','TypeScript','MongoDB','PostgreSQL','Redis','AWS','Docker','GraphQL','REST APIs','Next.js','Jest'],
      totalExperienceYears: 5, topDomains: ['Full Stack','Cloud','API Design'],
      location: 'Bangalore, India', linkedIn: 'https://linkedin.com/in/arjunsharma-demo',
      github: 'https://github.com/arjunsharma-demo', activityScore: 88,
      profileComplete: true, aiProcessed: true, languages: ['English','Hindi'],
      education: [{ institution: 'IIT Bombay', degree: 'B.Tech', field: 'Computer Science', startYear: '2016', endYear: '2020', gpa: '8.4/10' }],
      experience: [
        { company: 'Flipkart', title: 'Senior Software Engineer', startDate: 'Jul 2022', endDate: 'Present', isCurrent: true, duration: '2 years',
          technologies: ['React','Node.js','Redis','MongoDB','AWS ECS'],
          achievements: ['Reduced API latency by 60%', 'Led a team of 4 engineers', '"Engineer of the Quarter" Q2 2023'] },
        { company: 'Razorpay', title: 'Software Engineer', startDate: 'Aug 2020', endDate: 'Jun 2022', duration: '2 years',
          technologies: ['React','Express.js','PostgreSQL','TypeScript','Docker'],
          achievements: ['Integrated 5 banking APIs', 'Reduced fraud by 23%'] },
      ],
      projects: [
        { name: 'OpenTrack', description: 'Real-time logistics SaaS — 10K DAU', technologies: ['React','Node.js','Socket.io','AWS Lambda'], role: 'Solo Dev', impact: '2K users in first month' },
      ],
      certifications: [{ name: 'AWS Solutions Architect – Associate', issuer: 'Amazon Web Services', year: '2023' }],
      achievements: ['Winner – Flipkart Hack Day 2023','Speaker – ReactConf India 2023'],
    },
    {
      userId: userIds[1],
      headline: 'ML Engineer | Python · PyTorch · LLMs | 4 Years',
      summary: 'Machine learning engineer specializing in NLP, LLM fine-tuning, and deploying production ML pipelines at scale.',
      skills: ['Python','PyTorch','TensorFlow','Scikit-learn','LangChain','HuggingFace','FastAPI','Docker','Kubernetes','Spark','SQL','GCP'],
      totalExperienceYears: 4, topDomains: ['Machine Learning','NLP','MLOps'],
      location: 'Hyderabad, India', linkedIn: 'https://linkedin.com/in/priyanair-demo',
      github: 'https://github.com/priyanair-demo', activityScore: 82,
      profileComplete: true, aiProcessed: true, languages: ['English','Malayalam','Hindi'],
      education: [{ institution: 'BITS Pilani', degree: 'B.E.', field: 'Computer Science', startYear: '2017', endYear: '2021', gpa: '9.1/10' }],
      experience: [
        { company: 'Google', title: 'ML Engineer II', startDate: 'Jun 2022', endDate: 'Present', isCurrent: true, duration: '2 years',
          technologies: ['Python','TensorFlow','GCP','Vertex AI'],
          achievements: ['Fine-tuned LLM reducing hallucinations by 35%','Built ML pipeline processing 1M records/day'] },
        { company: 'Myntra', title: 'Data Scientist', startDate: 'Aug 2021', endDate: 'May 2022', duration: '10 months',
          technologies: ['Python','Spark','SQL','Scikit-learn'],
          achievements: ['Built recommendation engine boosting CTR by 18%'] },
      ],
      projects: [
        { name: 'IndiaChat', description: 'Multilingual chatbot for 10 Indian languages using mBERT', technologies: ['Python','HuggingFace','FastAPI'], role: 'Lead Engineer', impact: '50K monthly users' },
      ],
      certifications: [{ name: 'Google Professional ML Engineer', issuer: 'Google', year: '2023' }],
      achievements: ['Published NLP paper at ACL 2023','NLP track winner – Google DevFest 2022'],
    },
    {
      userId: userIds[2],
      headline: 'DevOps & Platform Engineer | Kubernetes · Terraform · CI/CD | 6 Years',
      summary: 'Platform engineer with 6 years designing and maintaining cloud-native infrastructure for fintech and e-commerce at scale.',
      skills: ['Kubernetes','Terraform','AWS','Azure','Docker','Helm','Jenkins','GitHub Actions','Python','Go','Prometheus','Grafana','ArgoCD'],
      totalExperienceYears: 6, topDomains: ['DevOps','Cloud Infrastructure','SRE'],
      location: 'Pune, India', github: 'https://github.com/rahulgupta-demo', activityScore: 75,
      profileComplete: true, aiProcessed: true, languages: ['English','Hindi'],
      education: [{ institution: 'VIT Vellore', degree: 'B.Tech', field: 'Information Technology', startYear: '2014', endYear: '2018' }],
      experience: [
        { company: 'Paytm', title: 'Lead DevOps Engineer', startDate: 'Jan 2021', endDate: 'Present', isCurrent: true, duration: '3.5 years',
          technologies: ['Kubernetes','Terraform','AWS','Prometheus'],
          achievements: ['Achieved 99.99% uptime across 200+ microservices','Cut infrastructure cost by 30% with spot instances'] },
        { company: 'ThoughtWorks', title: 'DevOps Engineer', startDate: 'Jun 2018', endDate: 'Dec 2020', duration: '2.5 years',
          technologies: ['Docker','Jenkins','Azure','Helm'],
          achievements: ['Reduced deployment time from 2h to 8 min','Implemented GitOps for 15 client projects'] },
      ],
      certifications: [
        { name: 'CKA – Certified Kubernetes Administrator', issuer: 'CNCF', year: '2022' },
        { name: 'AWS DevOps Professional', issuer: 'Amazon Web Services', year: '2021' },
      ],
      achievements: ['KubeCon speaker 2023','Open-source contributor to ArgoCD'],
    },
    {
      userId: userIds[3],
      headline: 'iOS & Android Engineer | Swift · Kotlin · Flutter | 3 Years',
      summary: 'Mobile developer who has shipped 6 production apps with combined 500K+ downloads across iOS and Android.',
      skills: ['Swift','Kotlin','Flutter','Dart','React Native','Firebase','Xcode','Android Studio','REST APIs','CoreData','Room DB','CI/CD'],
      totalExperienceYears: 3, topDomains: ['Mobile Development','iOS','Android'],
      location: 'Mumbai, India', github: 'https://github.com/snehapatel-demo', activityScore: 70,
      profileComplete: true, aiProcessed: true, languages: ['English','Gujarati','Hindi'],
      education: [{ institution: 'DAIICT', degree: 'B.Tech', field: 'ICT', startYear: '2018', endYear: '2022', gpa: '8.8/10' }],
      experience: [
        { company: 'CRED', title: 'iOS Developer', startDate: 'Jul 2022', endDate: 'Present', isCurrent: true, duration: '2 years',
          technologies: ['Swift','SwiftUI','Combine','CoreData'],
          achievements: ['Shipped 3 major feature releases to 5M+ users','Reduced crash rate from 1.2% to 0.08%'] },
        { company: 'Internshala', title: 'Mobile Developer Intern', startDate: 'Jan 2022', endDate: 'Jun 2022', duration: '6 months',
          technologies: ['Flutter','Dart','Firebase'],
          achievements: ['Built cross-platform internship alerts feature used by 200K students'] },
      ],
      projects: [
        { name: 'FitTrack', description: 'iOS fitness app with HealthKit integration', technologies: ['Swift','HealthKit','Firebase'], role: 'Solo Developer', impact: '4.7 App Store rating, 15K downloads' },
      ],
      achievements: ['WWDC 2023 Scholarship recipient','Runner-up – Apple Swift Student Challenge'],
    },
    {
      userId: userIds[4],
      headline: 'Backend Engineer | Java · Spring Boot · Microservices | 7 Years',
      summary: 'Senior backend engineer with 7 years delivering high-throughput Java microservices in banking and insurance domains.',
      skills: ['Java','Spring Boot','Microservices','Kafka','PostgreSQL','MySQL','Redis','Docker','Kubernetes','JUnit','Maven','gRPC','REST'],
      totalExperienceYears: 7, topDomains: ['Backend Engineering','Fintech','Microservices'],
      location: 'Chennai, India', linkedIn: 'https://linkedin.com/in/vikramsingh-demo', activityScore: 73,
      profileComplete: true, aiProcessed: true, languages: ['English','Hindi','Tamil'],
      education: [{ institution: 'NIT Trichy', degree: 'B.Tech', field: 'Computer Science', startYear: '2013', endYear: '2017', gpa: '8.7/10' }],
      experience: [
        { company: 'HDFC Bank', title: 'Principal Engineer', startDate: 'Feb 2020', endDate: 'Present', isCurrent: true, duration: '4.5 years',
          technologies: ['Java','Spring Boot','Kafka','PostgreSQL','Kubernetes'],
          achievements: ['Architected payment processing system handling ₹500Cr/day','Reduced transaction failure rate from 2.1% to 0.3%'] },
        { company: 'Wipro', title: 'Senior Java Developer', startDate: 'Jul 2017', endDate: 'Jan 2020', duration: '2.5 years',
          technologies: ['Java','Spring MVC','MySQL','JUnit'],
          achievements: ['Delivered insurance claim automation saving 3000 man-hours/month'] },
      ],
      certifications: [{ name: 'Oracle Certified Professional Java SE 17', issuer: 'Oracle', year: '2022' }],
      achievements: ['Patent filed for fraud detection algorithm','Internal Hackathon Winner HDFC 2022'],
    },
    {
      userId: userIds[5],
      headline: 'Frontend Engineer | React · Vue · Web Performance | 3 Years',
      summary: 'Frontend specialist obsessed with pixel-perfect UIs and Core Web Vitals. Built dashboards used by Fortune 500 clients.',
      skills: ['React','Vue.js','TypeScript','JavaScript','CSS3','Sass','Webpack','Vite','Figma','Storybook','Jest','Cypress','Accessibility'],
      totalExperienceYears: 3, topDomains: ['Frontend Engineering','UI/UX','Web Performance'],
      location: 'Delhi, India', github: 'https://github.com/ananyakrishnan-demo', portfolio: 'https://ananyakrishnan.dev', activityScore: 85,
      profileComplete: true, aiProcessed: true, languages: ['English','Malayalam'],
      education: [{ institution: 'Delhi Technological University', degree: 'B.Tech', field: 'Software Engineering', startYear: '2018', endYear: '2022', gpa: '9.0/10' }],
      experience: [
        { company: 'Microsoft', title: 'SDE I – Frontend', startDate: 'Aug 2022', endDate: 'Present', isCurrent: true, duration: '2 years',
          technologies: ['React','TypeScript','Azure DevOps','Storybook'],
          achievements: ['Improved Lighthouse score from 52 to 96 across product suite','Built reusable component library used by 8 teams'] },
        { company: 'Zomato', title: 'Frontend Developer Intern', startDate: 'Jan 2022', endDate: 'Jul 2022', duration: '7 months',
          technologies: ['React','Redux','CSS Modules'],
          achievements: ['Reduced homepage TTI by 1.8 seconds through lazy loading'] },
      ],
      projects: [
        { name: 'UILens', description: 'Open-source accessibility checker Chrome extension', technologies: ['React','TypeScript','Chrome Extensions API'], role: 'Creator', impact: '800+ installs on Chrome Web Store' },
      ],
      achievements: ['Google Developer Expert nominee 2024','Speaker at JSConf India 2023'],
    },
  ];
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
function buildJobs(recruiterId) {
  return [
    {
      title: 'Senior Full-Stack Engineer',
      company: 'TalentAI',
      location: 'Bangalore, India (Hybrid)',
      rawDescription: 'We are looking for a Senior Full-Stack Engineer to join our product team. You will design, build, and ship features across our React frontend and Node.js backend. Experience with MongoDB, AWS, and TypeScript is required. 4-6 years of experience preferred.',
      parsedProfile: {
        requiredSkills: ['React','Node.js','TypeScript','MongoDB','AWS'],
        preferredSkills: ['GraphQL','Redis','Docker','Next.js'],
        experienceRange: { min: 4, max: 6, label: '4-6 Years' },
        educationRequirements: ['B.Tech/B.E. in CS or equivalent'],
        softSkills: ['Communication','Ownership','Team Collaboration'],
        responsibilities: ['Build and ship product features end-to-end','Code reviews and mentoring juniors','Architect scalable APIs'],
        industryDomain: 'SaaS / HR Tech',
        seniorityLevel: 'senior',
        employmentType: 'full-time',
      },
      recruiter: recruiterId, status: 'active', aiProcessed: true,
      applicantCount: 4, shortlistedCount: 2,
      tags: ['fullstack','react','nodejs','remote-friendly'],
    },
    {
      title: 'Machine Learning Engineer – NLP',
      company: 'TalentAI',
      location: 'Remote',
      rawDescription: 'Join our AI team to build and fine-tune large language models for resume parsing and job matching. You will work with PyTorch, HuggingFace, and LangChain. Strong Python skills and experience with production ML pipelines required. 3-5 years experience.',
      parsedProfile: {
        requiredSkills: ['Python','PyTorch','HuggingFace','LangChain','NLP'],
        preferredSkills: ['GCP','MLflow','Kubernetes','FastAPI'],
        experienceRange: { min: 3, max: 5, label: '3-5 Years' },
        educationRequirements: ['M.Tech/M.S. in ML/AI preferred, B.Tech considered'],
        softSkills: ['Research mindset','Problem Solving','Curiosity'],
        responsibilities: ['Fine-tune LLMs for domain-specific tasks','Build end-to-end ML pipelines','Monitor model performance in production'],
        industryDomain: 'AI / ML',
        seniorityLevel: 'mid',
        employmentType: 'full-time',
      },
      recruiter: recruiterId, status: 'active', aiProcessed: true,
      applicantCount: 3, shortlistedCount: 1,
      tags: ['ml','nlp','python','llm','remote'],
    },
    {
      title: 'Lead DevOps / Platform Engineer',
      company: 'TalentAI',
      location: 'Pune, India (On-site)',
      rawDescription: 'We need a DevOps Lead to own our cloud infrastructure on AWS. You will manage Kubernetes clusters, Terraform modules, and CI/CD pipelines. Strong expertise in Helm, ArgoCD, and Prometheus required. 5+ years experience.',
      parsedProfile: {
        requiredSkills: ['Kubernetes','Terraform','AWS','Helm','Docker'],
        preferredSkills: ['ArgoCD','Prometheus','Grafana','Python','Go'],
        experienceRange: { min: 5, max: 9, label: '5+ Years' },
        educationRequirements: ['B.Tech/B.E. in any engineering discipline'],
        softSkills: ['Leadership','On-call ownership','Documentation'],
        responsibilities: ['Own and scale Kubernetes clusters','Define IaC standards with Terraform','Implement GitOps workflows'],
        industryDomain: 'SaaS / Cloud',
        seniorityLevel: 'lead',
        employmentType: 'full-time',
      },
      recruiter: recruiterId, status: 'active', aiProcessed: true,
      applicantCount: 2, shortlistedCount: 1,
      tags: ['devops','kubernetes','terraform','aws','platform'],
    },
    {
      title: 'Mobile Engineer (iOS / Flutter)',
      company: 'TalentAI',
      location: 'Mumbai, India (Hybrid)',
      rawDescription: 'Build our mobile apps on iOS and potentially cross-platform with Flutter. You should be proficient in Swift or Kotlin and ideally have experience with Flutter/Dart. Ship features to millions of users in fintech or consumer apps. 2-4 years experience.',
      parsedProfile: {
        requiredSkills: ['Swift','iOS','Flutter','Dart'],
        preferredSkills: ['Kotlin','Firebase','CI/CD','TestFlight'],
        experienceRange: { min: 2, max: 4, label: '2-4 Years' },
        educationRequirements: ['B.Tech/B.E. in CS or equivalent'],
        softSkills: ['User empathy','Attention to detail','Initiative'],
        responsibilities: ['Ship iOS features to App Store','Maintain test coverage above 80%','Collaborate with design team on UX'],
        industryDomain: 'Mobile / Consumer Tech',
        seniorityLevel: 'mid',
        employmentType: 'full-time',
      },
      recruiter: recruiterId, status: 'active', aiProcessed: true,
      applicantCount: 2, shortlistedCount: 1,
      tags: ['mobile','ios','swift','flutter','consumer'],
    },
    {
      title: 'Frontend Engineer – React',
      company: 'TalentAI',
      location: 'Remote (India)',
      rawDescription: 'We want a passionate frontend engineer to craft beautiful, performant UIs with React and TypeScript. You will own the component library, write Storybook stories, and champion web accessibility. 2-4 years experience with strong CSS skills.',
      parsedProfile: {
        requiredSkills: ['React','TypeScript','JavaScript','CSS3','Accessibility'],
        preferredSkills: ['Vue.js','Storybook','Cypress','Figma','Vite'],
        experienceRange: { min: 2, max: 4, label: '2-4 Years' },
        educationRequirements: ['B.Tech/B.E. in CS or equivalent'],
        softSkills: ['Design sensibility','Attention to detail','Collaboration'],
        responsibilities: ['Build pixel-perfect UI components','Maintain design system and Storybook','Ensure WCAG 2.1 AA compliance'],
        industryDomain: 'SaaS / HR Tech',
        seniorityLevel: 'mid',
        employmentType: 'full-time',
      },
      recruiter: recruiterId, status: 'active', aiProcessed: true,
      applicantCount: 3, shortlistedCount: 2,
      tags: ['frontend','react','typescript','remote','ui'],
    },
  ];
}

// ─── Main Seed ────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── Recruiter ──────────────────────────────────────────────────────────────
    let recruiter = await User.findOne({ email: RECRUITER.email });
    if (recruiter) {
      console.log(`ℹ️  Recruiter already exists (${recruiter.email})`);
    } else {
      recruiter = await User.create(RECRUITER);
      console.log(`✅ Recruiter created: ${recruiter.email}`);
    }

    // ── Candidate Users ────────────────────────────────────────────────────────
    const candidateUserIds = [];
    for (const raw of CANDIDATES_RAW) {
      let u = await User.findOne({ email: raw.email });
      if (u) {
        console.log(`ℹ️  Candidate user already exists: ${u.email}`);
      } else {
        u = await User.create({ ...raw, password: 'Demo@1234', role: 'candidate' });
        console.log(`✅ Candidate user created: ${u.email}`);
      }
      candidateUserIds.push(u._id);
    }

    // ── Candidate Profiles ─────────────────────────────────────────────────────
    const profiles = buildProfiles(candidateUserIds);
    const candidateIds = [];
    for (const profile of profiles) {
      let c = await Candidate.findOne({ userId: profile.userId });
      if (c) {
        console.log(`ℹ️  Candidate profile already exists for userId ${profile.userId}`);
      } else {
        c = await Candidate.create(profile);
        console.log(`✅ Candidate profile seeded: ${profile.headline.split('|')[0].trim()}`);
      }
      candidateIds.push(c._id);
    }

    // ── Jobs ───────────────────────────────────────────────────────────────────
    const jobs = buildJobs(recruiter._id);
    const jobIds = [];
    for (const jobData of jobs) {
      let j = await Job.findOne({ title: jobData.title, recruiter: recruiter._id });
      if (j) {
        console.log(`ℹ️  Job already exists: "${j.title}"`);
      } else {
        j = await Job.create(jobData);
        console.log(`✅ Job created: "${j.title}"`);
      }
      jobIds.push(j._id);
    }

    // ── Applications ───────────────────────────────────────────────────────────
    // Map: [candidateIdx, jobIdx, status, finalScore]
    const appMap = [
      [0, 0, 'shortlisted', 87], [0, 1, 'applied', 72],
      [1, 1, 'shortlisted', 91], [1, 0, 'applied', 65],
      [2, 2, 'shortlisted', 84], [2, 0, 'applied', 58],
      [3, 3, 'shortlisted', 79], [3, 4, 'applied', 60],
      [4, 0, 'applied', 73],
      [5, 4, 'shortlisted', 93], [5, 0, 'applied', 68],
    ];

    let appCreated = 0;
    for (const [ci, ji, status, finalScore] of appMap) {
      const existing = await Application.findOne({ candidateId: candidateIds[ci], jobId: jobIds[ji] });
      if (!existing) {
        await Application.create({ candidateId: candidateIds[ci], jobId: jobIds[ji], status, finalScore });
        appCreated++;
      }
    }
    console.log(`✅ ${appCreated} applications seeded`);

    // ─── Summary ───────────────────────────────────────────────────────────────
    console.log('\n🎉 Demo data ready!\n');
    console.log('  💼 Recruiter login:');
    console.log('     Email:    demo.recruiter@talentai.dev');
    console.log('     Password: Demo@1234\n');
    console.log('  👤 Candidate logins (all password: Demo@1234):');
    CANDIDATES_RAW.forEach((c, i) => {
      console.log(`     [${i + 1}] ${c.name.padEnd(18)} ${c.email}`);
    });
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    if (err.stack) console.error(err.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
