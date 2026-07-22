const REQUIRED_ENV_VARS = [
  "DB_USER",
  "DB_PASS",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "FRONTEND_URL",
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
}

module.exports = {
  port: process.env.PORT || 8000,
};
