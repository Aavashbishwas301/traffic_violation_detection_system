import rateLimit from "express-rate-limit";

/**
 * Rate Limiting Configuration
 * Protects the API from abuse and brute-force attacks.
 */

// Global limiter — 1000 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth endpoints — 50 attempts per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate limiter for violation uploads — 30 per 15 minutes
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    message: "Upload limit reached. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
