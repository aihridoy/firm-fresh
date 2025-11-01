const express = require("express");
const router = express.Router();
const {
  addUser,
  getUserByEmail,
  getUserById,
  login,
  updateUser,
  changePassword,
  getAllFarmers,
  deleteUser,
  upload,
  forgotPassword,
  resetPassword,
  // upload,
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

// ============================================
// Public Routes (No authentication required)
// ============================================

// Register new user (customer or farmer) - Single route
router.post("/register", upload.single("profilePicture"), addUser);

// Login
router.post("/login", login);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// Get user by email
router.get("/user/email/:email", getUserByEmail);

// Get all farmers (public listing)
router.get("/farmers", getAllFarmers);

// ============================================
// Protected Routes (Authentication required)
// ============================================

// Get user by ID
router.get("/user/:id", authMiddleware, getUserById);

// Update user profile (with optional file upload)
router.put("/user/:id", authMiddleware, upload.single("profilePicture"), updateUser);

// Change password
router.put("/user/:id/password", authMiddleware, changePassword);

// Delete user
router.delete("/user/:id", authMiddleware, deleteUser);

module.exports = router;
