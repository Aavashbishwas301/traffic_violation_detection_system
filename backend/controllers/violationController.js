import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Violation from "../models/Violation.js";
import Vehicle from "../models/Vehicle.js";
import VehicleOwner from "../models/VehicleOwner.js";
import Rule from "../models/Rule.js";
import Evidence from "../models/Evidence.js";
import Fine from "../models/Fine.js";
import { violationQueue } from "../jobs/violationQueue.js";


// @desc    Upload evidence and detect violations
// @route   POST /api/violations/upload
// @access  Private (Police/Admin)
const uploadViolation = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { location, latitude, longitude, remarks, vehicleNumber } = req.body;

  try {
    // Use location (S3 URL) if available, otherwise fallback to local path
    const fileUri = req.file.location || req.file.path;

    // Add job to BullMQ
    const job = await violationQueue.add('detect-violation', {
      filePath: fileUri,
      originalname: req.file.originalname,
      location,
      latitude,
      longitude,
      remarks,
      vehicleNumber,
      uploaderId: req.user._id,
    });

    res.status(202).json({
      message: "File uploaded successfully. Processing started in the background.",
      jobId: job.id,
      status: "processing",
    });
  } catch (error) {
    console.error("Upload Queue Error:", error);
    res.status(500).json({ message: "Error enqueueing violation detection" });
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
      // Create as Unregistered — admin can assign owner later
      vehicle = await Vehicle.create({
        vehicleNumber,
        vehicleType: "Other",
        ownerId: null,
        brand: "Manual",
        model: "Manual",
        registrationStatus: "Unregistered",
      });
    }

    const rule = await Rule.findOne({ violationType });
    const violation = await Violation.create({
      vehicleId: vehicle._id,
      ownerId: vehicle.ownerId,
      policeId: req.user._id,
      ruleId: rule?._id,
      violationType,
      location,
      status: "Verified", // Manual entry by police is usually pre-verified
      verifiedAt: Date.now(),
      remarks,
      aiDetected: false,
    });

    const fileUri = req.file.location || req.file.path;

    await Evidence.create({
      violationId: violation._id,
      imageUrl: fileUri,
      cameraLocation: location,
      uploadedBy: req.user._id,
    });

    await Fine.create({
      violationId: violation._id,
      amount: rule ? rule.fineAmount : 1000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentStatus: "Pending",
    });

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

    const total = await Violation.countDocuments();
    const violations = await Violation.find()
      .populate("vehicleId")
      .populate("ownerId", "fullName email phone")
      .populate("ruleId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch fine and evidence for each violation
    const results = await Promise.all(
      violations.map(async (v) => {
        const fine = await Fine.findOne({ violationId: v._id });
        const evidence = await Evidence.findOne({ violationId: v._id });
        return {
          ...v._doc,
          fine,
          imageUrl: evidence ? evidence.imageUrl : null,
          evidenceUrl: evidence ? evidence.imageUrl : null, // Frontend uses both
        };
      }),
    );

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
    const violations = await Violation.find({ ownerId: req.user._id })
      .populate("vehicleId")
      .populate("ruleId")
      .sort({ createdAt: -1 });

    // Fetch fine and evidence for each violation
    const results = await Promise.all(
      violations.map(async (v) => {
        const fine = await Fine.findOne({ violationId: v._id });
        const evidence = await Evidence.findOne({ violationId: v._id });
        return {
          ...v._doc,
          fine,
          imageUrl: evidence ? evidence.imageUrl : null,
          evidenceUrl: evidence ? evidence.imageUrl : null,
        };
      }),
    );

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
    const violation = await Violation.findById(req.params.id);
    if (violation) {
      violation.status = req.body.status || violation.status;
      violation.remarks = req.body.remarks || violation.remarks;

      if (req.body.status === "Verified") {
        violation.verifiedAt = Date.now();

        // Generate Fine if not exists
        const existingFine = await Fine.findOne({ violationId: violation._id });
        if (!existingFine) {
          const rule = await Rule.findById(violation.ruleId);
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // 30 days due

          await Fine.create({
            violationId: violation._id,
            amount: rule ? rule.fineAmount : 1000,
            dueDate: dueDate,
            paymentStatus: "Pending",
          });
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
    const violation = await Violation.findById(req.params.id);
    if (violation) {
      // Also delete related Evidence and Fine
      await Evidence.deleteMany({ violationId: violation._id });
      await Fine.deleteMany({ violationId: violation._id });
      await violation.deleteOne();
      res.json({ message: "Violation and related records removed." });
    } else {
      res.status(404).json({ message: "Violation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export {
  uploadViolation,
  manualViolation,
  getViolations,
  getMyViolations,
  updateViolation,
  deleteViolation,
};
