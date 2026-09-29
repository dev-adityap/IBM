const express = require("express");
const Visitor = require("../models/Visitor");

const router = express.Router();

// CREATE visitor
router.post("/", async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);

    res.status(201).json(visitor);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// GET all visitors
router.get("/", async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({
      visitDateTime: -1
    });

    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// GET single visitor
router.get("/:id", async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    res.status(200).json(visitor);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// UPDATE visitor
router.put("/:id", async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    res.status(200).json(visitor);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// DELETE visitor
router.delete("/:id", async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    res.status(200).json({
      message: "Visitor deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;