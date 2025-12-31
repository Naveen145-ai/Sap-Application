const fs = require('fs');
const path = require('path');
const multer = require('multer');
let storage;

// Prefer Cloudinary storage if configured, otherwise fall back to local disk storage
try {
  const cloudinaryConf = require('../config/cloudinary');
  if (process.env.CLOUDINARY_API_KEY && cloudinaryConf && cloudinaryConf.storage) {
    storage = cloudinaryConf.storage;
    console.log('Using Cloudinary storage for uploads');
  }
} catch (e) {
  console.warn('Cloudinary storage not available, falling back to disk storage');
}

if (!storage) {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${unique}-${file.originalname}`);
    }
  });
  console.log('Using local disk storage for uploads at', uploadDir);
}

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 50 // Allow up to 50 files per request to support multi-select
  }
});

module.exports = upload;
