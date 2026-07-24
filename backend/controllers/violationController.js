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
    const fileUri = req.file.location || req.file.path;

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
      violationDateTime: Date.now()
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

    const results = await Promise.all(
      violations.map(async (v) => {
        const settlement = await Settlement.findOne({ violationLineId: v._id });
        const evidence = await Evidence.findOne({ violationLineId: v._id });
        return {
          ...v._doc,
          fine: settlement,
          imageUrl: evidence ? evidence.imageUrl : null,
          evidenceUrl: evidence ? evidence.imageUrl : null,
          violationType: v.violationTypeId?.violationName,
          ruleId: v.violationTypeId?.trafficRuleId,
          ownerId: v.vehicleId?.ownerId
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
    const myVehicles = await Vehicle.find({ ownerId: req.user._id });
    const vehicleIds = myVehicles.map(v => v._id);

    const violations = await ViolationLine.find({ vehicleId: { $in: vehicleIds } })
      .populate("vehicleId")
      .populate("violationTypeId")
      .sort({ createdAt: -1 });

    const results = await Promise.all(
      violations.map(async (v) => {
        const settlement = await Settlement.findOne({ violationLineId: v._id });
        const evidence = await Evidence.findOne({ violationLineId: v._id });
        return {
          ...v._doc,
          fine: settlement,
          imageUrl: evidence ? evidence.imageUrl : null,
          evidenceUrl: evidence ? evidence.imageUrl : null,
          violationType: v.violationTypeId?.violationName,
          ruleId: v.violationTypeId?.trafficRuleId,
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
    const violation = await ViolationLine.findById(req.params.id).populate('violationTypeId');
    if (violation) {
      violation.status = req.body.status || violation.status;
      violation.remarks = req.body.remarks || violation.remarks;

      if (req.body.status === "Verified") {
        violation.verifiedAt = Date.now();

        const existingSettlement = await Settlement.findOne({ violationLineId: violation._id });
        if (!existingSettlement) {
          const rule = await Rule.findById(violation.violationTypeId?.trafficRuleId);
          await Settlement.create({
            violationLineId: violation._id,
            policeId: req.user._id,
            amountPaid: 0,
            paymentMethod: "N/A",
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

export {
  uploadViolation,
  manualViolation,
  getViolations,
  getMyViolations,
  updateViolation,
  deleteViolation,
};
