import fs from 'fs';
import path from 'path';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadObjectCommand,
  HeadBucketCommand 
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.resolve();

export class StorageService {
  constructor() {
    this.provider = (process.env.STORAGE_PROVIDER || (process.env.S3_BUCKET_NAME ? 's3' : 'local')).toLowerCase();
    this.bucket = process.env.S3_BUCKET_NAME || 'tvds-evidence';
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.uploadsDir = path.join(__dirname, 'uploads');

    // Ensure local uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      try {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create uploads directory:', err.message);
      }
    }

    this.s3Client = null;
    if (this.provider === 's3' || this.provider === 'minio') {
      const endpoint = process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT;
      const isMinio = this.provider === 'minio' || (endpoint && endpoint.includes('9000'));

      const s3Config = {
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
        }
      };

      if (endpoint) {
        s3Config.endpoint = endpoint;
        s3Config.forcePathStyle = true; // Required for MinIO / S3-compatible path routing
      } else if (isMinio) {
        s3Config.endpoint = 'http://localhost:9000';
        s3Config.forcePathStyle = true;
      }

      try {
        this.s3Client = new S3Client(s3Config);
      } catch (err) {
        console.error('Failed to initialize S3Client:', err.message);
      }
    }
  }

  /**
   * Upload buffer directly to configured storage provider (Local, MinIO, or S3)
   */
  async uploadBuffer(buffer, key, mimeType = 'image/jpeg') {
    const cleanKey = key.replace(/\\/g, '/').replace(/^\/+/, '');

    if ((this.provider === 's3' || this.provider === 'minio') && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: cleanKey,
          Body: buffer,
          ContentType: mimeType
        });
        await this.s3Client.send(command);

        const endpoint = process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT;
        const location = endpoint 
          ? `${endpoint}/${this.bucket}/${cleanKey}`
          : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${cleanKey}`;

        return {
          key: cleanKey,
          location,
          provider: this.provider,
          size: buffer.length
        };
      } catch (err) {
        console.warn(`S3/MinIO upload failed, falling back to local disk: ${err.message}`);
        // Fall through to local storage
      }
    }

    // Local Disk Fallback
    const localFilePath = path.join(this.uploadsDir, path.basename(cleanKey));
    await fs.promises.writeFile(localFilePath, buffer);
    return {
      key: `uploads/${path.basename(cleanKey)}`,
      location: `uploads/${path.basename(cleanKey)}`,
      provider: 'local',
      size: buffer.length
    };
  }

  /**
   * Retrieves a readable stream for an evidence file across Local, MinIO, or S3
   */
  async getFileStream(fileUriOrKey) {
    if (!fileUriOrKey) {
      throw new Error('File key or URI is required');
    }

    const cleanUri = fileUriOrKey.replace(/\\/g, '/');

    // 1. Check if S3 / MinIO
    if ((this.provider === 's3' || this.provider === 'minio') && this.s3Client && !cleanUri.startsWith('uploads/')) {
      const s3Key = cleanUri.startsWith('evidence/') ? cleanUri : `evidence/${path.basename(cleanUri)}`;
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: s3Key
        });
        const response = await this.s3Client.send(command);
        return {
          stream: response.Body,
          contentType: response.ContentType || 'application/octet-stream',
          contentLength: response.ContentLength
        };
      } catch (s3Err) {
        // If not found in S3, check local storage before failing
      }
    }

    // 2. Local Disk Retrieval
    const filename = path.basename(cleanUri);
    const localPath = path.join(this.uploadsDir, filename);

    if (fs.existsSync(localPath)) {
      const stats = await fs.promises.stat(localPath);
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime'
      };

      return {
        stream: fs.createReadStream(localPath),
        contentType: mimeTypes[ext] || 'application/octet-stream',
        contentLength: stats.size
      };
    }

    const error = new Error(`Evidence file not found: ${filename}`);
    error.code = 'ENOENT';
    throw error;
  }

  /**
   * Resolves publicly accessible or normalized URL
   */
  resolveFileUrl(fileUriOrKey) {
    if (!fileUriOrKey) return '';
    if (fileUriOrKey.startsWith('http://') || fileUriOrKey.startsWith('https://')) {
      return fileUriOrKey;
    }
    const clean = fileUriOrKey.replace(/\\/g, '/').replace(/^\/+/, '');
    return clean.startsWith('uploads/') ? clean : `uploads/${clean}`;
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(fileUriOrKey) {
    if (!fileUriOrKey) return false;
    const clean = fileUriOrKey.replace(/\\/g, '/');

    if ((this.provider === 's3' || this.provider === 'minio') && this.s3Client) {
      try {
        const s3Key = clean.startsWith('evidence/') ? clean : `evidence/${path.basename(clean)}`;
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: s3Key
        }));
      } catch (err) {
        console.warn(`S3 delete failed: ${err.message}`);
      }
    }

    const localPath = path.join(this.uploadsDir, path.basename(clean));
    if (fs.existsSync(localPath)) {
      try {
        await fs.promises.unlink(localPath);
        return true;
      } catch (err) {
        console.warn(`Local file delete failed: ${err.message}`);
      }
    }
    return true;
  }

  /**
   * Validates storage connectivity and returns health status
   */
  async checkHealth() {
    if (this.provider === 'local') {
      const isWritable = fs.existsSync(this.uploadsDir);
      return {
        provider: 'local',
        status: isWritable ? 'HEALTHY' : 'DEGRADED',
        directory: this.uploadsDir,
        details: 'Local disk storage active'
      };
    }

    if (!this.s3Client) {
      return {
        provider: this.provider,
        status: 'UNAVAILABLE',
        details: 'S3 Client not initialized'
      };
    }

    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return {
        provider: this.provider,
        status: 'HEALTHY',
        bucket: this.bucket,
        region: this.region,
        details: 'Object storage connection verified'
      };
    } catch (err) {
      return {
        provider: this.provider,
        status: 'UNAVAILABLE',
        bucket: this.bucket,
        error: err.message,
        details: 'Failed to connect to S3/MinIO bucket'
      };
    }
  }

  /**
   * Safe migration strategy: Copies existing local evidence to S3/MinIO
   * without deleting local files unless explicit confirmation.
   */
  async migrateEvidence(dryRun = true) {
    if (!this.s3Client) {
      throw new Error('Cannot migrate: Object storage is not initialized');
    }

    const files = await fs.promises.readdir(this.uploadsDir);
    const results = {
      totalFound: files.length,
      migrated: 0,
      skipped: 0,
      failed: 0,
      dryRun,
      details: []
    };

    for (const filename of files) {
      const filePath = path.join(this.uploadsDir, filename);
      const stats = await fs.promises.stat(filePath);
      if (stats.isDirectory()) continue;

      const key = `evidence/${filename}`;
      if (dryRun) {
        results.details.push({ file: filename, action: 'Would upload to ' + key });
        results.migrated += 1;
        continue;
      }

      try {
        const buffer = await fs.promises.readFile(filePath);
        await this.uploadBuffer(buffer, key);
        results.migrated += 1;
        results.details.push({ file: filename, status: 'Migrated to ' + key });
      } catch (err) {
        results.failed += 1;
        results.details.push({ file: filename, error: err.message });
      }
    }

    return results;
  }
}

export const storageService = new StorageService();
export default storageService;
