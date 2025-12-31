const cloudinaryModule = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

const cloudinary = cloudinaryModule.v2;

// Support both CLOUDINARY_NAME and CLOUDINARY_CLOUD_NAME envs
const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET_KEY || process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sap-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
  },
});

module.exports = { cloudinary, storage }; // ✅ named exports
