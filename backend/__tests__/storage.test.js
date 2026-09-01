import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { app } from '../server.js';
import storageService, { StorageService } from '../services/storageService.js';
import { checkFileType } from '../middleware/uploadMiddleware.js';
import TrafficPolice from '../models/TrafficPolice.js';
import VehicleOwner from '../models/VehicleOwner.js';
import Vehicle from '../models/Vehicle.js';
import ViolationLine from '../models/ViolationLine.js';
import ViolationType from '../models/ViolationType.js';
import Rule from '../models/Rule.js';
import Evidence from '../models/Evidence.js';

let mongoServer;
let policeToken;
let ownerAToken;
let ownerBToken;
let violationIdA;
let violationIdB;
let testEvidenceFileName;

const generateToken = (id, role = "TrafficPolice") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "tvds_jwt_secret_test_key_12345", {
    expiresIn: "30d",
  });
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // 1. Create Police User
  const policeUser = await TrafficPolice.create({
    fullName: "Storage Officer",
    badgeNumber: "BADGE-9999",
    email: "storageofficer@tvds.gov.np",
    password: "Password123!",
    rank: "Inspector",
    station: "Kathmandu Central"
  });
  policeToken = generateToken(policeUser._id, "TrafficPolice");

  // 2. Create Vehicle Owner A
  const ownerA = await VehicleOwner.create({
    fullName: "Ram Shrestha",
    citizenshipNumber: "01-998877",
    email: "ram@example.com",
    password: "Password123!",
    phoneNumber: "9841000001",
    address: "Kathmandu"
  });
  ownerAToken = generateToken(ownerA._id, "VehicleOwner");

  // 3. Create Vehicle Owner B
  const ownerB = await VehicleOwner.create({
    fullName: "Sita Sharma",
    citizenshipNumber: "01-998878",
    email: "sita@example.com",
    password: "Password123!",
    phoneNumber: "9841000002",
    address: "Lalitpur"
  });
  ownerBToken = generateToken(ownerB._id, "VehicleOwner");

  // 4. Create Vehicles
  const vehicleA = await Vehicle.create({
    vehicleNumber: "BA 2 PA 1234",
    ownerId: ownerA._id,
    vehicleType: "Bike"
  });

  const vehicleB = await Vehicle.create({
    vehicleNumber: "BA 3 CHA 5678",
    ownerId: ownerB._id,
    vehicleType: "Car"
  });

  // 5. Create Traffic Rule & Violation Type
  const rule = await Rule.create({
    ruleName: "Red Light Traffic Rule",
    description: "Do not jump red light",
    violationType: "Red Light Violation",
    fineAmount: 1000
  });

  const vType = await ViolationType.create({
    violationName: "Red Light Violation",
    severity: "High",
    trafficRuleId: rule._id
  });

  // 6. Create Test Evidence File in uploads/
  const uploadsDir = path.join(path.resolve(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  testEvidenceFileName = `test-evidence-${Date.now()}.jpg`;
  const dummyBuffer = Buffer.from('FAKE_JPEG_IMAGE_CONTENT_FOR_TESTING');
  await fs.promises.writeFile(path.join(uploadsDir, testEvidenceFileName), dummyBuffer);

  // 7. Create Violations & Evidence
  const violationA = await ViolationLine.create({
    violationTypeId: vType._id,
    vehicleId: vehicleA._id,
    policeId: policeUser._id,
    location: "Maitighar",
    appliedFineAmount: 1000,
    violationDateTime: new Date(),
    status: "Unverified"
  });
  violationIdA = violationA._id;

  await Evidence.create({
    violationLineId: violationA._id,
    evidenceType: "Image",
    imageUrl: `uploads/${testEvidenceFileName}`,
    uploadedBy: policeUser._id
  });

  const violationB = await ViolationLine.create({
    violationTypeId: vType._id,
    vehicleId: vehicleB._id,
    policeId: policeUser._id,
    location: "Koteshwor",
    appliedFineAmount: 1000,
    violationDateTime: new Date(),
    status: "Unverified"
  });
  violationIdB = violationB._id;

  await Evidence.create({
    violationLineId: violationB._id,
    evidenceType: "Image",
    imageUrl: `uploads/missing_file_b.jpg`,
    uploadedBy: policeUser._id
  });
});

afterAll(async () => {
  // Clean up created test file
  if (testEvidenceFileName) {
    const testFile = path.join(path.resolve(), 'uploads', testEvidenceFileName);
    if (fs.existsSync(testFile)) {
      try { fs.unlinkSync(testFile); } catch (e) {}
    }
  }
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Phase 4: Evidence Storage Architecture Tests', () => {

  // Test 1: Upload (Local / S3 abstraction)
  test('1. Upload: should upload file buffer and return storage metadata', async () => {
    const buffer = Buffer.from('TEST_EVIDENCE_BUFFER');
    const uploadResult = await storageService.uploadBuffer(buffer, `test-upload-${Date.now()}.jpg`, 'image/jpeg');

    expect(uploadResult).toBeDefined();
    expect(uploadResult.location).toBeDefined();
    expect(uploadResult.size).toBe(buffer.length);
    expect(['local', 's3', 'minio']).toContain(uploadResult.provider);

    // Clean up created file
    await storageService.deleteFile(uploadResult.location);
  });

  // Test 2: Retrieval and streaming
  test('2. Retrieval: should stream evidence file for authorized police officer', async () => {
    const res = await request(app)
      .get(`/api/violations/${violationIdA}/evidence`)
      .set('Authorization', `Bearer ${policeToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
    expect(res.body.toString()).toContain('FAKE_JPEG_IMAGE_CONTENT_FOR_TESTING');
  });

  // Test 3: Missing file handling
  test('3. Missing file: should return 404 when evidence file is missing from storage', async () => {
    const res = await request(app)
      .get(`/api/violations/${violationIdB}/evidence`)
      .set('Authorization', `Bearer ${policeToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('missing from storage');
  });

  // Test 4: Invalid file validation
  test('4. Invalid file: checkFileType should reject non-media filetypes (exe, pdf, txt)', (done) => {
    const invalidFile = { originalname: 'malware.exe', mimetype: 'application/x-msdownload' };
    checkFileType(invalidFile, (err, success) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toContain('Images and Videos only');
      done();
    });
  });

  test('4b. Valid file: checkFileType should accept jpeg and mp4 media', (done) => {
    const validFile = { originalname: 'evidence.jpg', mimetype: 'image/jpeg' };
    checkFileType(validFile, (err, success) => {
      expect(err).toBeNull();
      expect(success).toBe(true);
      done();
    });
  });

  // Test 5: Storage service health check
  test('5. Health Check: checkHealth should report healthy status for active storage', async () => {
    const health = await storageService.checkHealth();
    expect(health).toBeDefined();
    expect(['HEALTHY', 'DEGRADED', 'UNAVAILABLE']).toContain(health.status);
    expect(health.provider).toBeDefined();
  });

  // Test 6: Storage unavailable fallback handling
  test('6. Storage unavailable: should handle missing or uninitialized S3 client gracefully with fallback', async () => {
    const customService = new StorageService();
    customService.provider = 's3';
    customService.s3Client = null; // simulate offline/uninitialized S3

    const buffer = Buffer.from('FALLBACK_BUFFER_TEST');
    const result = await customService.uploadBuffer(buffer, `fallback-${Date.now()}.jpg`);
    expect(result.provider).toBe('local');

    // Clean up
    await customService.deleteFile(result.location);
  });

  // Test 7: Unauthorized access prevention
  test('7. Unauthorized access: Vehicle Owner A should NOT be able to access Owner B evidence', async () => {
    // Owner A tries to access Violation B (which belongs to Owner B)
    const res = await request(app)
      .get(`/api/violations/${violationIdB}/evidence`)
      .set('Authorization', `Bearer ${ownerAToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  test('7b. Authorized access: Vehicle Owner A CAN access their own vehicle evidence', async () => {
    const res = await request(app)
      .get(`/api/violations/${violationIdA}/evidence`)
      .set('Authorization', `Bearer ${ownerAToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
  });
});
