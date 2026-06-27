const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile photos (students, teachers, parents, principal)
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'educore/photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

// Storage for documents (assignments, report cards, library files)
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'educore/documents',
    resource_type: 'auto', // allows pdf/doc/etc, not just images
  },
});

const uploadPhoto = multer({ storage: photoStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadDocument = multer({ storage: documentStorage, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = { cloudinary, uploadPhoto, uploadDocument };
