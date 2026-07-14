/**
 * Environment Variable Validation
 *
 * Checks that all required environment variables are set.
 * Called at server startup to fail fast if config is missing.
 */

const REQUIRED_VARS = [
  { name: "MONGO_URI", description: "MongoDB connection string" },
  { name: "JWT_SECRET", description: "JWT signing secret" },
  { name: "FRONTEND_URL", description: "Frontend application URL" },
];

const OPTIONAL_VARS = [
  { name: "KH_SECRET_KEY", description: "Khalti secret key (payment)" },
  { name: "ESEWA_SCD", description: "eSewa product code (payment)" },
  { name: "ESEWA_SECRET", description: "eSewa secret key (payment)" },
  {
    name: "AI_SERVICE_URL",
    description: "AI detection service URL",
    default: "http://localhost:8000",
  },
  { name: "PORT", description: "Server port", default: "5000" },
  { name: "NODE_ENV", description: "Environment mode", default: "development" },
];

const validateEnv = () => {
  const missing = [];

  for (const { name, description } of REQUIRED_VARS) {
    if (!process.env[name]) {
      missing.push(`  ❌ ${name} — ${description}`);
    }
  }

  if (missing.length > 0) {
    console.error("\n========================================");
    console.error("  MISSING REQUIRED ENVIRONMENT VARIABLES");
    console.error("========================================");
    missing.forEach((m) => console.error(m));
    console.error("========================================\n");
    process.exit(1);
  }

  // Apply defaults for optional vars
  for (const { name, default: defaultValue } of OPTIONAL_VARS) {
    if (!process.env[name] && defaultValue) {
      process.env[name] = defaultValue;
      console.log(`  ℹ️  ${name} not set, using default: ${defaultValue}`);
    }
  }

  console.log("  ✅ All required environment variables are set.\n");
};

export default validateEnv;
