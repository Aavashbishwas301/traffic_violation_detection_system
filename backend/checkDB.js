import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import TrafficPolice from './models/TrafficPolice.js';
import VehicleOwner from './models/VehicleOwner.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admins = await Admin.find({});
    console.log('\nAdmins:');
    admins.forEach(u => console.log(`- ${u.email} (${u.fullName})`));

    const police = await TrafficPolice.find({});
    console.log('\nTraffic Police:');
    police.forEach(u => console.log(`- ${u.email} (${u.fullName})`));

    const owners = await VehicleOwner.find({});
    console.log('\nVehicle Owners:');
    owners.forEach(u => console.log(`- ${u.email} (${u.fullName})`));

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUsers();
