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
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

// ============================================
// Public Routes (No authentication required)
// ============================================

// Register new user (customer or farmer)
router.post("/register", addUser);
// Alternative route for backward compatibility
router.post("/user", addUser);

// Login
router.post("/login", login);

// Get user by email
router.get("/user/email/:email", getUserByEmail);

// Get all farmers (public listing)
router.get("/farmers", getAllFarmers);

// ============================================
// Protected Routes (Authentication required)
// ============================================

// Get user by ID
router.get("/user/:id", authMiddleware, getUserById);

// Update user profile
router.put("/user/:id", authMiddleware, updateUser);

// Change password
router.put("/user/:id/password", authMiddleware, changePassword);

// Delete user
router.delete("/user/:id", authMiddleware, deleteUser);

module.exports = router;
