import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import TrafficPolice from '../models/TrafficPolice.js';
import VehicleOwner from '../models/VehicleOwner.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'Admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'TrafficPolice') {
        req.user = await TrafficPolice.findById(decoded.id).select('-password');
      } else if (decoded.role === 'VehicleOwner') {
        req.user = await VehicleOwner.findById(decoded.id).select('-password');
      }

      if (req.user) {
        req.user.role = decoded.role;
        next();
      } else {
        res.status(401).json({ message: 'Not authorized, user not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const police = (req, res, next) => {
  if (req.user && (req.user.role === 'TrafficPolice' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as traffic police' });
  }
};

export { protect, admin, police };
