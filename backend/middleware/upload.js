const multer = require('multer');

const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'audio/', 'text/'];
const ALLOWED_MIME_EXACT = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
  'application/javascript',
  'application/x-yaml',
];

const fileFilter = (req, file, cb) => {
  const allowed =
    ALLOWED_MIME_EXACT.includes(file.mimetype) ||
    ALLOWED_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));

  if (!allowed) {
    return cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter,
});

module.exports = upload;
