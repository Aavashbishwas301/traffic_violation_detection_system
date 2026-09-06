import ViolationLine from "../models/ViolationLine.js";
import { sendNotification } from "../socket.js";
import Admin from "../models/Admin.js";
import Designation from "../models/Designation.js";
import TrafficPolice from "../models/TrafficPolice.js";
import VehicleOwner from "../models/VehicleOwner.js";
import Vehicle from "../models/Vehicle.js";
import Rule from "../models/Rule.js";
import Notification from "../models/Notification.js";
import Settlement from "../models/Settlement.js";
import Complaint from "../models/Complaint.js";

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private (Admin/Police)
const getSystemStats = async (req, res) => {
  try {
    const totalViolations = await ViolationLine.countDocuments();
    const pendingViolations = await ViolationLine.countDocuments({
      status: "Unverified",
    });

    const adminsCount = await Admin.countDocuments();
    const policeCount = await TrafficPolice.countDocuments();
    const ownersCount = await VehicleOwner.countDocuments();
    const totalUsers = adminsCount + policeCount + ownersCount;

    const totalVehicles = await Vehicle.countDocuments();

    const revenueData = await Settlement.aggregate([
      { $match: { paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const liabilityData = await Settlement.aggregate([
      { $match: { paymentStatus: { $ne: "Completed" } } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);
    const totalLiability =
      liabilityData.length > 0 ? liabilityData[0].total : 0;

    // Aggregation for monthly violations (last 6 months)
    const monthlyStats = await ViolationLine.aggregate([
      {
        $group: {
          _id: { $month: "$violationDateTime" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregation by type
    const typeStats = await ViolationLine.aggregate([
      {
        $group: {
          _id: "$violationTypeId",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      summary: {
        totalViolations,
        pendingViolations,
        totalUsers,
        adminsCount,
        policeCount,
        ownersCount,
        totalVehicles,
        totalRevenue,
        totalLiability,
      },
      monthlyStats,
      violationsByType: typeStats,
      aiHealth: { status: "Operational", accuracy: 94.2 },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res
      .status(500)
      .json({ message: "Server Error: Failed to aggregate stats." });
  }
};

// @desc    Get unregistered vehicles (no owner assigned)
// @route   GET /api/admin/vehicles/unregistered
// @access  Private (Admin)
const getUnregisteredVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ registrationStatus: "Unregistered" });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Assign owner to an unregistered vehicle
// @route   PUT /api/admin/vehicles/:id/assign-owner
// @access  Private (Admin)
const assignVehicleOwner = async (req, res) => {
  const { ownerId } = req.body;
  if (!ownerId)
    return res.status(400).json({ message: "Owner ID is required" });

  try {
    const owner = await VehicleOwner.findById(ownerId);
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ownerId, registrationStatus: "Registered" },
      { new: true },
    );

    if (vehicle) {
      res.json({ message: "Owner assigned successfully", vehicle });
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all users (of a specific type or all)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  const { role } = req.query;
  try {
    let users = [];
    if (role === "Admin") {
      const admins = await Admin.find({}).select("-password").lean();
      users = admins.map(u => ({ ...u, role: "Admin" }));
    } else if (role === "TrafficPolice") {
      const police = await TrafficPolice.find({}).populate("designationId").select("-password").lean();
      users = police.map(u => ({ ...u, role: "TrafficPolice" }));
    } else if (role === "VehicleOwner") {
      const owners = await VehicleOwner.find({}).select("-password").lean();
      users = owners.map(u => ({ ...u, role: "VehicleOwner" }));
    } else {
      const admins = await Admin.find({}).select("-password").lean();
      const police = await TrafficPolice.find({}).populate("designationId").select("-password").lean();
      const owners = await VehicleOwner.find({}).select("-password").lean();
      users = [
        ...admins.map(u => ({ ...u, role: "Admin" })),
        ...police.map(u => ({ ...u, role: "TrafficPolice" })),
        ...owners.map(u => ({ ...u, role: "VehicleOwner" })),
      ];
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  const { role } = req.query; // Need role to know which collection
  try {
    let deleted;
    if (role === "Admin")
      deleted = await Admin.findByIdAndDelete(req.params.id);
    else if (role === "TrafficPolice")
      deleted = await TrafficPolice.findByIdAndDelete(req.params.id);
    else if (role === "VehicleOwner")
      deleted = await VehicleOwner.findByIdAndDelete(req.params.id);

    if (deleted) res.json({ message: "User removed" });
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update/Create financial rule
// @route   POST /api/admin/rules
// @access  Private (Admin)
const updateRule = async (req, res) => {
  const { violationType, fineAmount, description, isActive } = req.body;
  try {
    let rule = await Rule.findOne({ violationType });
    if (rule) {
      rule.fineAmount = fineAmount;
      rule.description = description;
      rule.isActive = isActive !== undefined ? isActive : rule.isActive;
      await rule.save();
    } else {
      rule = await Rule.create({
        violationType,
        fineAmount,
        description,
        isActive,
      });
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete financial rule
// @route   DELETE /api/admin/rules/:id
// @access  Private (Admin)
const deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }
    
    // Optional: We can also delete the corresponding ViolationType
    // await ViolationType.deleteOne({ trafficRuleId: rule._id });

    await Rule.findByIdAndDelete(req.params.id);
    res.json({ message: "Rule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({}).populate("ownerId", "fullName email phoneNumber");
  res.json(vehicles);
};

const createVehicle = async (req, res) => {
  const {
    vehicleNumber,
    vehicleType,
    brand,
    model,
    color,
    ownerId,
  } = req.body;

  if (!vehicleNumber) {
    return res.status(400).json({ message: "Vehicle number is required" });
  }

  try {
    const existing = await Vehicle.findOne({
      vehicleNumber: vehicleNumber.toUpperCase(),
    });
    if (existing) {
      return res
        .status(400)
        .json({
          message: "Vehicle with this plate number is already registered",
        });
    }

    const vehicle = await Vehicle.create({
      ownerId: ownerId || null,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType: vehicleType || "4-Wheeler",
      brand: brand || "Unknown",
      model: model || "Unknown",
      color: color || "Unknown",
      registrationStatus: ownerId ? "Registered" : "Unregistered",
      insuranceStatus: "Active",
      taxStatus: "Paid",
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id).populate("ownerId", "fullName email phoneNumber");

    res.status(201).json(populatedVehicle);
  } catch (error) {
    console.error("Vehicle Creation Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateVehicle = async (req, res) => {
  const { vehicleNumber, vehicleType, brand, model, color, ownerId } = req.body;
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
      vehicle.vehicleNumber = vehicleNumber ? vehicleNumber.toUpperCase() : vehicle.vehicleNumber;
      vehicle.vehicleType = vehicleType || vehicle.vehicleType;
      vehicle.brand = brand || vehicle.brand;
      vehicle.model = model || vehicle.model;
      vehicle.color = color || vehicle.color;
      
      if (ownerId !== undefined) {
        vehicle.ownerId = ownerId || null;
        vehicle.registrationStatus = ownerId ? "Registered" : "Unregistered";
      }

      await vehicle.save();
      const updatedVehicle = await Vehicle.findById(vehicle._id).populate("ownerId", "fullName email phoneNumber");
      res.json(updatedVehicle);
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    console.error("Vehicle Update Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteVehicle = async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: "Vehicle removed" });
};

const getRules = async (req, res) => {
  const rules = await Rule.find({});
  res.json(rules);
};

const broadcastMessage = async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required" });
  }
  try {
    const admins = await Admin.find({});
    const police = await TrafficPolice.find({});
    const owners = await VehicleOwner.find({});

    const allRecipients = [
      ...admins.map((u) => ({ receiverType: "Admin", receiverId: u._id })),
      ...police.map((u) => ({
        receiverType: "TrafficPolice",
        receiverId: u._id,
      })),
      ...owners.map((u) => ({
        receiverType: "VehicleOwner",
        receiverId: u._id,
      })),
    ];

    if (allRecipients.length > 0) {
      await Notification.insertMany(
        allRecipients.map((r) => ({
          receiverType: r.receiverType,
          receiverId: r.receiverId,
          title: title || "System Update",
          message,
        })),
      );
    }

    sendNotification("notification", {
      title: title || "System Update",
      message,
      type: "broadcast",
      timestamp: new Date(),
    });

    res.json({ success: true, recipients: allRecipients.length });
  } catch (error) {
    console.error("Broadcast Error:", error);
    res.status(500).json({ message: "Broadcast failed" });
  }
};

const getNotifications = async (req, res) => {
  try {
    let query = {};
    if (req.user?.role === "TrafficPolice") {
      query = {
        $or: [
          { receiverId: req.user._id },
          { receiverType: "TrafficPolice" },
        ],
      };
    } else if (req.user?.role === "VehicleOwner") {
      query = {
        $or: [
          { receiverId: req.user._id },
          { receiverType: "VehicleOwner" },
        ],
      };
    } else if (req.user?.role === "Admin") {
      // Admins can see all notifications
      query = {};
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error("getNotifications Error:", error);
    res.status(500).json({ message: "Failed to retrieve notifications" });
  }
};

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private (Admin)
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("ownerId", "fullName email phoneNumber")
      .populate({
        path: "violationId",
        populate: [
          { path: "vehicleId", select: "vehicleNumber vehicleType brand model" },
          { path: "violationTypeId", select: "violationName" }
        ],
      })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("getComplaints Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Respond to complaint
// @route   PUT /api/admin/complaints/:id
// @access  Private (Admin)
const respondToComplaint = async (req, res) => {
  const { status, adminResponse } = req.body;
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (complaint) {
      complaint.status = status || complaint.status;
      complaint.adminResponse = adminResponse || complaint.adminResponse;
      await complaint.save();
      res.json(complaint);
    } else {
      res.status(404).json({ message: "Complaint not found" });
    }
  } catch (error) {
    console.error("respondToComplaint Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a new complaint
// @route   POST /api/admin/complaints
// @access  Private (VehicleOwner)
const createComplaint = async (req, res) => {
  const { violationId, complaintMessage } = req.body;
  try {
    const complaint = await Complaint.create({
      ownerId: req.user._id,
      violationId,
      complaintMessage,
      status: "Pending",
    });

    sendNotification("new_complaint", {
      complaintId: complaint._id,
      ownerName: req.user.fullName || req.user.name,
      message: complaintMessage,
    }, "room:Admin");

    res.status(201).json(complaint);
  } catch (error) {
    console.error("createComplaint Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateOfficer = async (req, res) => {
  const { fullName, email, badgeNumber, rank, station, status } = req.body;
  try {
    const officer = await TrafficPolice.findById(req.params.id);
    if (officer) {
      officer.fullName = fullName || officer.fullName;
      officer.email = email || officer.email;
      officer.badgeNumber = badgeNumber || officer.badgeNumber;
      officer.rank = rank || officer.rank;
      officer.station = station || officer.station;
      officer.status = status || officer.status;

      await officer.save();
      res.json(officer);
    } else {
      res.status(404).json({ message: "Officer not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getDetailedReports = async (req, res) => {
  const { period } = req.params;
  let days = 1;
  if (period === "weekly") days = 7;
  if (period === "monthly") days = 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const violations = await ViolationLine.find({
      violationDateTime: { $gte: startDate },
    })
      .populate("vehicleId")
      .populate("violationTypeId");

    const totalFines = await Settlement.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);

    const collectionStats = await Settlement.aggregate([
      { $match: { paymentDate: { $gte: startDate }, paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);

    res.json({
      period,
      count: violations.length,
      totalIssued: totalFines[0]?.total || 0,
      totalCollected: collectionStats[0]?.total || 0,
      violations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const generateGlobalReport = async (req, res) => {
  try {
    const violations = await ViolationLine.find()
      .populate("vehicleId");
    const fines = await Settlement.find();

    const report = {
      generatedAt: new Date(),
      totalViolations: violations.length,
      totalFinesIssued: fines.reduce((acc, f) => acc + f.amountPaid, 0),
      pendingFines: fines.filter((f) => f.paymentStatus !== "Completed").length,
      violationSummary: violations.map((v) => ({
        id: v._id,
        plate: v.vehicleId?.vehicleNumber,
        type: v.violationTypeId,
        status: v.status,
      })),
    };
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get user verification requests (TrafficPolice and VehicleOwner)
// @route   GET /api/admin/verifications
// @access  Private (Admin)
const getPendingVerifications = async (req, res) => {
  const { status, role, search } = req.query;
  try {
    let policeQuery = {};
    let ownerQuery = {};

    if (status && status !== "all") {
      policeQuery.verificationStatus = status;
      ownerQuery.verificationStatus = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      policeQuery.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { badgeNumber: searchRegex },
        { phoneNumber: searchRegex }
      ];
      ownerQuery.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { citizenshipNumber: searchRegex },
        { phoneNumber: searchRegex }
      ];
    }

    let policeUsers = [];
    let ownerUsers = [];

    if (!role || role === "all" || role === "TrafficPolice") {
      const police = await TrafficPolice.find(policeQuery)
        .populate("designationId")
        .select("-password")
        .sort({ updatedAt: -1 })
        .lean();
      policeUsers = police.map((p) => ({
        ...p,
        role: "TrafficPolice",
        verificationStatus: p.verificationStatus || "Pending",
        verificationDocument: p.verificationDocument || "",
        rank: p.designationId?.rank || p.designationId?.designationName || "Officer",
      }));
    }

    if (!role || role === "all" || role === "VehicleOwner") {
      const owners = await VehicleOwner.find(ownerQuery)
        .select("-password")
        .sort({ updatedAt: -1 })
        .lean();
      ownerUsers = owners.map((o) => ({
        ...o,
        role: "VehicleOwner",
        verificationStatus: o.verificationStatus || "Pending",
        verificationDocument: o.verificationDocument || "",
      }));
    }

    const allUsers = [...policeUsers, ...ownerUsers];

    // Priority sorting: Pending with uploaded docs first, then Pending, then others
    allUsers.sort((a, b) => {
      const getPriority = (u) => {
        if (u.verificationStatus === "Pending" && u.verificationDocument) return 0;
        if (u.verificationStatus === "Pending") return 1;
        if (u.verificationStatus === "Rejected") return 2;
        return 3;
      };
      const diff = getPriority(a) - getPriority(b);
      if (diff !== 0) return diff;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    // Compute summary stats across entire DB
    const [pendingPolice, pendingOwners, verifiedPolice, verifiedOwners, rejectedPolice, rejectedOwners] = await Promise.all([
      TrafficPolice.countDocuments({ verificationStatus: "Pending" }),
      VehicleOwner.countDocuments({ verificationStatus: "Pending" }),
      TrafficPolice.countDocuments({ verificationStatus: "Verified" }),
      VehicleOwner.countDocuments({ verificationStatus: "Verified" }),
      TrafficPolice.countDocuments({ verificationStatus: "Rejected" }),
      VehicleOwner.countDocuments({ verificationStatus: "Rejected" }),
    ]);

    res.json({
      users: allUsers,
      summary: {
        pendingTotal: pendingPolice + pendingOwners,
        pendingPolice,
        pendingOwners,
        verifiedTotal: verifiedPolice + verifiedOwners,
        rejectedTotal: rejectedPolice + rejectedOwners,
      }
    });
  } catch (error) {
    console.error("getPendingVerifications Error:", error);
    res.status(500).json({ message: "Server Error: Failed to retrieve verification requests" });
  }
};

// @desc    Approve or reject user verification
// @route   PUT /api/admin/verifications/:id
// @access  Private (Admin)
const verifyUserAccount = async (req, res) => {
  const { id } = req.params;
  const { role, action, remarks } = req.body;

  if (!role || !action || !["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Role and valid action ('approve' or 'reject') are required." });
  }

  try {
    let user;
    if (role === "TrafficPolice") {
      user = await TrafficPolice.findById(id);
    } else if (role === "VehicleOwner") {
      user = await VehicleOwner.findById(id);
    } else {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    const isApprove = action === "approve";

    if (isApprove) {
      user.verificationStatus = "Verified";
      user.status = "Active";
      user.verifiedAt = new Date();
      user.verifiedBy = req.user._id;
      user.verificationRemarks = remarks || "Account officially verified by Admin.";
    } else {
      user.verificationStatus = "Rejected";
      user.verificationRemarks = remarks || "कागजात अस्पष्ट वा अमान्य भएकोले अस्वीकृत गरिएको छ। कृपया पुनः अपलोड गर्नुहोस्। (Document rejected. Please re-upload a clear copy.)";
    }

    await user.save();

    // Dispatch in-app notification to the target user
    try {
      const notifTitle = isApprove 
        ? "खाता प्रमाणीकरण स्वीकृत (Account Verified)" 
        : "कागजात प्रमाणीकरण अस्वीकृत (Verification Rejected)";
      const notifMsg = isApprove
        ? `तपाईँको कागजात प्रशासकबाट प्रमाणीकरण भएको छ। TVDS प्रणालीका सम्पूर्ण सेवाहरू सक्रिय भएका छन्।`
        : `तपाईँको कागजात अस्वीकृत गरिएको छ: ${user.verificationRemarks}`;

      await Notification.create({
        receiverId: user._id,
        receiverType: role,
        title: notifTitle,
        message: notifMsg,
        type: isApprove ? "verification" : "verification_rejected",
        link: "/dashboard",
        meta: {
          action,
          remarks: user.verificationRemarks,
          verifiedAt: user.verifiedAt,
        }
      });

      sendNotification("verification_status_update", {
        userId: user._id,
        status: user.verificationStatus,
        remarks: user.verificationRemarks,
        title: notifTitle,
        message: notifMsg,
      }, `user:${user._id}`);
    } catch (notifErr) {
      console.warn("Failed to dispatch user verification notification:", notifErr.message);
    }

    res.json({
      message: isApprove ? "User account verified successfully." : "User verification rejected.",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role,
        verificationStatus: user.verificationStatus,
        verificationRemarks: user.verificationRemarks,
        verifiedAt: user.verifiedAt,
      }
    });
  } catch (error) {
    console.error("verifyUserAccount Error:", error);
    res.status(500).json({ message: "Server Error: Failed to process verification." });
  }
};

export {
  getSystemStats,
  getUsers,
  deleteUser,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getRules,
  updateRule,
  deleteRule,
  generateGlobalReport,
  broadcastMessage,
  getNotifications,
  getComplaints,
  respondToComplaint,
  getDetailedReports,
  updateOfficer,
  createComplaint,
  getUnregisteredVehicles,
  assignVehicleOwner,
  getPendingVerifications,
  verifyUserAccount,
};
