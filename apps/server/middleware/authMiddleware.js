const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");

// Authentication middleware to verify JWT token
exports.authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // Check if token exists
    if (!token) {
      return res.status(401).send({
        status: false,
        error: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).send({
        status: false,
        error: "Invalid token. User not found.",
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send({
        status: false,
        error: "Invalid token.",
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).send({
        status: false,
        error: "Token expired. Please login again.",
      });
    }
    res.status(500).send({
      status: false,
      error: "Authentication failed.",
    });
  }
};

// Middleware to check if user is a farmer
exports.isFarmer = (req, res, next) => {
  if (req.user.userType !== "farmer") {
    return res.status(403).send({
      status: false,
      error: "Access denied. Only farmers can access this resource.",
    });
  }
  next();
};

// Middleware to check if user is a customer
exports.isCustomer = (req, res, next) => {
  if (req.user.userType !== "customer") {
    return res.status(403).send({
      status: false,
      error: "Access denied. Only customers can access this resource.",
    });
  }
  next();
};

// Middleware to check if user is accessing their own resource
exports.isOwner = (req, res, next) => {
  const userId = req.params.id || req.params.userId;

  if (req.user.id !== userId && req.user._id.toString() !== userId) {
    return res.status(403).send({
      status: false,
      error: "Access denied. You can only access your own resources.",
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token provided
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (err) {
    // If optional auth fails, just continue without user
    next();
  }
};
