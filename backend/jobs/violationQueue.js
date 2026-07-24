import { Queue, Worker } from 'bullmq';
import redisConnection from '../config/redis.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import ViolationLine from '../models/ViolationLine.js';
import ViolationType from '../models/ViolationType.js';
import Vehicle from '../models/Vehicle.js';
import Rule from '../models/Rule.js';
import Evidence from '../models/Evidence.js';
import Settlement from '../models/Settlement.js';
import { sendNotification } from '../socket.js';

export let violationQueue = null;
let worker = null;

if (redisConnection) {
  violationQueue = new Queue('violation-queue', {
    connection: redisConnection
  });

  worker = new Worker('violation-queue', async (job) => {
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
        const vType = await ViolationType.findOne({ violationName: dv.type }).populate("trafficRuleId");
        const fineAmount = vType?.trafficRuleId?.fineAmount || 500;

        const violation = await ViolationLine.create({
          violationTypeId: vType?._id,
          vehicleId: vehicle._id,
          policeId: uploaderId,
          location: location || "Detected Location",
          latitude,
          longitude,
          aiDetected: true,
          aiConfidence: dv.confidence,
          status: "Unverified",
          remarks: remarks || "AI Detected Violation",
          appliedFineAmount: fineAmount,
          violationDateTime: Date.now()
        });

        await Evidence.create({
          violationLineId: violation._id,
          evidenceType: "Image",
          imageUrl: filePath,
          cameraLocation: location || "Static Camera",
          uploadedBy: uploaderId,
        });

        const fine = await Settlement.create({
          violationLineId: violation._id,
          policeId: uploaderId,
          amountPaid: 0,
          paymentMethod: "N/A",
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
}
