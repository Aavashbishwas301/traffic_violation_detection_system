import Admin from '../models/Admin.js';
import TrafficPolice from '../models/TrafficPolice.js';
import VehicleOwner from '../models/VehicleOwner.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  console.log(`Auth attempt: ${normalizedEmail}`);

  let user = await Admin.findOne({ email: normalizedEmail });
  let role = 'Admin';

  if (!user) {
    user = await TrafficPolice.findOne({ email: normalizedEmail });
    role = 'TrafficPolice';
  }
  if (!user) {
    user = await VehicleOwner.findOne({ email: normalizedEmail });
    role = 'VehicleOwner';
  }

  if (user) {
    const isMatch = await user.matchPassword(trimmedPassword);
    console.log(`User found: ${user.email}, Role: ${role}, Match: ${isMatch}`);
    
    if (isMatch) {
        // Update lastLogin if admin
        if (role === 'Admin') {
            user.lastLogin = Date.now();
            await user.save();
        }

        return res.json({
            _id: user._id,
            name: user.fullName,
            email: user.email,
            role: role,
            token: generateToken(user._id, role),
            badgeNumber: user.badgeNumber,
            rank: user.rank,
            station: user.station,
            phone: user.phone,
            designation: user.designation,
            joiningDate: user.joiningDate,
            profilePhoto: user.profilePhoto
        });
    }
  } else {
      console.log(`User not found: ${normalizedEmail}`);
  }

  res.status(401).json({ message: 'Invalid email or password' });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { fullName, email, password, role, phone, badgeNumber, citizenshipNumber, address } = req.body;
  const normalizedEmail = email.toLowerCase();

  const adminExists = await Admin.findOne({ email: normalizedEmail });
  const policeExists = await TrafficPolice.findOne({ email: normalizedEmail });
  const ownerExists = await VehicleOwner.findOne({ email: normalizedEmail });

  if (adminExists || policeExists || ownerExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  let user;
  const targetRole = role || 'VehicleOwner';

  if (targetRole === 'Admin') {
    user = await Admin.create({ fullName, email: normalizedEmail, password, phone });
  } else if (targetRole === 'TrafficPolice') {
    user = await TrafficPolice.create({ fullName, email: normalizedEmail, password, phone, badgeNumber });
  } else {
    user = await VehicleOwner.create({ fullName, email: normalizedEmail, password, phone, citizenshipNumber, address });
  }

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.fullName,
      email: user.email,
      role: targetRole,
      token: generateToken(user._id, targetRole),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user is already populated by authMiddleware based on role
  if (req.user) {
    const profile = {
      _id: req.user._id,
      name: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      profilePhoto: req.user.profilePhoto
    };

    if (req.user.role === 'TrafficPolice') {
        profile.badgeNumber = req.user.badgeNumber;
        profile.rank = req.user.rank;
        profile.station = req.user.station;
        profile.designation = req.user.designation;
        profile.joiningDate = req.user.joiningDate;
        profile.status = req.user.status;
    }

    res.json(profile);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  let user;
  if (req.user.role === 'Admin') user = await Admin.findById(req.user._id);
  else if (req.user.role === 'TrafficPolice') user = await TrafficPolice.findById(req.user._id);
  else if (req.user.role === 'VehicleOwner') user = await VehicleOwner.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      role: req.user.role,
      token: generateToken(updatedUser._id, req.user.role),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { authUser, registerUser, getUserProfile, updateUserProfile };
