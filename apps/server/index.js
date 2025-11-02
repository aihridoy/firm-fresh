const express = require("express");
const cors = require("cors");

const app = express();
const { connectDB } = require("./utils/db");
const { port } = require("./utils/config");

// Import routes
const userRoutes = require("./routes/userRoute");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("Hello world...");
});

// API routes
app.use("/api", userRoutes);

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
