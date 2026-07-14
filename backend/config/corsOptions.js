/**
 * CORS Configuration
 *
 * Restricts API access to the frontend origin only.
 * Uses FRONTEND_URL from environment, falls back to localhost in dev.
 */

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
