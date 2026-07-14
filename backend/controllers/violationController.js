import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Violation from "../models/Violation.js";
import Vehicle from "../models/Vehicle.js";
import VehicleOwner from "../models/VehicleOwner.js";
import Rule from "../models/Rule.js";
import Evidence from "../models/Evidence.js";
import Fine from "../models/Fine.js";

// @desc    Upload evidence and detect violations
// @route   POST /api/violations/upload
// @access  Private (Police/Admin)
const uploadViolation = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { location, latitude, longitude, remarks } = req.body;
  let vehicleNumber = req.body.vehicleNumber;

  try {
    // 1. Call AI Service to detect violations AND vehicle number (OCR)
    const formData = new FormData();
    formData.append(
      "file",
      fs.createReadStream(req.file.path),
      req.file.originalname,
    );

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/detect`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
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

    // Normalize vehicle number for consistent matching (remove spaces/dashes)
    const normalizedNumber = vehicleNumber
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase();

    // 3. Find or create vehicle and owner
    // Search using a regex or by normalizing all numbers in DB (better to normalize input)
    // For now, let's try to match exactly or by normalized regex
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
    let owner;

    if (!vehicle) {
      // Vehicle not found in DB — create as Unregistered
      // Admin can later assign a real owner via the admin panel
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

    // 4. Process each detected violation
    const results = [];

    for (const dv of detectedViolations) {
      // Find matching rule
      const rule = await Rule.findOne({ violationType: dv.type });
      const fineAmount = rule ? rule.fineAmount : 500; // Default fine

      // Create Violation
      const violation = await Violation.create({
        vehicleId: vehicle._id,
        ownerId: actualOwnerId,
        policeId: req.user._id,
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

      // Create Evidence
      await Evidence.create({
        violationId: violation._id,
        imageUrl: req.file.path,
        cameraLocation: location || "Static Camera",
        uploadedBy: req.user._id,
      });

      // Create Fine
      const fine = await Fine.create({
        violationId: violation._id,
        amount: fineAmount,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        paymentStatus: "Pending",
      });

      results.push({ violation, fine });
    }

    res.status(201).json({
      message: "Detection and recording complete",
      vehicleNumber,
      results,
      meta,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error processing violation detection" });
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

    await Evidence.create({
      violationId: violation._id,
      imageUrl: req.file.path,
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
    const violations = await Violation.find()
      .populate("vehicleId")
      .populate("ownerId", "fullName email phone")
      .populate("ruleId")
      .sort({ createdAt: -1 })
      .limit(100);

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

    res.json(results);
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
