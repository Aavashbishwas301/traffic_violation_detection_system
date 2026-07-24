import Admin from './models/Admin.js';
import Designation from './models/Designation.js';
import TrafficPolice from './models/TrafficPolice.js';
import VehicleOwner from './models/VehicleOwner.js';
import DrivingLicense from './models/DrivingLicense.js';
import Vehicle from './models/Vehicle.js';
import Rule from './models/Rule.js';
import ViolationType from './models/ViolationType.js';
import ViolationLine from './models/ViolationLine.js';
import Evidence from './models/Evidence.js';
import Settlement from './models/Settlement.js';
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
    await Designation.deleteMany();
    await TrafficPolice.deleteMany();
    await VehicleOwner.deleteMany();
    await DrivingLicense.deleteMany();
    await Vehicle.deleteMany();
    await Rule.deleteMany();
    await ViolationType.deleteMany();
    await ViolationLine.deleteMany();
    await Evidence.deleteMany();
    await Settlement.deleteMany();
    await Complaint.deleteMany();
    await Notification.deleteMany();

    console.log('Cleared all collections...');

    // 1. Create Admin
    const admin = await Admin.create({
      fullName: 'System Administrator',
      email: 'admin@example.com',
      password: 'password123',
      phoneNumber: '9851000000',
    });

    // 2. Create Designations
    const inspectorDesig = await Designation.create({
      designationCode: 'INSP-01',
      designationName: 'Inspector',
      rank: 'Inspector',
      department: 'Traffic Control',
      hierarchyLevel: 3,
      minimumServiceYears: 5,
    });

    // 3. Create Traffic Police
    const police = await TrafficPolice.create({
      fullName: 'Officer Rabin Thapa',
      email: 'police@example.com',
      password: 'password123',
      phoneNumber: '9841000001',
      badgeNumber: 'TP-2024-001',
      designationId: inspectorDesig._id,
      station: 'Metropolitan Traffic Police Division',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1985-05-15'),
      address: 'Kathmandu, Nepal',
      joiningDate: new Date('2010-01-01'),
    });

    // 4. Create Vehicle Owners
    const owner1 = await VehicleOwner.create({
      fullName: 'Suresh Kumar',
      email: 'owner@example.com',
      password: 'password123',
      phoneNumber: '9812000002',
      address: 'Koteshwor, Kathmandu',
      citizenshipNumber: '27-01-72-12345',
      gender: 'Male',
      dateOfBirth: new Date('1990-02-20'),
    });

    const owner2 = await VehicleOwner.create({
      fullName: 'Anita Sharma',
      email: 'anita@example.com',
      password: 'ownerpassword',
      phoneNumber: '9812000003',
      address: 'Lalitpur, Nepal',
      citizenshipNumber: '28-01-74-67890',
      gender: 'Female',
      dateOfBirth: new Date('1995-08-10'),
    });

    // 5. Create Driving Licenses
    await DrivingLicense.create({
      ownerId: owner1._id,
      licenseNumber: '01-01-00123456',
      licenseCategory: 'A, B',
      issueDate: new Date('2020-01-01'),
      expiryDate: new Date('2030-01-01'),
      status: 'Active'
    });

    // 6. Create Traffic Rules
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

    // 7. Create Violation Types
    const vTypeHelmet = await ViolationType.create({
        trafficRuleId: rule1._id,
        violationName: 'No Helmet',
        description: 'Riding without helmet on 2-wheeler',
        severityLevel: 'High',
        isAIEnabled: true
    });

    // 8. Create Vehicles
    const vehicle1 = await Vehicle.create({
      ownerId: owner1._id,
      vehicleNumber: 'BA 2 PA 1234',
      vehicleType: 'Bike',
      vehicleCategory: 'Private',
      brand: 'Bajaj',
      model: 'Pulsar 220',
      color: 'Black',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS123456',
      manufactureYear: 2021,
      registrationDate: new Date('2021-01-01'),
      registrationExpiryDate: new Date('2031-01-01'),
      insuranceStatus: 'Active',
      insuranceExpiryDate: new Date('2025-01-01'),
      taxStatus: 'Paid',
      taxExpiryDate: new Date('2025-01-01'),
    });

    // 9. Create a Violation Line
    const violationLine = await ViolationLine.create({
      violationTypeId: vTypeHelmet._id,
      vehicleId: vehicle1._id,
      policeId: police._id,
      location: 'New Road Intersection',
      latitude: 27.7042,
      longitude: 85.3129,
      aiDetected: true,
      aiConfidence: 0.92,
      appliedFineAmount: 1000,
      status: 'Verified',
      remarks: 'Detected by North Camera 02',
      violationDateTime: new Date(),
      verifiedAt: new Date()
    });

    // 10. Create Evidence
    await Evidence.create({
        violationLineId: violationLine._id,
        evidenceType: 'Image',
        imageUrl: 'uploads/sample_no_helmet.jpg',
        cameraLocation: 'New Road North',
        cameraId: 'CAM-02',
        captureTime: new Date(),
    });

    // 11. Create Settlement
    await Settlement.create({
        violationLineId: violationLine._id,
        policeId: police._id,
        amountPaid: 1000,
        paymentMethod: 'eSewa',
        transactionId: 'TXN123456789',
        receiptNumber: 'RCPT-001',
        paymentStatus: 'Completed',
        paymentDate: new Date(),
        remarks: 'Paid on time'
    });

    // 12. Create Notification
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
