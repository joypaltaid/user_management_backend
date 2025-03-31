const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handle Mongoose CastError (Invalid MongoDB ID)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(", ")}`;
    err = new ErrorHandler(message, 400);
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Invalid JWT token. Please log in again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("JWT token has expired. Please log in again.", 401);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
