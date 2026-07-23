/**
 * Auth endpoint tests
 * Tests validation middleware structure and JWT token generation
 */
import {
  loginValidation,
  registerValidation,
} from "../middleware/validationMiddleware.js";
import jwt from "jsonwebtoken";
import request from 'supertest';
import { app, httpServer } from '../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  httpServer.close();
});

describe("Auth Validation Rules", () => {
  describe("loginValidation", () => {
    it("should have 3 middleware functions (email + password + error handler)", () => {
      expect(loginValidation.length).toBe(3);
    });
  });

  describe("registerValidation", () => {
    it("should have 4 middleware functions (name + email + password + error handler)", () => {
      expect(registerValidation.length).toBe(4);
    });
  });
});

describe("JWT Token Generation", () => {
  it("should generate a token with correct 3-part JWT structure", () => {
    const generateToken = (id, role) => {
      return jwt.sign({ id, role }, process.env.JWT_SECRET || "test-secret", {
        expiresIn: "30d",
      });
    };

    const token = generateToken("123", "Admin");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });
});

describe('Authentication API', () => {
  it('should return 400 for login without credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({});
    expect(res.statusCode).toEqual(400);
  });
  
  it('should hit the basic health check route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('TVDS API is running');
  });
});
