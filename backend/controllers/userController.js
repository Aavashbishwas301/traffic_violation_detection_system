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

        const responseData = {
            _id: user._id,
            name: user.fullName,
            email: user.email,
            role: role,
            token: generateToken(user._id, role),
            phoneNumber: user.phoneNumber,
            profilePhoto: user.profilePhoto,
            status: user.status,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        if (role === 'TrafficPolice') {
            responseData.badgeNumber = user.badgeNumber;
            responseData.rank = user.rank;
            responseData.station = user.station;
            responseData.designationId = user.designationId;
            responseData.joiningDate = user.joiningDate;
        } else if (role === 'VehicleOwner') {
            responseData.citizenshipNumber = user.citizenshipNumber;
            responseData.address = user.address;
            responseData.gender = user.gender;
            responseData.dateOfBirth = user.dateOfBirth;
        }

        return res.json(responseData);
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
  const { fullName, email, password, role, phoneNumber, badgeNumber, citizenshipNumber, address, gender, dateOfBirth, designationId } = req.body;
  const normalizedEmail = email.toLowerCase();

  const adminExists = await Admin.findOne({ email: normalizedEmail });
  const policeExists = await TrafficPolice.findOne({ email: normalizedEmail });
  const ownerExists = await VehicleOwner.findOne({ email: normalizedEmail });

  if (adminExists || policeExists || ownerExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  if (role === 'Admin') {
    return res.status(403).json({
      message: 'System Administrator accounts cannot be created via public registration. There is only one master Administrator.'
    });
  }

  let user;
  const targetRole = role === 'TrafficPolice' ? 'TrafficPolice' : 'VehicleOwner';

  if (targetRole === 'TrafficPolice') {
    user = await TrafficPolice.create({ fullName, email: normalizedEmail, password, phoneNumber, badgeNumber, designationId, gender, dateOfBirth, address });
  } else {
    user = await VehicleOwner.create({ fullName, email: normalizedEmail, password, phoneNumber, citizenshipNumber, address, gender, dateOfBirth });
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
      phoneNumber: req.user.phoneNumber,
      profilePhoto: req.user.profilePhoto,
      status: req.user.status,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    if (req.user.role === 'TrafficPolice') {
        profile.badgeNumber = req.user.badgeNumber;
        profile.rank = req.user.rank;
        profile.station = req.user.station;
        profile.designationId = req.user.designationId;
        profile.joiningDate = req.user.joiningDate;
    } else if (req.user.role === 'VehicleOwner') {
        profile.citizenshipNumber = req.user.citizenshipNumber;
        profile.address = req.user.address;
        profile.gender = req.user.gender;
        profile.dateOfBirth = req.user.dateOfBirth;
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
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    if (req.user.role === 'VehicleOwner') {
      user.address = req.body.address || user.address;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    const responseData = {
      _id: updatedUser._id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      role: req.user.role,
      token: generateToken(updatedUser._id, req.user.role),
      phoneNumber: updatedUser.phoneNumber,
      status: updatedUser.status,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    if (req.user.role === 'VehicleOwner') {
      responseData.citizenshipNumber = updatedUser.citizenshipNumber;
      responseData.address = updatedUser.address;
      responseData.gender = updatedUser.gender;
      responseData.dateOfBirth = updatedUser.dateOfBirth;
    }

    res.json(responseData);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { authUser, registerUser, getUserProfile, updateUserProfile };
