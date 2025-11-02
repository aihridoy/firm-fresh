const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    // Account type
    userType: {
      type: String,
      enum: ["customer", "farmer"],
      required: true,
      default: "customer",
    },

    // Basic info
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      maxlength: 250,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Farmer-specific fields (only for farmers)
    farmerDetails: {
      farmName: {
        type: String,
        required: function () {
          return this.userType === "farmer";
        },
      },
      specialization: {
        type: String,
        enum: ["vegetables", "fruits", "grains", "dairy", "mixed", ""],
        default: "",
        required: function () {
          return this.userType === "farmer";
        },
      },
      farmSize: {
        value: {
          type: Number,
          min: 0,
        },
        unit: {
          type: String,
          enum: ["acres", "hectares", "sq_ft", "sq_m", ""],
          default: "acres",
        },
      },
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate auth token
userSchema.methods.generateAuthToken = function () {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      userType: this.userType,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt,
    },
    secret,
    {
      expiresIn: "1h",
    }
  );
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

module.exports = { User };
