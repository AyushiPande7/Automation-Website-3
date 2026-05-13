const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Ideas upload dir ─────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads/ideas');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Team photos upload dir ───────────────────────────────────────────────────
const teamUploadDir = path.join(__dirname, '../uploads/team');
if (!fs.existsSync(teamUploadDir)) fs.mkdirSync(teamUploadDir, { recursive: true });

// ── Shared helpers ───────────────────────────────────────────────────────────
const imageOnlyFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|gif|webp|svg/.test(path.extname(file.originalname).toLowerCase());
  if (ok) cb(null, true);
  else cb(new Error('Only image files are allowed for team photos'), false);
};

// ── Ideas multer (multi-file, all file types) ────────────────────────────────
const ideasStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'idea_' + Date.now() + '_' + Math.round(Math.random() * 1e9) + ext);
  }
});

const ideasFileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|exe|zip|py/;
  const allowedMime = /image\/.*|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|application\/x-msdownload|application\/octet-stream|application\/zip|application\/x-zip-compressed|text\/x-python|text\/x-script\.python|application\/x-python-code|text\/plain/;
  const extOk = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedMime.test(file.mimetype) || file.originalname.toLowerCase().endsWith('.py');
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error('Only images, PDFs, Word, EXE, ZIP, and Python files are allowed'), false);
};

const upload = multer({ storage: ideasStorage, fileFilter: ideasFileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

// ── Team multer (single image) ───────────────────────────────────────────────
const teamStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, teamUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'member_' + Date.now() + '_' + Math.round(Math.random() * 1e9) + ext);
  }
});

const uploadTeam = multer({ storage: teamStorage, fileFilter: imageOnlyFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { upload, uploadTeam };
