const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const { connectDB } = require("./utils/db");
const { port } = require("./utils/config");

// Import routes
const userRoutes = require("./routes/userRoute");
const productRoutes = require("./routes/productRoute").default;
const cartRoutes = require("./routes/cartRoute").default;
const orderRoutes = require("./routes/orderRoute").default;
const reviewRoutes = require("./routes/reviewRoute").default;
const favoriteRoutes = require("./routes/favoriteRoute").default;
const adminRoutes = require("./routes/adminRoute").default;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit auth endpoints (login, register, password reset) against brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: false, error: "Too many requests, please try again later." },
});
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/forgot-password", authLimiter);
app.use("/api/reset-password", authLimiter);

// Connect to database
connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("Hello world...");
});

// API routes
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", reviewRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", adminRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    status: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: false,
    error: "Something went wrong!",
    message: err.message,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API base URL: http://localhost:${port}/api`);
});

module.exports = app;
