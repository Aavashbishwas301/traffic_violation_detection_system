import multer from 'multer';
import path from 'path';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

// Storage Configuration
const provider = (process.env.STORAGE_PROVIDER || (process.env.S3_BUCKET_NAME ? 's3' : 'local')).toLowerCase();
const useObjectStorage = (provider === 's3' || provider === 'minio') && !!process.env.S3_BUCKET_NAME;

let s3 = null;
if (useObjectStorage) {
  const endpoint = process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT;
  const isMinio = provider === 'minio' || (endpoint && endpoint.includes('9000'));

  const s3Config = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
    }
  };

  if (endpoint) {
    s3Config.endpoint = endpoint;
    s3Config.forcePathStyle = true; // MinIO / S3-compatible path style
  } else if (isMinio) {
    s3Config.endpoint = 'http://localhost:9000';
    s3Config.forcePathStyle = true;
  }

  try {
    s3 = new S3Client(s3Config);
  } catch (err) {
    console.error('Failed to initialize S3Client in uploadMiddleware:', err.message);
  }
}

// Local Storage Fallback
const localStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const cleanOrigName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(
      null,
      `${file.fieldname}-${Date.now()}-${cleanOrigName}`
    );
  },
});

// S3 / MinIO Storage Engine
const s3Storage = (useObjectStorage && s3) ? multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME || 'tvds-evidence',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    const cleanOrigName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const datePrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    cb(null, `evidence/${datePrefix}/${Date.now()}-${cleanOrigName}`);
  }
}) : null;

export function checkFileType(file, cb) {
  const allowedExtensions = /jpg|jpeg|png|mp4|avi|mov/;
  const allowedMimetypes = /image\/(jpeg|jpg|png)|video\/(mp4|x-msvideo|quicktime|avi)/;

  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images and Videos only (jpg, jpeg, png, mp4, avi, mov)!'));
  }
}

const upload = multer({
  storage: (useObjectStorage && s3Storage) ? s3Storage : localStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
