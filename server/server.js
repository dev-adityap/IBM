const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const visitorRoutes = require("./routes/visitorRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/visitors", visitorRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Visitor Management API is running"
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });