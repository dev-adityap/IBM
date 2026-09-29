const express = require("express");
const Visitor = require("../models/Visitor.model");

const {
  authenticate,
  authorize
} = require("../middleware/auth.Middleware");

const router = express.Router();


// ============================================
// CREATE VISITOR
// Admin + Receptionist
// ============================================
router.post(
  "/",
  authenticate,
  authorize("admin", "receptionist"),
  async (req, res) => {
    try {
      const visitor = await Visitor.create(req.body);

      res.status(201).json(visitor);
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  }
);


// ============================================
// GET ALL VISITORS
// Admin + Receptionist + Viewer
// ============================================
router.get(
  "/",
  authenticate,
  authorize("admin", "receptionist", "viewer"),
  async (req, res) => {
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
  }
);


// ============================================
// GET SINGLE VISITOR
// Admin + Receptionist + Viewer
// ============================================
router.get(
  "/:id",
  authenticate,
  authorize("admin", "receptionist", "viewer"),
  async (req, res) => {
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
  }
);


// ============================================
// UPDATE VISITOR
// Admin + Receptionist
// ============================================
router.put(
  "/:id",
  authenticate,
  authorize("admin", "receptionist"),
  async (req, res) => {
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
  }
);


// ============================================
// DELETE VISITOR
// Admin ONLY
// ============================================
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const visitor = await Visitor.findByIdAndDelete(
        req.params.id
      );

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
  }
);


module.exports = router;