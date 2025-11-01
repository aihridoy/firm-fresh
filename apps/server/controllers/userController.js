const { User } = require("../models/userModel");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");

// Multer config: Memory storage (for Cloudinary upload; no disk save)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Helper function for Cloudinary upload (reusable, Promise-based)
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "farmfresh/profiles", resource_type: "image" },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`));
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Register new user (customer or farmer)
const addUser = async (req, res) => {
  try {
    const {
      userType,
      firstName,
      lastName,
      email,
      phone,
      address,
      bio,
      password,
      // Farmer-specific fields
      farmName,
      specialization,
      farmSize,
      farmSizeUnit,
    } = req.body;

    // Basic Multer error check (global handler catches more; this for explicit)
    if (req.file && !req.file.buffer) {
      return res.status(400).send({
        status: false,
        error: "Invalid file upload",
      });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address || !password) {
      return res.status(400).send({
        status: false,
        error: "First name, last name, email, phone, address, and password are required",
      });
    }

    // Validate userType
    if (!userType || !["customer", "farmer"].includes(userType)) {
      return res.status(400).send({
        status: false,
        error: "Valid user type (customer or farmer) is required",
      });
    }

    // Additional validation for farmers
    if (userType === "farmer") {
      if (!farmName || !specialization) {
        return res.status(400).send({
          status: false,
          error: "Farm name and specialization are required for farmers",
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        status: false,
        error: "User with this email already exists",
      });
    }

    // Handle profile picture upload to Cloudinary
    let profilePicture = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      profilePicture = result.secure_url; // Use secure_url for public access
    }

    // Prepare user data
    const userData = {
      userType,
      firstName,
      lastName,
      email,
      phone,
      address,
      bio: bio || "",
      password,
      profilePicture,
    };

    // Add farmer-specific details if user is a farmer
    if (userType === "farmer") {
      userData.farmerDetails = {
        farmName,
        specialization,
        farmSize: {
          value: parseFloat(farmSize) || 0, // Parse to Number
          unit: farmSizeUnit || "acres",
        },
      };
    }

    // Create and save user
    const user = new User(userData);
    const savedUser = await user.save();

    // Generate token
    const token = savedUser.generateAuthToken();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).send({
      status: true,
      data: { ...userResponse, token },
      message: "User registered successfully",
    });
  } catch (err) {
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(409).send({
        status: false,
        error: "Email already exists",
      });
    }
    console.error("Registration error:", err);
    res.status(500).send({ status: false, error: err.message });
  }
};

// Get user by email
const getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select("-password");

    if (user) {
      return res.send({ status: true, data: user });
    }

    res.status(404).send({
      status: false,
      error: "User not found",
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
      return res.send({ status: true, data: user });
    }

    res.status(404).send({
      status: false,
      error: "User not found",
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).send({
        status: false,
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({
        status: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).send({
        status: false,
        error: "Invalid email or password",
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.send({
      status: true,
      data: { ...userResponse, token },
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Prevent updating sensitive fields directly
    delete updates.password;
    delete updates.email;
    delete updates._id;

    // If updating farmer details, ensure user is a farmer
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({
        status: false,
        error: "User not found",
      });
    }

    if (updates.farmerDetails && user.userType !== "farmer") {
      return res.status(400).send({
        status: false,
        error: "Cannot add farmer details to a customer account",
      });
    }

    // Handle profile picture update
    if (req.file) {
      // Delete old profile picture from Cloudinary if exists
      if (user.profilePicture) {
        const publicId = user.profilePicture.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`farmfresh/profiles/${publicId}`);
        }
      }
      // Upload new to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer);
      updates.profilePicture = result.secure_url;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.send({
      status: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).send({
        status: false,
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).send({
        status: false,
        error: "New password must be at least 6 characters long",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({
        status: false,
        error: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).send({
        status: false,
        error: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.send({
      status: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// Get all farmers (for listing farmers)
const getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ userType: "farmer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.send({
      status: true,
      data: farmers,
      count: farmers.length,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send({
        status: false,
        error: "User not found",
      });
    }

    res.send({
      status: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// Export all (CommonJS)
module.exports = {
  addUser,
  getUserByEmail,
  getUserById,
  login,
  updateUser,
  changePassword,
  getAllFarmers,
  deleteUser,
  upload,
};
