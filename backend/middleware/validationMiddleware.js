import { body, validationResult } from "express-validator";

/**
 * Middleware to check validation results and return errors if any.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// --- Auth Validation Rules ---

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const registerValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["Admin", "TrafficPolice", "VehicleOwner"])
    .withMessage("Invalid role specified"),
  body("citizenshipNumber").custom((value, { req }) => {
    if (req.body.role === "VehicleOwner" && (!value || value.trim() === "")) {
      throw new Error("Citizenship number is required for vehicle owners");
    }
    return true;
  }),
  body("badgeNumber").custom((value, { req }) => {
    if (req.body.role === "TrafficPolice" && (!value || value.trim() === "")) {
      throw new Error("Badge number is required for traffic police");
    }
    return true;
  }),
  handleValidationErrors,
];

// --- Violation Validation Rules ---

const manualViolationValidation = [
  body("vehicleNumber")
    .trim()
    .notEmpty()
    .withMessage("Vehicle number is required"),
  body("violationType")
    .trim()
    .notEmpty()
    .withMessage("Violation type is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  handleValidationErrors,
];

// --- Vehicle Validation Rules ---

const vehicleRegistrationValidation = [
  body("vehicleNumber")
    .trim()
    .notEmpty()
    .withMessage("Vehicle number is required")
    .matches(/^[A-Z0-9 -]+$/i)
    .withMessage("Invalid vehicle number format"),
  body("vehicleType")
    .optional()
    .isIn(["Car", "Van", "Bus", "Truck", "Bike", "Scooter", "2-Wheeler", "4-Wheeler", "Other", "Heavy"])
    .withMessage("Invalid vehicle type"),
  body("color").optional().trim().escape(),
  body("brand").optional().trim().escape(),
  body("model").optional().trim().escape(),
  handleValidationErrors,
];

// --- Payment Validation Rules ---

const khaltiInitiateValidation = [
  body("fineId").notEmpty().withMessage("Fine ID is required"),
  handleValidationErrors,
];

const khaltiVerifyValidation = [
  body("pidx").notEmpty().withMessage("Payment index (pidx) is required"),
  body("fineId").notEmpty().withMessage("Fine ID is required"),
  handleValidationErrors,
];

const esewaInitiateValidation = [
  body("fineId").notEmpty().withMessage("Fine ID is required"),
  handleValidationErrors,
];

// --- Admin Validation Rules ---

const broadcastValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  handleValidationErrors,
];

const ruleValidation = [
  body("violationType")
    .trim()
    .notEmpty()
    .withMessage("Violation type is required"),
  body("fineAmount").isNumeric().withMessage("Fine amount must be a number"),
  handleValidationErrors,
];

const complaintValidation = [
  body("violationId").notEmpty().withMessage("Violation ID is required"),
  body("complaintMessage")
    .trim()
    .notEmpty()
    .withMessage("Complaint message is required"),
  handleValidationErrors,
];

export {
  loginValidation,
  registerValidation,
  manualViolationValidation,
  vehicleRegistrationValidation,
  khaltiInitiateValidation,
  khaltiVerifyValidation,
  esewaInitiateValidation,
  broadcastValidation,
  ruleValidation,
  complaintValidation,
};
