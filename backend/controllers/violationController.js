import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import ViolationLine from "../models/ViolationLine.js";
import ViolationType from "../models/ViolationType.js";
import Vehicle from "../models/Vehicle.js";
import VehicleOwner from "../models/VehicleOwner.js";
import Rule from "../models/Rule.js";
import Evidence from "../models/Evidence.js";
import Settlement from "../models/Settlement.js";
import Notification from "../models/Notification.js";
import { violationQueue, processViolationJob } from "../jobs/violationQueue.js";
import storageService from "../services/storageService.js";


// @desc    Upload evidence and detect violations
// @route   POST /api/violations/upload
// @access  Private (Police/Admin)
const uploadViolation = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { location, latitude, longitude, remarks, vehicleNumber } = req.body;

  try {
    const fileUri = req.file.location || req.file.path;
    const jobData = {
      filePath: fileUri,
      originalname: req.file.originalname,
      location,
      latitude,
      longitude,
      remarks,
      vehicleNumber,
      uploaderId: req.user._id,
    };

    let jobId = `job-${Date.now()}`;
    if (violationQueue) {
      try {
        const job = await violationQueue.add('detect-violation', jobData);
        jobId = job.id;
      } catch (queueErr) {
        // Fall back to direct in-process asynchronous processing
        processViolationJob(jobData, jobId).catch(e => console.error("Direct Processing Error:", e));
      }
    } else {
      // Direct in-process asynchronous processing when Redis is offline
      processViolationJob(jobData, jobId).catch(e => console.error("Direct Processing Error:", e));
    }

    res.status(202).json({
      message: "File uploaded successfully. Processing started in the background.",
      jobId: jobId,
      status: "processing",
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error initiating violation detection" });
  }
};

// @desc    Manual violation entry
// @route   POST /api/violations/manual
// @access  Private (Police/Admin)
const manualViolation = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Evidence required" });
  const { vehicleNumber, violationType, location, remarks } = req.body;

  try {
    const normalizedNumber = vehicleNumber
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase();
    let vehicle = await Vehicle.findOne({
      $or: [
        { vehicleNumber: vehicleNumber },
        { vehicleNumber: normalizedNumber },
      ],
    });

    if (!vehicle) {
      vehicle = await Vehicle.create({
        vehicleNumber,
        vehicleType: "Other",
        vehicleCategory: "Other",
        brand: "Manual",
        model: "Manual",
        registrationStatus: "Unregistered",
      });
    }

    const vType = await ViolationType.findOne({ violationName: violationType }).populate("trafficRuleId");
    const fineAmount = vType?.trafficRuleId?.fineAmount || 1000;

    const violation = await ViolationLine.create({
      violationTypeId: vType?._id,
      vehicleId: vehicle._id,
      policeId: req.user._id,
      location,
      status: "Verified",
      verifiedAt: Date.now(),
      remarks,
      aiDetected: false,
      appliedFineAmount: fineAmount,
      violationDateTime: Date.now(),
      statusHistory: [{
        status: "Verified",
        changedBy: req.user._id,
        remarks: "Manually created and verified"
      }]
    });

    const fileUri = req.file.location || req.file.path;

    await Evidence.create({
      violationLineId: violation._id,
      evidenceType: "Image",
      imageUrl: fileUri,
      cameraLocation: location,
      uploadedBy: req.user._id,
    });

    await Settlement.create({
      violationLineId: violation._id,
      policeId: req.user._id,
      amountPaid: 0,
      paymentMethod: "N/A",
      paymentStatus: "Pending",
    });

    if (vehicle.ownerId) {
      try {
        await Notification.create({
          receiverType: "VehicleOwner",
          receiverId: vehicle.ownerId,
          title: "New Traffic Violation Recorded",
          message: `A traffic violation citation has been recorded for your vehicle ${vehicle.vehicleNumber} (${vType?.violationName || violationType}). Fine: Rs. ${fineAmount}.`,
        });
      } catch (notifErr) {
        console.warn("Could not create owner notification:", notifErr.message);
      }
    }

    res.status(201).json(violation);
  } catch (error) {
    res.status(500).json({ message: "Error recording manual violation" });
  }
};

// @desc    Get all violations
// @route   GET /api/violations
// @access  Private (Police/Admin)
const getViolations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await ViolationLine.countDocuments();
    const violations = await ViolationLine.find()
      .populate({
          path: "vehicleId",
          populate: { path: "ownerId", select: "fullName email phoneNumber" }
      })
      .populate("violationTypeId")
      .populate("policeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const violationIds = violations.map((v) => v._id);

    // Optimized batch $in queries — converts 2N queries to 2 fast indexed queries
    const [settlements, evidences] = await Promise.all([
      Settlement.find({ violationLineId: { $in: violationIds } }).lean(),
      Evidence.find({ violationLineId: { $in: violationIds } }).lean(),
    ]);

    const settlementMap = new Map(settlements.map((s) => [s.violationLineId.toString(), s]));
    const evidenceMap = new Map(evidences.map((e) => [e.violationLineId.toString(), e]));

    const results = violations.map((v) => {
      const vId = v._id.toString();
      const settlement = settlementMap.get(vId) || null;
      const evidence = evidenceMap.get(vId) || null;
      return {
        ...v._doc,
        fine: settlement,
        imageUrl: evidence ? evidence.imageUrl : null,
        evidenceUrl: evidence ? evidence.imageUrl : null,
        violationType: v.violationTypeId?.violationName,
        ruleId: v.violationTypeId?.trafficRuleId,
        ownerId: v.vehicleId?.ownerId,
      };
    });

    res.json({
      violations: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getViolations Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get my violations (Vehicle Owner)
// @route   GET /api/violations/my
// @access  Private (VehicleOwner)
const getMyViolations = async (req, res) => {
  try {
    const myVehicles = await Vehicle.find({ ownerId: req.user._id }).select("_id");
    const vehicleIds = myVehicles.map((v) => v._id);

    const violations = await ViolationLine.find({ vehicleId: { $in: vehicleIds } })
      .populate("vehicleId")
      .populate("violationTypeId")
      .sort({ createdAt: -1 });

    const violationIds = violations.map((v) => v._id);

    // Optimized batch $in queries
    const [settlements, evidences] = await Promise.all([
      Settlement.find({ violationLineId: { $in: violationIds } }).lean(),
      Evidence.find({ violationLineId: { $in: violationIds } }).lean(),
    ]);

    const settlementMap = new Map(settlements.map((s) => [s.violationLineId.toString(), s]));
    const evidenceMap = new Map(evidences.map((e) => [e.violationLineId.toString(), e]));

    const results = violations.map((v) => {
      const vId = v._id.toString();
      const settlement = settlementMap.get(vId) || null;
      const evidence = evidenceMap.get(vId) || null;
      return {
        ...v._doc,
        fine: settlement,
        imageUrl: evidence ? evidence.imageUrl : null,
        evidenceUrl: evidence ? evidence.imageUrl : null,
        violationType: v.violationTypeId?.violationName,
        ruleId: v.violationTypeId?.trafficRuleId,
      };
    });

    res.json(results);
  } catch (error) {
    console.error("getMyViolations Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update violation
// @route   PUT /api/violations/:id
// @access  Private (Police/Admin)
const updateViolation = async (req, res) => {
  try {
    const violation = await ViolationLine.findById(req.params.id)
      .populate('violationTypeId')
      .populate('vehicleId');

    if (violation) {
      let auditRemarks = req.body.remarks || "Status updated manually";

      // Check if vehicle plate number is being corrected
      if (req.body.vehicleNumber && (!violation.vehicleId || req.body.vehicleNumber !== violation.vehicleId.vehicleNumber)) {
        const oldPlate = violation.vehicleId?.vehicleNumber || "Unknown";
        const newPlate = req.body.vehicleNumber.trim();
        const normalizedNumber = newPlate.replace(/[^A-Z0-9\u0900-\u097F]/gi, "").toUpperCase();

        let vehicle = await Vehicle.findOne({
          $or: [
            { vehicleNumber: newPlate },
            { vehicleNumber: normalizedNumber },
          ],
        });

        if (!vehicle) {
          vehicle = await Vehicle.create({
            vehicleNumber: newPlate,
            vehicleType: req.body.vehicleType || violation.vehicleId?.vehicleType || "Other",
            brand: "Manual/Corrected",
            model: "Manual/Corrected",
            registrationStatus: "Unregistered",
          });
        }

        violation.vehicleId = vehicle._id;
        auditRemarks = `Plate corrected from '${oldPlate}' to '${newPlate}'. ${req.body.remarks || ''}`.trim();
      }

      if ((req.body.status && req.body.status !== violation.status) || req.body.vehicleNumber) {
        violation.statusHistory.push({
          status: req.body.status || violation.status,
          changedBy: req.user._id,
          date: Date.now(),
          remarks: auditRemarks
        });
      }

      violation.status = req.body.status || violation.status;
      violation.remarks = req.body.remarks || violation.remarks;

      if (req.body.status === "Verified") {
        violation.verifiedAt = Date.now();

        const existingSettlement = await Settlement.findOne({ violationLineId: violation._id });
        if (!existingSettlement) {
          await Settlement.create({
            violationLineId: violation._id,
            policeId: req.user._id,
            amountPaid: 0,
            paymentMethod: "N/A",
            paymentStatus: "Pending",
          });
        }

        if (violation.vehicleId && violation.vehicleId.ownerId) {
          try {
            await Notification.create({
              receiverType: "VehicleOwner",
              receiverId: violation.vehicleId.ownerId,
              title: "Traffic Violation Citation Verified",
              message: `Your violation citation for vehicle ${violation.vehicleId.vehicleNumber} (${violation.violationTypeId?.violationName || "Traffic Rule Violation"}) has been verified by Traffic Police. Please inspect and settle fine.`,
            });
          } catch (notifErr) {
            console.warn("Could not create owner notification:", notifErr.message);
          }
        }
      }

      const updatedViolation = await violation.save();
      res.json(updatedViolation);
    } else {
      res.status(404).json({ message: "Violation not found" });
    }
  } catch (error) {
    console.error("UpdateViolation Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete violation
// @route   DELETE /api/violations/:id
// @access  Private (Police/Admin)
const deleteViolation = async (req, res) => {
  try {
    const violation = await ViolationLine.findById(req.params.id);
    if (violation) {
      await Evidence.deleteMany({ violationLineId: violation._id });
      await Settlement.deleteMany({ violationLineId: violation._id });
      await violation.deleteOne();
      res.json({ message: "Violation and related records removed." });
    } else {
      res.status(404).json({ message: "Violation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Police Dashboard Stats
// @route   GET /api/violations/police/stats
// @access  Private (Police)
const getPoliceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaysCatch, manualEntries, unverified] = await Promise.all([
      ViolationLine.countDocuments({ createdAt: { $gte: today } }),
      ViolationLine.countDocuments({ aiDetected: false }),
      ViolationLine.countDocuments({ status: "Unverified" })
    ]);

    res.json({
      todaysCatch,
      manualEntries,
      pendingReview: unverified,
    });
  } catch (error) {
    console.error("Get Police Stats Error:", error);
    res.status(500).json({ message: "Error fetching police stats" });
  }
};

// @desc    Get Violation Evidence Media (Stream / Retrieval)
// @route   GET /api/violations/:id/evidence
// @access  Private (Owner/Police/Admin)
const getViolationEvidence = async (req, res) => {
  try {
    const violation = await ViolationLine.findById(req.params.id).populate('vehicleId');
    if (!violation) {
      return res.status(404).json({ message: "Violation not found" });
    }

    // Role-based Access Control: Vehicle Owners can only view evidence for their registered vehicles
    if (req.user?.role === "VehicleOwner") {
      const ownerId = violation.vehicleId?.ownerId?.toString();
      if (!ownerId || ownerId !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden: You are not authorized to view evidence for this vehicle" });
      }
    }

    const evidence = await Evidence.findOne({ violationLineId: violation._id });
    if (!evidence || (!evidence.imageUrl && !evidence.videoUrl)) {
      return res.status(404).json({ message: "Evidence record not found for this violation" });
    }

    const targetUrl = evidence.imageUrl || evidence.videoUrl;

    try {
      const { stream, contentType, contentLength } = await storageService.getFileStream(targetUrl);
      res.setHeader("Content-Type", contentType);
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }
      stream.pipe(res);
    } catch (storageErr) {
      if (storageErr.code === "ENOENT") {
        return res.status(404).json({ message: "Evidence media file missing from storage repository" });
      }
      console.error("Storage Stream Error:", storageErr);
      return res.status(503).json({ message: "Evidence storage repository currently unavailable", error: storageErr.message });
    }
  } catch (error) {
    console.error("getViolationEvidence Error:", error);
    res.status(500).json({ message: "Server Error retrieving evidence" });
  }
};

export {
  uploadViolation,
  manualViolation,
  getViolations,
  getMyViolations,
  updateViolation,
  deleteViolation,
  getPoliceStats,
  getViolationEvidence
};

