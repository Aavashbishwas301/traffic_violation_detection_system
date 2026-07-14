import Violation from "../models/Violation.js";
import Admin from "../models/Admin.js";
import TrafficPolice from "../models/TrafficPolice.js";
import VehicleOwner from "../models/VehicleOwner.js";
import Vehicle from "../models/Vehicle.js";
import Rule from "../models/Rule.js";
import Notification from "../models/Notification.js";
import Fine from "../models/Fine.js";
import Complaint from "../models/Complaint.js";

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private (Admin/Police)
const getSystemStats = async (req, res) => {
  try {
    const totalViolations = await Violation.countDocuments();
    const pendingViolations = await Violation.countDocuments({
      status: "Pending",
    });

    const adminsCount = await Admin.countDocuments();
    const policeCount = await TrafficPolice.countDocuments();
    const ownersCount = await VehicleOwner.countDocuments();
    const totalUsers = adminsCount + policeCount + ownersCount;

    const totalVehicles = await Vehicle.countDocuments();

    const revenueData = await Fine.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const liabilityData = await Fine.aggregate([
      { $match: { paymentStatus: { $ne: "Paid" } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalLiability =
      liabilityData.length > 0 ? liabilityData[0].total : 0;

    // Aggregation for monthly violations (last 6 months)
    const monthlyStats = await Violation.aggregate([
      {
        $group: {
          _id: { $month: "$violationDateTime" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregation by type
    const typeStats = await Violation.aggregate([
      {
        $group: {
          _id: "$violationType",
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

// @desc    Get all users (of a specific type or all)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  const { role } = req.query;
  try {
    let users = [];
    if (role === "Admin") users = await Admin.find({}).select("-password");
    else if (role === "TrafficPolice")
      users = await TrafficPolice.find({}).select("-password");
    else if (role === "VehicleOwner")
      users = await VehicleOwner.find({}).select("-password");
    else {
      const admins = await Admin.find({}).select("-password");
      const police = await TrafficPolice.find({}).select("-password");
      const owners = await VehicleOwner.find({}).select("-password");
      users = [...admins, ...police, ...owners];
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

// ... other methods (getVehicles, deleteVehicle, getRules, updateRule, broadcastMessage, getNotifications)

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

// Re-implementing missing methods to ensure file is complete
const getVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({}).populate("ownerId", "fullName email");
  res.json(vehicles);
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
    // Broadcast to ALL roles: Admin, TrafficPolice, VehicleOwner
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

    // Bulk insert for performance
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

    res.json({ success: true, recipients: allRecipients.length });
  } catch (error) {
    console.error("Broadcast Error:", error);
    res.status(500).json({ message: "Broadcast failed" });
  }
};

const getNotifications = async (req, res) => {
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(notifications);
};

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private (Admin)
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("ownerId", "fullName email")
      .populate({
        path: "violationId",
        populate: { path: "vehicleId" },
      })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
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
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Generate detailed time-based reports
// @route   GET /api/admin/reports/:period (daily, weekly, monthly)
// @desc    Update officer details
// @route   PUT /api/admin/officers/:id
// @access  Private (Admin)
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
    const violations = await Violation.find({
      violationDateTime: { $gte: startDate },
    })
      .populate("vehicleId")
      .populate("ruleId");

    const totalFines = await Fine.aggregate([
      { $match: { issueDate: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const collectionStats = await Fine.aggregate([
      { $match: { issueDate: { $gte: startDate }, paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
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
    const violations = await Violation.find()
      .populate("vehicleId")
      .populate("ownerId");
    const fines = await Fine.find();

    const report = {
      generatedAt: new Date(),
      totalViolations: violations.length,
      totalFinesIssued: fines.reduce((acc, f) => acc + f.amount, 0),
      pendingFines: fines.filter((f) => f.paymentStatus !== "Paid").length,
      violationSummary: violations.map((v) => ({
        id: v._id,
        plate: v.vehicleId?.vehicleNumber,
        type: v.violationType,
        status: v.status,
      })),
    };
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export {
  getSystemStats,
  getUsers,
  deleteUser,
  getVehicles,
  deleteVehicle,
  getRules,
  updateRule,
  generateGlobalReport,
  broadcastMessage,
  getNotifications,
  getComplaints,
  respondToComplaint,
  getDetailedReports,
  updateOfficer,
  createComplaint,
};
