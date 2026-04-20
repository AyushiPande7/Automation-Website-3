const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/ideas');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName =
      'idea_' + Date.now() + '_' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

// File filter (images, pdfs, and docs)
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|exe|zip|py/;
  const allowedMime = /image\/.*|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|application\/x-msdownload|application\/octet-stream|application\/zip|application\/x-zip-compressed|text\/x-python|text\/x-script\.python|application\/x-python-code|text\/plain/;

  const extOk = allowedExts.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeOk = allowedMime.test(file.mimetype) || file.originalname.toLowerCase().endsWith('.py'); // sometimes mimetype info is limited for .py files or returned as application/octet-stream

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, Word, EXE, ZIP, and Python files are allowed'), false);
  }
};

// Multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

module.exports = upload;