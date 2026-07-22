import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import compression from "compression";
import helmet from "helmet";
import { globalLimiter } from "./middleware/rateLimitMiddleware.js";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import violationRoutes from "./routes/violationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import path from "path";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import validateEnv from "./config/envValidator.js";
import { createServer } from "http";
import { initializeSocket } from "./socket.js";

dotenv.config();

// Validate environment variables before starting
validateEnv();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Middleware & Optimization
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(compression());
app.use(globalLimiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/violations", violationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/payments", paymentRoutes);

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Basic Route
app.get("/", (req, res) => {
  res.send("TVDS API is running...");
});

// Error Handling Middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
