import Admin from './models/Admin.js';
import TrafficPolice from './models/TrafficPolice.js';
import VehicleOwner from './models/VehicleOwner.js';
import DrivingLicense from './models/DrivingLicense.js';
import Vehicle from './models/Vehicle.js';
import Rule from './models/Rule.js';
import Violation from './models/Violation.js';
import Evidence from './models/Evidence.js';
import Fine from './models/Fine.js';
import Payment from './models/Payment.js';
import Complaint from './models/Complaint.js';
import Notification from './models/Notification.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Admin.deleteMany();
    await TrafficPolice.deleteMany();
    await VehicleOwner.deleteMany();
    await DrivingLicense.deleteMany();
    await Vehicle.deleteMany();
    await Rule.deleteMany();
    await Violation.deleteMany();
    await Evidence.deleteMany();
    await Fine.deleteMany();
    await Payment.deleteMany();
    await Complaint.deleteMany();
    await Notification.deleteMany();

    console.log('Cleared all collections...');

    // 1. Create Admin
    const admin = await Admin.create({
      fullName: 'System Administrator',
      email: 'admin@example.com',
      password: 'password123',
      phone: '9851000000',
    });

    // 2. Create Traffic Police
    const police = await TrafficPolice.create({
      fullName: 'Officer Rabin Thapa',
      email: 'police@example.com',
      password: 'password123',
      phone: '9841000001',
      badgeNumber: 'TP-2024-001',
      rank: 'Inspector',
      station: 'Metropolitan Traffic Police Division',
      status: 'Active'
    });

    // 3. Create Vehicle Owners
    const owner1 = await VehicleOwner.create({
      fullName: 'Suresh Kumar',
      email: 'owner@example.com',
      password: 'password123',
      phone: '9812000002',
      address: 'Koteshwor, Kathmandu',
      citizenshipNumber: '27-01-72-12345'
    });

    const owner2 = await VehicleOwner.create({
      fullName: 'Anita Sharma',
      email: 'anita@example.com',
      password: 'ownerpassword',
      phone: '9812000003',
      address: 'Lalitpur, Nepal',
      citizenshipNumber: '28-01-74-67890'
    });

    // 4. Create Driving Licenses
    await DrivingLicense.create({
      ownerId: owner1._id,
      licenseNumber: '01-01-00123456',
      licenseCategory: 'A, B',
      issueDate: new Date('2020-01-01'),
      expiryDate: new Date('2030-01-01'),
      status: 'Active'
    });

    // 5. Create Rules
    const rule1 = await Rule.create({
        violationType: 'No Helmet',
        description: 'Riding a motorcycle without a protective helmet.',
        fineAmount: 1000
    });

    const rule2 = await Rule.create({
        violationType: 'Traffic Light',
        description: 'Jumping a red traffic light signal.',
        fineAmount: 500
    });

    const rule3 = await Rule.create({
        violationType: 'Triple Riding',
        description: 'More than two people on a two-wheeler.',
        fineAmount: 1500
    });

    // 6. Create Vehicles
    const vehicle1 = await Vehicle.create({
      ownerId: owner1._id,
      vehicleNumber: 'BA 2 PA 1234',
      vehicleType: 'Bike',
      brand: 'Bajaj',
      model: 'Pulsar 220',
      color: 'Black',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS123456',
      manufactureYear: 2021
    });

    const vehicle2 = await Vehicle.create({
        ownerId: owner2._id,
        vehicleNumber: 'BA 3 CHA 5678',
        vehicleType: 'Car',
        brand: 'Hyundai',
        model: 'Creta',
        color: 'White',
        engineNumber: 'ENG67890',
        chassisNumber: 'CHS67890',
        manufactureYear: 2022
      });

    // 7. Create a Violation
    const violation = await Violation.create({
      vehicleId: vehicle1._id,
      ownerId: owner1._id,
      policeId: police._id,
      ruleId: rule1._id,
      violationType: 'No Helmet',
      location: 'New Road Intersection',
      aiDetected: true,
      aiConfidence: 0.92,
      status: 'Verified',
      remarks: 'Detected by North Camera 02'
    });

    // 8. Create Evidence
    await Evidence.create({
        violationId: violation._id,
        imageUrl: 'uploads/sample_no_helmet.jpg',
        cameraLocation: 'New Road North',
        uploadedBy: police._id
    });

    // 9. Create Fine
    const fine = await Fine.create({
        violationId: violation._id,
        amount: rule1.fineAmount,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days later
        paymentStatus: 'Pending'
    });

    // 10. Create Notification
    await Notification.create({
        receiverType: 'VehicleOwner',
        receiverId: owner1._id,
        title: 'New Traffic Violation Recorded',
        message: 'A violation of type "No Helmet" has been recorded for your vehicle BA 2 PA 1234.'
    });

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
