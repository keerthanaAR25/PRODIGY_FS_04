const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'chat-app/files';
    let resourceType = 'auto';
    if (file.mimetype.startsWith('image/')) folder = 'chat-app/images';
    else if (file.mimetype.startsWith('video/')) { folder = 'chat-app/videos'; resourceType = 'video'; }
    return {
      folder,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'pdf', 'doc', 'docx'],
      transformation: file.mimetype.startsWith('image/') ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype || extname) return cb(null, true);
    cb(new Error('File type not allowed'));
  },
});

module.exports = { cloudinary, upload };