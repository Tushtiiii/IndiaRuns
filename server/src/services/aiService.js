/**
 * AI Service — Provider-Agnostic Abstraction Layer
 *
 * Switch LLM by changing AI_PROVIDER in .env:
 *   AI_PROVIDER=gemini  → uses Google Gemini API
 *   AI_PROVIDER=openai  → uses OpenAI API
 *   AI_PROVIDER=groq    → uses Groq API (llama-3.3-70b-versatile)
 *
 * Switch embeddings by changing EMBEDDING_PROVIDER in .env:
 *   EMBEDDING_PROVIDER=voyage  → Voyage AI  (recommended — high quality)
 *   EMBEDDING_PROVIDER=openai  → OpenAI text-embedding-3-small
 *   EMBEDDING_PROVIDER=gemini  → Google text-embedding-004
 *   EMBEDDING_PROVIDER=auto    → follows AI_PROVIDER (legacy behaviour)
 *
 * No code changes required when switching.
 */

const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase();
const embeddingProvider = (process.env.EMBEDDING_PROVIDER || 'auto').toLowerCase();

// ─── LLM Provider Initialization ─────────────────────────────────────────────
let geminiClient, openaiClient, groqClient, geminiModel, geminiEmbeddingModel;

if (provider === 'gemini') {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  geminiEmbeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
} else if (provider === 'openai') {
  const OpenAI = require('openai');
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (provider === 'groq') {
  // Groq is OpenAI-compatible — no extra package needed
  const OpenAI = require('openai');
  groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

// ─── Voyage AI Embedding Client ───────────────────────────────────────────────
// Init whenever: (a) EMBEDDING_PROVIDER=voyage explicitly, or (b) a VOYAGE_API_KEY exists (auto mode)
let voyageClient = null;
if (process.env.VOYAGE_API_KEY && !process.env.VOYAGE_API_KEY.startsWith('your_')) {
  if (embeddingProvider === 'voyage' || embeddingProvider === 'auto') {
    const { VoyageAIClient } = require('voyageai');
    voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
    console.log('[aiService] Voyage AI embedding client initialised.');
  }
}

// Active Groq model (set GROQ_MODEL in .env to override)
const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';


// ─── Core: Generate Text ─────────────────────────────────────────────────────
const generateText = async (prompt) => {
  if (provider === 'gemini') {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } else if (provider === 'groq') {
    const completion = await groqClient.chat.completions.create({
      model: groqModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    return completion.choices[0].message.content;
  } else {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    return completion.choices[0].message.content;
  }
};

// ─── Core: Generate Embedding Vector ─────────────────────────────────────────
const generateEmbedding = async (text) => {
  // Truncate to avoid token limits (Voyage supports up to ~16k tokens)
  const truncated = text.slice(0, 10000);

  // ── 1. Voyage AI (highest quality, provider-agnostic) ─────────────────
  if (voyageClient) {
    try {
      const response = await voyageClient.embed({
        input: [truncated],
        model: 'voyage-3-lite',   // fast + cost-effective; swap to 'voyage-3' for max quality
      });
      return response.data[0].embedding; // 512-dimensional (voyage-3-lite) or 1024 (voyage-3)
    } catch (err) {
      console.error('[aiService] Voyage embedding failed, falling back:', err.message);
      // Fall through to provider-based fallbacks below
    }
  }

  // ── 2. Provider-native embeddings ────────────────────────────────────
  if (embeddingProvider === 'gemini' || (embeddingProvider === 'auto' && provider === 'gemini')) {
    const result = await geminiEmbeddingModel.embedContent(truncated);
    return result.embedding.values; // 768-dimensional
  }

  if (embeddingProvider === 'openai' || (embeddingProvider === 'auto' && provider === 'openai')) {
    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: truncated,
    });
    return response.data[0].embedding; // 1536-dimensional
  }

  // ── 3. Groq fallback: try OpenAI key, else warn ───────────────────────
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('your_')) {
    const OpenAI = require('openai');
    const fallback = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await fallback.embeddings.create({
      model: 'text-embedding-3-small',
      input: truncated,
    });
    return response.data[0].embedding;
  }

  console.warn('[aiService] No embedding provider available. Returning zero vector — semantic scoring disabled.');
  return new Array(1536).fill(0);
};

// ─── Parse Job Description ────────────────────────────────────────────────────
const parseJobDescription = async (rawText) => {
  const prompt = `
You are an expert HR analyst. Analyze the following job description and extract structured information.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Job Description:
---
${rawText.slice(0, 6000)}
---

Return this exact JSON structure:
{
  "title": "job title string",
  "company": "company name or empty string",
  "seniorityLevel": "one of: intern, junior, mid, senior, lead, principal, executive",
  "employmentType": "one of: full-time, part-time, contract, freelance",
  "industryDomain": "e.g. Software Development, Healthcare, Finance",
  "experienceRange": {
    "min": 0,
    "max": 0,
    "label": "e.g. 4-6 Years"
  },
  "requiredSkills": ["array", "of", "required", "technical", "skills"],
  "preferredSkills": ["array", "of", "nice-to-have", "skills"],
  "educationRequirements": ["e.g. Bachelor's in Computer Science"],
  "softSkills": ["e.g. Leadership", "Communication"],
  "responsibilities": ["key responsibility 1", "key responsibility 2"],
  "keywordsForMatching": ["important", "keywords", "for", "semantic", "search"]
}
`;

  const rawResponse = await generateText(prompt);

  // Clean response — remove any accidental markdown
  const cleaned = rawResponse
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
};

// ─── Parse Resume ─────────────────────────────────────────────────────────────
const parseResume = async (rawText) => {
  const prompt = `
You are an expert resume parser. Extract structured information from the resume below.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Resume:
---
${rawText.slice(0, 8000)}
---

Return this exact JSON structure:
{
  "name": "full name",
  "email": "email address or empty string",
  "phone": "phone number or empty string",
  "location": "city, state/country or empty string",
  "linkedIn": "linkedin URL or empty string",
  "github": "github URL or empty string",
  "portfolio": "portfolio URL or empty string",
  "headline": "one-line professional headline",
  "summary": "2-3 sentence professional summary",
  "totalExperienceYears": 0,
  "skills": ["array", "of", "all", "skills"],
  "topDomains": ["top 1-3 professional domains like Full Stack, Cloud, Data Science"],
  "experience": [
    {
      "company": "company name",
      "title": "job title",
      "startDate": "Mon YYYY or YYYY",
      "endDate": "Mon YYYY or Present",
      "duration": "X years Y months",
      "description": "brief role description",
      "technologies": ["tech1", "tech2"],
      "achievements": ["key achievement 1"],
      "isCurrent": false
    }
  ],
  "education": [
    {
      "institution": "university name",
      "degree": "e.g. Bachelor of Science",
      "field": "e.g. Computer Science",
      "startYear": "YYYY",
      "endYear": "YYYY",
      "gpa": "GPA or empty string",
      "honors": "honors or empty string"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "what it does",
      "technologies": ["tech1", "tech2"],
      "role": "your role",
      "impact": "impact or metrics",
      "url": "URL or empty string",
      "duration": "duration or empty string"
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "year": "YYYY",
      "expiryYear": "YYYY or empty string",
      "credentialId": "ID or empty string",
      "url": "URL or empty string"
    }
  ],
  "achievements": ["award or achievement 1"],
  "languages": ["English", "other languages"]
}
`;

  const rawResponse = await generateText(prompt);
  const cleaned = rawResponse
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
};

// ─── Generate Candidate AI Insights ──────────────────────────────────────────
const generateCandidateInsights = async (jobProfile, candidateProfile, scoreBreakdown) => {
  const prompt = `
You are a senior technical recruiter evaluating a candidate for a job position.
Provide a professional, insightful evaluation. Return ONLY valid JSON.

JOB:
Title: ${jobProfile.title}
Required Skills: ${(jobProfile.parsedProfile?.requiredSkills || []).join(', ')}
Experience Required: ${jobProfile.parsedProfile?.experienceRange?.label || 'Not specified'}
Domain: ${jobProfile.parsedProfile?.industryDomain || 'Not specified'}
Seniority: ${jobProfile.parsedProfile?.seniorityLevel || 'Not specified'}

CANDIDATE:
Name: ${candidateProfile.userId?.name || 'Candidate'}
Headline: ${candidateProfile.headline || ''}
Total Experience: ${candidateProfile.totalExperienceYears} years
Skills: ${(candidateProfile.skills || []).join(', ')}
Top Domains: ${(candidateProfile.topDomains || []).join(', ')}
Summary: ${candidateProfile.summary || ''}

SCORE BREAKDOWN:
- Skill Match: ${scoreBreakdown.skillMatch}/100
- Experience Match: ${scoreBreakdown.experienceMatch}/100
- Project Relevance: ${scoreBreakdown.projectRelevance}/100
- Career Growth: ${scoreBreakdown.careerGrowth}/100
- Certifications: ${scoreBreakdown.certifications}/100
- Soft Skills: ${scoreBreakdown.softSkills}/100
- Platform Activity: ${scoreBreakdown.platformActivity}/100
- Overall Score: ${scoreBreakdown.finalScore}/100

Return this exact JSON:
{
  "summary": "2-3 sentence professional narrative about this candidate's fit for the role",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "recommendation": "one of: strong_yes, yes, maybe, no, strong_no",
  "interviewFocus": ["topic to explore in interview 1", "topic 2", "topic 3"],
  "matchedSkills": ["skills from required list that candidate has"],
  "missingSkills": ["required skills the candidate lacks"]
}
`;

  const rawResponse = await generateText(prompt);
  const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

// ─── Generate Interview Questions ─────────────────────────────────────────────
const generateInterviewQuestions = async (jobProfile, difficulty = 'intermediate', count = 10) => {
  const prompt = `
You are an expert technical interviewer. Generate ${count} interview questions for this role.
Return ONLY valid JSON — no markdown.

Role: ${jobProfile.title}
Required Skills: ${(jobProfile.parsedProfile?.requiredSkills || []).join(', ')}
Seniority: ${jobProfile.parsedProfile?.seniorityLevel || 'mid'}
Domain: ${jobProfile.parsedProfile?.industryDomain || ''}
Difficulty: ${difficulty} (beginner | intermediate | advanced)

Return:
{
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "category": "technical | behavioral | situational | system-design",
      "difficulty": "${difficulty}",
      "expectedAnswer": "brief expected answer or key points",
      "followUp": "optional follow-up question"
    }
  ]
}
`;

  const rawResponse = await generateText(prompt);
  const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

// ─── AI Chat / RAG Query ──────────────────────────────────────────────────────
const answerRecruiterQuery = async (query, candidateContext) => {
  const contextText = candidateContext
    .slice(0, 5)
    .map(
      (c, i) =>
        `Candidate ${i + 1}: ${c.userId?.name || 'Unknown'} | Score: ${c.finalScore}/100 | Skills: ${c.skills?.join(', ')}`
    )
    .join('\n');

  const prompt = `
You are an AI assistant helping a recruiter analyze candidates for a job position.
Answer the recruiter's question based on the candidate data provided.
Be concise, helpful, and professional.

Recruiter Question: ${query}

Available Candidate Data:
${contextText}

Provide a helpful, specific answer:
`;

  return generateText(prompt);
};

// ─── Utility: Cosine Similarity ───────────────────────────────────────────────
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  // Guard: zero vectors → cosine is undefined; return 0 instead of NaN
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

module.exports = {
  generateText,
  generateEmbedding,
  parseJobDescription,
  parseResume,
  generateCandidateInsights,
  generateInterviewQuestions,
  answerRecruiterQuery,
  cosineSimilarity,
  activeProvider: provider,
};
