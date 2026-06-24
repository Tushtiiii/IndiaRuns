/**
 * Ranking Engine
 * Implements the hybrid scoring formula:
 * Score = (0.30 × skillMatch) + (0.25 × experienceMatch) + (0.15 × projectRelevance)
 *       + (0.10 × careerGrowth) + (0.05 × certifications) + (0.10 × softSkills)
 *       + (0.05 × platformActivity)
 */

const { cosineSimilarity } = require('./aiService');

const WEIGHTS = {
  skillMatch: 0.30,
  experienceMatch: 0.25,
  projectRelevance: 0.15,
  careerGrowth: 0.10,
  certifications: 0.05,
  softSkills: 0.10,
  platformActivity: 0.05,
};

// ─── Individual Scoring Functions ─────────────────────────────────────────────

/**
 * Skill Match (0–100)
 * Compares required job skills against candidate skills
 */
const scoreSkillMatch = (jobProfile, candidate) => {
  const requiredSkills = (jobProfile.parsedProfile?.requiredSkills || []).map((s) =>
    s.toLowerCase().trim()
  );
  const preferredSkills = (jobProfile.parsedProfile?.preferredSkills || []).map((s) =>
    s.toLowerCase().trim()
  );
  const candidateSkills = (candidate.skills || []).map((s) => s.toLowerCase().trim());

  if (requiredSkills.length === 0) return 70; // No skills listed → neutral score

  // Required skills match
  const requiredMatched = requiredSkills.filter((skill) =>
    candidateSkills.some((cs) => cs.includes(skill) || skill.includes(cs))
  ).length;
  const requiredScore = (requiredMatched / requiredSkills.length) * 100;

  // Preferred skills bonus (up to 20 bonus points)
  let preferredBonus = 0;
  if (preferredSkills.length > 0) {
    const preferredMatched = preferredSkills.filter((skill) =>
      candidateSkills.some((cs) => cs.includes(skill) || skill.includes(cs))
    ).length;
    preferredBonus = (preferredMatched / preferredSkills.length) * 20;
  }

  return Math.min(100, Math.round(requiredScore * 0.85 + preferredBonus));
};

/**
 * Experience Match (0–100)
 * Compares required experience range against candidate's total years
 */
const scoreExperienceMatch = (jobProfile, candidate) => {
  const minExp = jobProfile.parsedProfile?.experienceRange?.min || 0;
  const maxExp = jobProfile.parsedProfile?.experienceRange?.max || 10;
  const candidateYears = candidate.totalExperienceYears || 0;

  if (candidateYears >= minExp && candidateYears <= maxExp) return 100;

  // Under-experienced
  if (candidateYears < minExp) {
    const gap = minExp - candidateYears;
    return Math.max(0, Math.round(100 - gap * 20)); // -20 per year short
  }

  // Over-experienced (slight penalty — overqualified)
  const excess = candidateYears - maxExp;
  return Math.max(60, Math.round(100 - excess * 5)); // -5 per year over (max penalty 40)
};

/**
 * Project Relevance (0–100)
 * Checks if candidate projects use technologies mentioned in the job
 */
const scoreProjectRelevance = (jobProfile, candidate) => {
  const jobTechs = [
    ...(jobProfile.parsedProfile?.requiredSkills || []),
    ...(jobProfile.parsedProfile?.preferredSkills || []),
  ].map((s) => s.toLowerCase());

  const projects = candidate.projects || [];
  if (projects.length === 0) return 30; // No projects listed

  let relevantProjects = 0;
  for (const project of projects) {
    const projectTechs = (project.technologies || []).map((t) => t.toLowerCase());
    const match = projectTechs.some((pt) => jobTechs.some((jt) => pt.includes(jt) || jt.includes(pt)));
    if (match) relevantProjects++;
  }

  const relevanceRatio = relevantProjects / projects.length;
  return Math.round(relevanceRatio * 100);
};

/**
 * Career Growth (0–100)
 * Rewards progressive role advancement
 */
const scoreCareerGrowth = (candidate) => {
  const experience = candidate.experience || [];
  if (experience.length <= 1) return 50; // Can't assess growth with 0-1 jobs

  // Heuristic: Look for title progression (junior → mid → senior → lead)
  const seniorityKeywords = ['intern', 'junior', 'associate', 'mid', 'senior', 'lead', 'principal', 'head', 'director', 'vp', 'cto'];
  
  const ranks = experience.map((exp) => {
    const title = (exp.title || '').toLowerCase();
    for (let i = 0; i < seniorityKeywords.length; i++) {
      if (title.includes(seniorityKeywords[i])) return i;
    }
    return 3; // Default mid-level
  });

  // Check if seniority generally increased over time
  const hasProgression = ranks.some((rank, i) => i > 0 && rank > ranks[i - 1]);
  const latestSeniority = ranks[0] || 3; // Most recent first

  let score = 50;
  if (hasProgression) score += 30;
  score += Math.min(20, latestSeniority * 3); // Reward higher seniority

  return Math.min(100, score);
};

/**
 * Certifications (0–100)
 * Rewards relevant certifications
 */
const scoreCertifications = (jobProfile, candidate) => {
  const certs = candidate.certifications || [];
  if (certs.length === 0) return 20;

  const jobDomain = (jobProfile.parsedProfile?.industryDomain || '').toLowerCase();
  const jobSkills = [
    ...(jobProfile.parsedProfile?.requiredSkills || []),
    ...(jobProfile.parsedProfile?.preferredSkills || []),
  ].map((s) => s.toLowerCase());

  let relevantCerts = 0;
  for (const cert of certs) {
    const certName = (cert.name + ' ' + cert.issuer).toLowerCase();
    const isRelevant = jobSkills.some((skill) => certName.includes(skill)) ||
      certName.includes(jobDomain);
    if (isRelevant) relevantCerts++;
  }

  const baseScore = Math.min(60, certs.length * 15); // Up to 60 for having certs
  const relevanceBonus = Math.min(40, relevantCerts * 20);
  return Math.min(100, baseScore + relevanceBonus);
};

/**
 * Soft Skills (0–100)
 * Matches soft skills from resume against job requirements
 */
const scoreSoftSkills = (jobProfile, candidate) => {
  const requiredSoftSkills = (jobProfile.parsedProfile?.softSkills || []).map((s) =>
    s.toLowerCase()
  );
  const candidateSkills = (candidate.skills || []).map((s) => s.toLowerCase());
  const candidateSummary = (candidate.summary || '').toLowerCase();

  if (requiredSoftSkills.length === 0) return 65; // Neutral when not specified

  const matched = requiredSoftSkills.filter(
    (skill) =>
      candidateSkills.some((cs) => cs.includes(skill)) ||
      candidateSummary.includes(skill)
  ).length;

  return Math.round((matched / requiredSoftSkills.length) * 100);
};

// ─── Main Ranking Function ────────────────────────────────────────────────────

/**
 * Score a single candidate against a job posting
 * @param {Object} job - Job document from MongoDB
 * @param {Object} candidate - Candidate document from MongoDB
 * @param {number[]} jobEmbeddings - Pre-fetched job embedding vector
 * @param {number[]} candidateEmbeddings - Pre-fetched candidate embedding vector
 * @returns {Object} - Score breakdown + finalScore
 */
const scoreCandidate = (job, candidate, jobEmbeddings = [], candidateEmbeddings = []) => {
  const skillMatch = scoreSkillMatch(job, candidate);
  const experienceMatch = scoreExperienceMatch(job, candidate);
  const projectRelevance = scoreProjectRelevance(job, candidate);
  const careerGrowth = scoreCareerGrowth(candidate);
  const certifications = scoreCertifications(job, candidate);
  const softSkills = scoreSoftSkills(job, candidate);
  const platformActivity = Math.min(100, candidate.activityScore || 50);

  // Semantic similarity from embeddings (0-1 → 0-100)
  const semanticSimilarity = cosineSimilarity(jobEmbeddings, candidateEmbeddings);
  const semanticScore = Math.round(semanticSimilarity * 100);

  // Weighted formula
  const weightedScore =
    WEIGHTS.skillMatch * skillMatch +
    WEIGHTS.experienceMatch * experienceMatch +
    WEIGHTS.projectRelevance * projectRelevance +
    WEIGHTS.careerGrowth * careerGrowth +
    WEIGHTS.certifications * certifications +
    WEIGHTS.softSkills * softSkills +
    WEIGHTS.platformActivity * platformActivity;

  // Blend weighted score with semantic similarity (80% weighted, 20% semantic)
  const finalScore = Math.round(weightedScore * 0.80 + semanticScore * 0.20);

  return {
    skillMatch: Math.round(skillMatch),
    experienceMatch: Math.round(experienceMatch),
    projectRelevance: Math.round(projectRelevance),
    careerGrowth: Math.round(careerGrowth),
    certifications: Math.round(certifications),
    softSkills: Math.round(softSkills),
    platformActivity: Math.round(platformActivity),
    semanticSimilarity: parseFloat(semanticSimilarity.toFixed(4)),
    finalScore: Math.min(100, Math.max(0, finalScore)),
  };
};

/**
 * Rank multiple candidates against a job
 * Returns array sorted by finalScore descending, with rank assigned
 */
const rankCandidates = (job, candidatesWithEmbeddings, jobEmbeddings) => {
  const scored = candidatesWithEmbeddings.map(({ candidate, embeddings }) => {
    const scores = scoreCandidate(job, candidate, jobEmbeddings, embeddings);
    return { candidate, scores };
  });

  // Sort descending by finalScore
  scored.sort((a, b) => b.scores.finalScore - a.scores.finalScore);

  // Assign ranks
  return scored.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
};

module.exports = {
  scoreCandidate,
  rankCandidates,
  WEIGHTS,
};
