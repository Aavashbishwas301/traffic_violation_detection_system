import Vehicle from "../models/Vehicle.js";
import ViolationLine from "../models/ViolationLine.js";

// @desc    Get vehicle by number
// @route   GET /api/vehicles/:number
// @access  Private (Police/Admin)
const getVehicleByNumber = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      vehicleNumber: req.params.number,
    }).populate("ownerId");
    if (vehicle) {
      // Find violations for this vehicle
      const history = await ViolationLine.find({ vehicleId: vehicle._id }).sort({
        createdAt: -1,
      });
      res.json({ vehicle, history });
    } else {
      res.status(404).json({ message: "Vehicle not found in database." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get my vehicles
// @route   GET /api/vehicles/my
// @access  Private (VehicleOwner)
const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user._id });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Register a new vehicle
// @route   POST /api/vehicles
// @access  Private (VehicleOwner)
const registerVehicle = async (req, res) => {
  const {
    vehicleNumber,
    vehicleType,
    brand,
    model,
    color,
    engineNumber,
    chassisNumber,
    manufactureYear,
    insuranceStatus,
    taxStatus,
  } = req.body;

  if (!vehicleNumber) {
    return res.status(400).json({ message: "Vehicle number is required" });
  }

  try {
    // Check if vehicle already exists
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
      ownerId: req.user._id,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType: vehicleType || "4-Wheeler",
      brand: brand || "Unknown",
      model: model || "Unknown",
      color: color || "Unknown",
      engineNumber,
      chassisNumber,
      manufactureYear,
      insuranceStatus: insuranceStatus || "Active",
      taxStatus: taxStatus || "Paid",
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Vehicle Registration Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export { getVehicleByNumber, getMyVehicles, registerVehicle };
