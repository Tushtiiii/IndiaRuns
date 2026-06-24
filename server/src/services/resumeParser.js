const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const { parseResume } = require('./aiService');

// ─── Multer Storage (in-memory) ───────────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are accepted.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// ─── Extract Raw Text from File Buffer ───────────────────────────────────────
const extractTextFromBuffer = async (buffer, mimetype, originalname) => {
  const ext = path.extname(originalname).toLowerCase();

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === '.txt') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${ext}`);
};

// ─── Full Resume Processing Pipeline ─────────────────────────────────────────
const processResume = async (file) => {
  // 1. Extract raw text
  const rawText = await extractTextFromBuffer(file.buffer, file.mimetype, file.originalname);

  if (!rawText || rawText.trim().length < 50) {
    throw new Error('Resume appears to be empty or could not be read.');
  }

  // 2. Use AI to parse structured data
  const parsed = await parseResume(rawText);

  return {
    rawText,
    parsed,
    fileName: file.originalname,
  };
};

module.exports = { upload, processResume, extractTextFromBuffer };
