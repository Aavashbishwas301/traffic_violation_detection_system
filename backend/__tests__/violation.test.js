/**
 * Violation endpoint tests
 * Tests fetching all violations, single violation, and owner specific violations.
 */
import request from 'supertest';
import { app, httpServer } from '../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from "jsonwebtoken";

// Import Models
import ViolationLine from '../models/ViolationLine.js';
import Vehicle from '../models/Vehicle.js';
import VehicleOwner from '../models/VehicleOwner.js';
import TrafficPolice from '../models/TrafficPolice.js';
import ViolationType from '../models/ViolationType.js';
import Rule from '../models/Rule.js';

let mongoServer;

// Utility to generate a valid JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "30d",
  });
};

beforeAll(async () => {
  // Use in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  httpServer.close();
});

describe('Violations API', () => {
  let policeToken, ownerToken;
  let mockPolice, mockOwner, mockVehicle, mockRule, mockViolationType, mockViolation;

  beforeEach(async () => {
    // 1. Create a mock Police Officer
    mockPolice = await TrafficPolice.create({
      fullName: "Officer Test",
      email: "police@test.com",
      password: "password123",
      badgeNumber: "TEST-001",
      station: "HQ",
      role: "TrafficPolice"
    });
    policeToken = generateToken(mockPolice._id, "TrafficPolice");

    // 2. Create a mock Vehicle Owner
    mockOwner = await VehicleOwner.create({
      fullName: "Owner Test",
      email: "owner@test.com",
      password: "password123",
      licenseNumber: "LIC-TEST-001",
      citizenshipNumber: "CIT-TEST-1234",
      phone: "9876543210",
      role: "VehicleOwner"
    });
    ownerToken = generateToken(mockOwner._id, "VehicleOwner");

    // 3. Create a mock Vehicle associated with the Owner
    mockVehicle = await Vehicle.create({
      vehicleNumber: "BA 1 PA 1234",
      vehicleType: "Car",
      ownerId: mockOwner._id,
      brand: "Toyota",
      model: "Corolla",
      registrationStatus: "Registered"
    });

    // 4. Create a mock Rule and Violation Type
    mockRule = await Rule.create({
      ruleName: "Speed Limit Rule",
      description: "Do not exceed speed limit",
      violationType: "Speeding",
      fineAmount: 500
    });

    mockViolationType = await ViolationType.create({
      violationName: "Speeding",
      description: "Driving above speed limit",
      severity: "High",
      trafficRuleId: mockRule._id
    });

    // 5. Create a mock Violation Line
    mockViolation = await ViolationLine.create({
      violationTypeId: mockViolationType._id,
      vehicleId: mockVehicle._id,
      policeId: mockPolice._id,
      location: "Test Highway",
      appliedFineAmount: 500,
      status: "Unverified",
      violationDateTime: new Date()
    });
  });

  afterEach(async () => {
    // Clear all collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  describe('GET /api/violations', () => {
    it('should return all violations for Police (Populated)', async () => {
      const res = await request(app)
        .get('/api/violations')
        .set('Authorization', `Bearer ${policeToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('violations');
      expect(Array.isArray(res.body.violations)).toBeTruthy();
      expect(res.body.violations.length).toBe(1);
      
      const v = res.body.violations[0];
      // Assert population happened correctly
      expect(v.location).toBe("Test Highway");
      expect(v.vehicleId.vehicleNumber).toBe("BA 1 PA 1234");
      expect(v.violationType).toBe("Speeding");
    });

    it('should deny access if no token is provided', async () => {
      const res = await request(app).get('/api/violations');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/violations/my', () => {
    it('should return only violations linked to the logged-in Owner', async () => {
      const res = await request(app)
        .get('/api/violations/my')
        .set('Authorization', `Bearer ${ownerToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      
      const v = res.body[0];
      expect(v.vehicleId.vehicleNumber).toBe("BA 1 PA 1234");
      // Since it's the custom 'my' payload, it maps violationTypeId to violationType string
      expect(v.violationType).toBe("Speeding");
      expect(v.appliedFineAmount).toBe(500);
    });
  });
});
