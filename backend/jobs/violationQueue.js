import { Queue, Worker } from 'bullmq';
import redisConnection from '../config/redis.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import Violation from '../models/Violation.js';
import Vehicle from '../models/Vehicle.js';
import Rule from '../models/Rule.js';
import Evidence from '../models/Evidence.js';
import Fine from '../models/Fine.js';
import { sendNotification } from '../socket.js';

export const violationQueue = new Queue('violation-queue', {
  connection: redisConnection
});

const worker = new Worker('violation-queue', async (job) => {
  const { filePath, originalname, location, latitude, longitude, remarks, uploaderId } = job.data;
  let { vehicleNumber } = job.data;

  try {
    // 1. Call AI Service to detect violations AND vehicle number (OCR)
    let fileStream;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const response = await axios.get(filePath, { responseType: 'stream' });
      fileStream = response.data;
    } else {
      fileStream = fs.createReadStream(filePath);
    }

    const formData = new FormData();
    formData.append(
      "file",
      fileStream,
      originalname
    );

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/detect`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.AI_API_KEY || "tvds-ai-key-dev"}`,
        },
      }
    );

    const {
      violations: detectedViolations,
      vehicle_number: aiVehicleNumber,
      vehicle_type: aiVehicleType,
      meta,
    } = aiResponse.data;

    // 2. Determine vehicle number
    if (!vehicleNumber || vehicleNumber === "Unknown" || vehicleNumber === "") {
      vehicleNumber = aiVehicleNumber || "Unknown";
    }

    const normalizedNumber = vehicleNumber
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase();

    // 3. Find or create vehicle and owner
    let vehicle = await Vehicle.findOne({
      $or: [
        { vehicleNumber: vehicleNumber },
        { vehicleNumber: normalizedNumber },
        {
          vehicleNumber: new RegExp(
            "^" + normalizedNumber.split("").join("\\s*") + "$",
            "i",
          ),
        },
      ],
    });

    if (!vehicle) {
      vehicle = await Vehicle.create({
        vehicleNumber,
        vehicleType: aiVehicleType || "Other",
        ownerId: null,
        brand: "Unknown",
        model: "Unknown",
        registrationStatus: "Unregistered",
      });
    }

    const actualOwnerId = vehicle.ownerId || null;
    const results = [];

    // 4. Process each detected violation
    for (const dv of detectedViolations) {
      const rule = await Rule.findOne({ violationType: dv.type });
      const fineAmount = rule ? rule.fineAmount : 500;

      const violation = await Violation.create({
        vehicleId: vehicle._id,
        ownerId: actualOwnerId,
        policeId: uploaderId,
        ruleId: rule ? rule._id : null,
        violationType: dv.type,
        location: location || "Detected Location",
        latitude,
        longitude,
        aiDetected: true,
        aiConfidence: dv.confidence,
        status: "Pending",
        remarks: remarks || "AI Detected Violation",
      });

      await Evidence.create({
        violationId: violation._id,
        imageUrl: filePath,
        cameraLocation: location || "Static Camera",
        uploadedBy: uploaderId,
      });

      const fine = await Fine.create({
        violationId: violation._id,
        amount: fineAmount,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        paymentStatus: "Pending",
      });

      results.push({ violation, fine });
    }

    // Notify frontend upon success
    sendNotification('violation_processed', {
      jobId: job.id,
      status: 'completed',
      vehicleNumber,
      resultsCount: results.length,
      meta
    }, `user:${uploaderId}`);

    return { vehicleNumber, resultsCount: results.length, meta };
  } catch (error) {
    console.error("Job Error:", error);
    
    // Notify frontend upon failure
    sendNotification('violation_processed', {
      jobId: job.id,
      status: 'failed',
      error: error.message
    }, `user:${uploaderId}`);

    throw error;
  }
}, { 
  connection: redisConnection,
  concurrency: 2 // Can be adjusted based on AI server capacity
});

worker.on('completed', (job, returnvalue) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job.id} has failed with ${error.message}`);
});
