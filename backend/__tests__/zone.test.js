import request from 'supertest';
import { app, httpServer } from '../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from "jsonwebtoken";
import CameraZone from '../models/CameraZone.js';
import Admin from '../models/Admin.js';

let mongoServer;
let adminToken;
let adminId;

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "30d",
  });
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const adminUser = await Admin.create({
    fullName: "Zone Admin",
    email: "zoneadmin@tvds.gov.np",
    password: "Password123!",
    role: "Admin"
  });
  adminId = adminUser._id;
  adminToken = generateToken(adminId, "Admin");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  httpServer.close();
});

describe("Camera Calibration & Zone Management APIs", () => {
  it("should retrieve default camera zones if database is empty", async () => {
    const res = await request(app)
      .get("/api/admin/zones")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cameras.length).toBeGreaterThan(0);
    expect(res.body.cameras[0].cameraId).toBe("CAM_01_MAITIGHAR");
  });

  it("should save or update a camera zone calibration", async () => {
    const payload = {
      cameraId: "CAM_02_KOTESHWOR",
      name: "Koteshwor Chowk - South Approach",
      location: "Koteshwor, Kathmandu",
      resolution: { width: 1920, height: 1080 },
      zones: [
        {
          zoneId: "ZONE_STOP_KOTESHWOR",
          name: "South Stop Line",
          type: "Stop Line",
          polygon: [
            { x: 0.1, y: 0.6 },
            { x: 0.9, y: 0.6 },
            { x: 0.9, y: 0.65 },
            { x: 0.1, y: 0.65 }
          ],
          enabled: true
        },
        {
          zoneId: "ZONE_NOENTRY_KOTESHWOR",
          name: "One Way Ramp",
          type: "No Entry Area",
          polygon: [
            { x: 0.7, y: 0.2 },
            { x: 0.95, y: 0.2 },
            { x: 0.95, y: 0.5 },
            { x: 0.7, y: 0.5 }
          ],
          enabled: true
        }
      ]
    };

    const res = await request(app)
      .post("/api/admin/zones")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.camera.cameraId).toBe("CAM_02_KOTESHWOR");
    expect(res.body.camera.zones.length).toBe(2);
  });

  it("should toggle a zone enabled status", async () => {
    const res = await request(app)
      .patch("/api/admin/zones/CAM_02_KOTESHWOR/zones/ZONE_NOENTRY_KOTESHWOR/toggle")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ enabled: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.zone.enabled).toBe(false);
  });

  it("should delete a specific zone from camera calibration", async () => {
    const res = await request(app)
      .delete("/api/admin/zones/CAM_02_KOTESHWOR/zones/ZONE_NOENTRY_KOTESHWOR")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.camera.zones.length).toBe(1);
  });
});
