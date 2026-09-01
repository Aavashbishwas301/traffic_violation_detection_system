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

export const processViolationJob = async (jobData, jobId = `direct-${Date.now()}`) => {
  const { filePath, originalname, location, latitude, longitude, remarks, uploaderId } = jobData;
  let { vehicleNumber } = jobData;

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
      `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/detect`,
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

    const results = [];

    // 4. Process each detected violation
    for (const dv of (detectedViolations || [])) {
      let vType = await ViolationType.findOne({ violationName: dv.type }).populate("trafficRuleId");
      
      if (!vType) {
        let rule = await Rule.findOne({ violationType: dv.type });
        if (!rule) {
          rule = await Rule.create({
            ruleName: `${dv.type} Rule`,
            description: `Auto-generated rule for ${dv.type}`,
            violationType: dv.type,
            fineAmount: 1000,
          });
        }
        vType = await ViolationType.create({
          violationName: dv.type,
          description: `Auto-detected ${dv.type}`,
          severity: "Medium",
          trafficRuleId: rule._id,
        });
        vType.trafficRuleId = rule;
      }

      const fineAmount = vType?.trafficRuleId?.fineAmount || 1000;
      const trackTag = dv.track_id ? `[Track #${dv.track_id}]` : '';

      const isUncertain = dv.requiresReview || (dv.confidence < 0.75);
      const violationStatus = isUncertain ? "Unverified" : "Verified";
      const reviewNote = dv.reviewReason ? ` [Review: ${dv.reviewReason}]` : '';

      const locationPoint = (longitude && latitude) ? {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      } : undefined;

      const violation = await ViolationLine.create({
        violationTypeId: vType._id,
        vehicleId: vehicle._id,
        policeId: uploaderId,
        location: location || "Digital Camera #1",
        locationPoint,
        appliedFineAmount: fineAmount,
        aiDetected: true,
        aiConfidence: dv.confidence || 0.85,
        status: violationStatus,
        verifiedAt: (violationStatus === "Verified") ? Date.now() : null,
        remarks: `${remarks ? remarks + " | " : ""}${trackTag} AI Detection (${(dv.confidence * 100).toFixed(1)}%)${reviewNote}`.trim(),
        violationDateTime: Date.now(),
        statusHistory: [{
          status: violationStatus,
          changedBy: uploaderId,
          remarks: `System initialized by AI queue ${trackTag}`.trim()
        }]
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
      jobId: jobId,
      status: 'completed',
      vehicleNumber,
      resultsCount: results.length,
      meta
    }, `user:${uploaderId}`);

    return { vehicleNumber, resultsCount: results.length, meta };
  } catch (error) {
    console.error("Violation Job Processing Error:", error);
    
    // Notify frontend upon failure
    sendNotification('violation_processed', {
      jobId: jobId,
      status: 'failed',
      error: error.message
    }, `user:${uploaderId}`);
    
    throw error;
  }
};

if (redisConnection) {
  try {
    violationQueue = new Queue('violation-queue', {
      connection: redisConnection
    });

    worker = new Worker('violation-queue', async (job) => {
      return await processViolationJob(job.data, job.id);
    }, { connection: redisConnection });
  } catch (err) {
    console.warn('BullMQ initialization skipped:', err.message);
  }
}
