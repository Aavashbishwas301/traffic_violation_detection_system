/**
 * Global Express Error Handling Middleware
 *
 * Provides:
 * 1. 404 handler for unknown routes
 * 2. Global error handler that catches all thrown/forwarded errors
 */

// @desc    404 handler for unknown API routes
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// @desc    Global error handler
const errorHandler = (err, req, res, next) => {
  // If status is still 200 (Express default), set to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
