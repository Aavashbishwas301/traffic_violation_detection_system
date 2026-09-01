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
      email: 'bishwasaavash@gmail.com',
      password: 'password123',
      phoneNumber: '9851000000',
    });

    // 2. Create Designations
    const dspDesig = await Designation.create({
      designationCode: 'DSP-01',
      designationName: 'Deputy Superintendent of Police',
      rank: 'Deputy Superintendent of Police',
      department: 'Traffic Administration & Operations',
      hierarchyLevel: 1,
      minimumServiceYears: 10,
    });

    const inspectorDesig = await Designation.create({
      designationCode: 'INSP-01',
      designationName: 'Inspector',
      rank: 'Inspector',
      department: 'Traffic Enforcement & Field Operations',
      hierarchyLevel: 2,
      minimumServiceYears: 5,
    });

    const siDesig = await Designation.create({
      designationCode: 'SI-01',
      designationName: 'Sub-Inspector',
      rank: 'Sub-Inspector',
      department: 'CCTV Surveillance & Digital Monitoring',
      hierarchyLevel: 3,
      minimumServiceYears: 3,
    });

    const asiDesig = await Designation.create({
      designationCode: 'ASI-01',
      designationName: 'Assistant Sub-Inspector',
      rank: 'Assistant Sub-Inspector',
      department: 'On-Field Patrol & Quick Response',
      hierarchyLevel: 4,
      minimumServiceYears: 2,
    });

    const hcDesig = await Designation.create({
      designationCode: 'HC-01',
      designationName: 'Head Constable',
      rank: 'Head Constable',
      department: 'Verification & Citation Desk',
      hierarchyLevel: 5,
      minimumServiceYears: 1,
    });

    // 3. Create Traffic Police Officers with Different Ranks
    const police = await TrafficPolice.create({
      fullName: 'Inspector Rabin Thapa',
      email: 'police@example.com',
      password: 'password123',
      phoneNumber: '9841000001',
      badgeNumber: 'TP-2024-001',
      designationId: inspectorDesig._id,
      station: 'Metropolitan Traffic Police Division, Baggikhana',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1985-05-15'),
      address: 'Kathmandu, Nepal',
      joiningDate: new Date('2010-01-01'),
    });

    const policeDSP = await TrafficPolice.create({
      fullName: 'DSP Bikram Shrestha',
      email: 'dsp.shrestha@example.com',
      password: 'password123',
      phoneNumber: '9851000002',
      badgeNumber: 'TP-2024-002',
      designationId: dspDesig._id,
      station: 'Central Traffic Command & Control Center',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1978-11-20'),
      address: 'Lalitpur, Nepal',
      joiningDate: new Date('2003-04-15'),
    });

    const policeSI = await TrafficPolice.create({
      fullName: 'SI Priya Adhikari',
      email: 'si.priya@example.com',
      password: 'password123',
      phoneNumber: '9841000003',
      badgeNumber: 'TP-2024-003',
      designationId: siDesig._id,
      station: 'Maitighar Traffic Control Sector',
      status: 'Active',
      gender: 'Female',
      dateOfBirth: new Date('1992-03-10'),
      address: 'Baneshwor, Kathmandu',
      joiningDate: new Date('2016-08-01'),
    });

    const policeASI = await TrafficPolice.create({
      fullName: 'ASI Roshan Karki',
      email: 'asi.roshan@example.com',
      password: 'password123',
      phoneNumber: '9841000004',
      badgeNumber: 'TP-2024-004',
      designationId: asiDesig._id,
      station: 'Koteshwor Traffic Post',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1994-07-25'),
      address: 'Bhaktapur, Nepal',
      joiningDate: new Date('2018-12-10'),
    });

    const policeHC = await TrafficPolice.create({
      fullName: 'HC Suresh Bista',
      email: 'hc.bista@example.com',
      password: 'password123',
      phoneNumber: '9841000005',
      badgeNumber: 'TP-2024-005',
      designationId: hcDesig._id,
      station: 'Kalanki Traffic Sector',
      status: 'Active',
      gender: 'Male',
      dateOfBirth: new Date('1996-09-18'),
      address: 'Kalanki, Kathmandu',
      joiningDate: new Date('2020-02-15'),
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

    // 6. Create Traffic Rules (According to Nepal Traffic Police Guidelines)
    const rule1 = await Rule.create({ violationType: 'No Helmet', description: 'Riding a two-wheeler without a protective helmet.', fineAmount: 500 });
    const rule2 = await Rule.create({ violationType: 'Traffic Light', description: 'Disobeying traffic signals (Red light jump).', fineAmount: 500 });
    const rule3 = await Rule.create({ violationType: 'Zebra Crossing', description: 'Stopping on or encroaching a zebra crossing.', fineAmount: 500 });
    const rule4 = await Rule.create({ violationType: 'Sidewalk Encroachment', description: 'Driving or parking on a pedestrian pavement/sidewalk.', fineAmount: 1000 });
    const rule5 = await Rule.create({ violationType: 'Wrong Way', description: 'Driving in the opposite direction of traffic flow (One-way violation).', fineAmount: 1000 });
    const rule6 = await Rule.create({ violationType: 'Triple Riding', description: 'Carrying more than one pillion passenger on a two-wheeler.', fineAmount: 500 });
    const rule7 = await Rule.create({ violationType: 'Drink Driving (MaPaSe)', description: 'Driving under the influence of alcohol.', fineAmount: 1000 });
    const rule8 = await Rule.create({ violationType: 'Over Speeding', description: 'Exceeding the designated speed limit.', fineAmount: 1000 });
    const rule9 = await Rule.create({ violationType: 'Mobile Phone Use', description: 'Using a mobile phone while driving.', fineAmount: 500 });
    const rule10 = await Rule.create({ violationType: 'No License/Bluebook', description: 'Driving without a valid license or vehicle registration (Bluebook).', fineAmount: 1000 });
    const rule11 = await Rule.create({ violationType: 'No Seatbelt', description: 'Driving a four-wheeler without wearing a seatbelt.', fineAmount: 500 });
    const rule12 = await Rule.create({ violationType: 'No Parking Zone', description: 'Parking a vehicle in a designated No Parking zone.', fineAmount: 1000 });
    const rule13 = await Rule.create({ violationType: 'Horn Violation', description: 'Sounding horn in a strictly No-Horn zone (e.g., Kathmandu Valley).', fineAmount: 500 });
    const rule14 = await Rule.create({ violationType: 'Vehicle Modification', description: 'Illegal modification of vehicle (e.g., loud exhaust, altered chassis).', fineAmount: 1500 });

    // 7. Create Violation Types
    const vTypeHelmet = await ViolationType.create({ trafficRuleId: rule1._id, violationName: 'No Helmet', description: 'Riding without helmet on 2-wheeler', severityLevel: 'High', isAIEnabled: true });
    await ViolationType.create({ trafficRuleId: rule2._id, violationName: 'Traffic Light', description: 'Red light jump', severityLevel: 'High', isAIEnabled: true });
    await ViolationType.create({ trafficRuleId: rule3._id, violationName: 'Zebra Crossing', description: 'Zebra crossing violation', severityLevel: 'Medium', isAIEnabled: true });
    await ViolationType.create({ trafficRuleId: rule4._id, violationName: 'Sidewalk Encroachment', description: 'Sidewalk encroachment', severityLevel: 'High', isAIEnabled: true });
    await ViolationType.create({ trafficRuleId: rule5._id, violationName: 'Wrong Way', description: 'Wrong way driving', severityLevel: 'High', isAIEnabled: true });
    await ViolationType.create({ trafficRuleId: rule6._id, violationName: 'Triple Riding', description: 'Triple riding on motorcycle', severityLevel: 'High', isAIEnabled: true });
    
    // Non-AI (Manual entry mostly)
    await ViolationType.create({ trafficRuleId: rule7._id, violationName: 'Drink Driving (MaPaSe)', description: 'Driving under influence', severityLevel: 'Critical', isAIEnabled: false });
    await ViolationType.create({ trafficRuleId: rule8._id, violationName: 'Over Speeding', description: 'Speed limit crossed', severityLevel: 'High', isAIEnabled: false });
    await ViolationType.create({ trafficRuleId: rule9._id, violationName: 'Mobile Phone Use', description: 'Using phone while driving', severityLevel: 'Medium', isAIEnabled: false });
    await ViolationType.create({ trafficRuleId: rule10._id, violationName: 'No License/Bluebook', description: 'Missing documents', severityLevel: 'High', isAIEnabled: false });
    await ViolationType.create({ trafficRuleId: rule11._id, violationName: 'No Seatbelt', description: 'Seatbelt not worn', severityLevel: 'Medium', isAIEnabled: false });
    await ViolationType.create({ trafficRuleId: rule12._id, violationName: 'No Parking Zone', description: 'Illegal parking', severityLevel: 'Low', isAIEnabled: false });
    await ViolationType.create({ trafficRuleId: rule13._id, violationName: 'Horn Violation', description: 'Honking in restricted area', severityLevel: 'Low', isAIEnabled: false });
    await ViolationType.create({ trafficRuleId: rule14._id, violationName: 'Vehicle Modification', description: 'Loud exhaust or illegal parts', severityLevel: 'High', isAIEnabled: false });

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
