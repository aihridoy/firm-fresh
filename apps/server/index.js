const express = require("express");
const cors = require("cors");

const app = express();
const { connectDB } = require("./utils/db");
const { port } = require("./utils/config");

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Hello world...");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
