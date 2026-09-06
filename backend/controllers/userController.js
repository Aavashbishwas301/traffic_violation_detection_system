import Admin from '../models/Admin.js';
import TrafficPolice from '../models/TrafficPolice.js';
import VehicleOwner from '../models/VehicleOwner.js';
import Notification from '../models/Notification.js';
import { sendNotification } from '../socket.js';
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
            verificationStatus: role === 'Admin' ? 'Verified' : (user.verificationStatus || 'Pending'),
            verificationDocument: user.verificationDocument || '',
            verificationRemarks: user.verificationRemarks || '',
            verifiedAt: user.verifiedAt,
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
    user = await TrafficPolice.create({ 
      fullName, 
      email: normalizedEmail, 
      password, 
      phoneNumber, 
      badgeNumber, 
      designationId, 
      gender, 
      dateOfBirth, 
      address,
      verificationStatus: 'Pending',
      verificationDocument: '',
      verificationRemarks: ''
    });
  } else {
    user = await VehicleOwner.create({ 
      fullName, 
      email: normalizedEmail, 
      password, 
      phoneNumber, 
      citizenshipNumber, 
      address, 
      gender, 
      dateOfBirth,
      verificationStatus: 'Pending',
      verificationDocument: '',
      verificationRemarks: ''
    });
  }

  if (user) {
    // Notify admin about new registration pending document verification
    try {
      await Notification.create({
        receiverType: 'Admin',
        title: 'नयाँ प्रयोगकर्ता दर्ता (New Registration)',
        message: `${user.fullName} (${targetRole === 'TrafficPolice' ? 'प्रहरी अधिकृत' : 'सवारी धनी'}) ले नयाँ खाता दर्ता गर्नुभएको छ। प्रमाणीकरण आवश्यक छ।`,
        type: 'registration',
        link: '/verifications',
        meta: {
          userId: user._id,
          role: targetRole,
        }
      });
    } catch (e) {
      console.warn('Notification log error:', e.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.fullName,
      email: user.email,
      role: targetRole,
      verificationStatus: user.verificationStatus || 'Pending',
      verificationDocument: user.verificationDocument || '',
      verificationRemarks: user.verificationRemarks || '',
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
      verificationStatus: req.user.role === 'Admin' ? 'Verified' : (req.user.verificationStatus || 'Pending'),
      verificationDocument: req.user.verificationDocument || '',
      verificationRemarks: req.user.verificationRemarks || '',
      verifiedAt: req.user.verifiedAt,
      verifiedBy: req.user.verifiedBy,
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
      verificationStatus: req.user.role === 'Admin' ? 'Verified' : (updatedUser.verificationStatus || 'Pending'),
      verificationDocument: updatedUser.verificationDocument || '',
      verificationRemarks: updatedUser.verificationRemarks || '',
      verifiedAt: updatedUser.verifiedAt,
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

// @desc    Upload verification document (Citizenship or Police ID)
// @route   POST /api/users/upload-document
// @access  Private
const uploadVerificationDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document file provided.' });
    }

    const documentUrl = req.file.location || `/uploads/${req.file.filename}`;

    let user;
    if (req.user.role === 'TrafficPolice') {
      user = await TrafficPolice.findById(req.user._id);
    } else if (req.user.role === 'VehicleOwner') {
      user = await VehicleOwner.findById(req.user._id);
    } else {
      return res.status(400).json({ message: 'Only Traffic Police and Vehicle Owners require document verification.' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    user.verificationDocument = documentUrl;
    user.verificationStatus = 'Pending';
    user.verificationRemarks = '';
    await user.save();

    // Create system notification for Admin
    try {
      await Notification.create({
        receiverType: 'Admin',
        title: 'कागजात प्रमाणीकरण अनुरोध (New Verification Document)',
        message: `${user.fullName} (${req.user.role === 'TrafficPolice' ? 'प्रहरी अधिकृत' : 'सवारी धनी'}) ले प्रमाणीकरणका लागि कागजात पेश गर्नुभएको छ।`,
        type: 'verification_request',
        link: '/verifications',
        meta: {
          userId: user._id,
          role: req.user.role,
          documentUrl,
        }
      });

      sendNotification('new_verification_request', {
        userId: user._id,
        userName: user.fullName,
        role: req.user.role,
        documentUrl,
        message: `New verification document submitted by ${user.fullName}`,
      }, 'room:Admin');
    } catch (notifErr) {
      console.warn('Failed to dispatch notification for document upload:', notifErr.message);
    }

    res.json({
      message: 'Document uploaded successfully. Your submission is now under administrator review.',
      verificationDocument: user.verificationDocument,
      verificationStatus: user.verificationStatus,
      verificationRemarks: user.verificationRemarks,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Failed to upload verification document.' });
  }
};

export { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  uploadVerificationDocument 
};
