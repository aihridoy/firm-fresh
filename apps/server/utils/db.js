const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pfan7vt.mongodb.net/farm-fresh?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Database connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = { connectDB };
