import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await Admin.findOne({ email: 'admin@tvds.gov' });
    
    if (!admin) {
      console.log('Admin not found');
      process.exit();
    }

    const isMatch = await admin.matchPassword('adminpassword');
    console.log('Password match test for "adminpassword":', isMatch);

    const manualMatch = await bcrypt.compare('adminpassword', admin.password);
    console.log('Manual bcrypt compare test:', manualMatch);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testLogin();
