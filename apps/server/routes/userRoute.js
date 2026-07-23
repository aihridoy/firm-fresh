const express = require("express");
const router = express.Router();
const {
  addUser,
  getUserById,
  login,
  updateUser,
  changePassword,
  getAllFarmers,
  getPublicStats,
  deleteUser,
  upload,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  // upload,
} = require("../controllers/userController");
const { authMiddleware, isOwner } = require("../middleware/authMiddleware");

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

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

// Logout (clear refresh token)
router.post("/logout", logout);

// Get user by email

// Get all farmers (public listing)
router.get("/farmers", getAllFarmers);

// Public platform stats (homepage hero)
router.get("/stats", getPublicStats);

// ============================================
// Protected Routes (Authentication required)
// ============================================

// Get user by ID
router.get("/user/:id", authMiddleware, getUserById);

// Update user profile (with optional file upload)
router.put("/user/:id", authMiddleware, isOwner, upload.single("profilePicture"), updateUser);

// Change password
router.put("/user/:id/password", authMiddleware, isOwner, changePassword);

// Delete user
router.delete("/user/:id", authMiddleware, isOwner, deleteUser);

module.exports = router;
