import Vehicle from '../models/Vehicle.js';
import Violation from '../models/Violation.js';

// @desc    Get vehicle by number
// @route   GET /api/vehicles/:number
// @access  Private (Police/Admin)
const getVehicleByNumber = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ vehicleNumber: req.params.number }).populate('ownerId');
    if (vehicle) {
      // Find violations for this vehicle
      const history = await Violation.find({ vehicleId: vehicle._id }).sort({ createdAt: -1 });
      res.json({ vehicle, history });
    } else {
      res.status(404).json({ message: 'Vehicle not found in database.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
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
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getVehicleByNumber, getMyVehicles };
