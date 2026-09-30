const multer = require('multer');
const path = require('path');
const env = require('../config/env');
const { AppError } = require('../utils/AppError');

const allowed = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.uploadMaxMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.has(file.mimetype) || !['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return cb(new AppError('File type not allowed', 400, 'INVALID_FILE'));
    }
    cb(null, true);
  },
});

module.exports = { upload };
