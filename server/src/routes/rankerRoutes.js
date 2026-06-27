const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const { analyzeResumes, parseJD, exportRankedResults } = require('../controllers/rankerController');

// ─── Multer: accept both JD file and candidate list file ─────────────────────
const storage = multer.memoryStorage();

// JD files: PDF / DOCX / TXT
const jdFilter = (req, file, cb) => {
  if (file.fieldname === 'jdFile') {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) return cb(null, true);
    return cb(new Error('JD file must be PDF, DOCX, or TXT.'), false);
  }
  if (file.fieldname === 'candidatesFile') {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.json', '.jsonl'].includes(ext)) return cb(null, true);
    return cb(new Error('Candidates file must be .json or .jsonl.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max per file
  fileFilter: jdFilter,
});

// Accept two named fields: jdFile (1 file) and candidatesFile (1 file)
const multiUpload = upload.fields([
  { name: 'jdFile', maxCount: 1 },
  { name: 'candidatesFile', maxCount: 1 },
]);

// Single-file upload for parse-jd preview (only needs the JD)
const singleJD = upload.fields([{ name: 'jdFile', maxCount: 1 }]);

// ─── Routes ───────────────────────────────────────────────────────────────────
router.use(protect);
router.use(authorize('recruiter', 'admin'));

// POST /api/ranker/analyze  → rank candidates, return JSON response
router.post('/analyze', multiUpload, analyzeResumes);

// POST /api/ranker/export   → rank candidates, return downloadable JSON file
router.post('/export', multiUpload, exportRankedResults);

// POST /api/ranker/parse-jd → parse JD only (preview what was extracted)
router.post('/parse-jd', singleJD, parseJD);

module.exports = router;
