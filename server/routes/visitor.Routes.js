const express = require("express");
const Visitor = require("../models/Visitor.model");

const {
  authenticate,
  authorize
} = require("../middleware/auth.Middleware");

const router = express.Router();


// ============================================ 
// ESCAPE USER INPUT FOR SAFE REGEX
// ============================================ 
const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


// ============================================ 
// CHECK IF RECORD BELONGS TO VISITOR
// ============================================ 
const isOwner = (visitor, user) => {
  if (String(visitor.user) === String(user.id)) {
    return true;
  }

  if (
    visitor.visitorName?.toLowerCase() ===
    user.name?.toLowerCase()
  ) {
    return true;
  }

  return Boolean(
    visitor.email &&
      user.email &&
      visitor.email.toLowerCase() ===
        user.email.toLowerCase()
  );
};


// ============================================
// CREATE VISITOR
// Admin / Receptionist create directly as "Checked In"
// Visitor creates a request as "Pending" for admin approval
// ============================================
router.post(
  "/",
  authenticate,
  authorize("admin", "receptionist", "visitor"),
  async (req, res) => {
    try {
      const {
        personToMeet,
        organization,
        purpose,
        visitDateTime
      } = req.body;

      if (!personToMeet || !purpose) {
        return res.status(400).json({
          message:
            "Person to meet and purpose are required"
        });
      }

      const isVisitor = req.user.role === "visitor";

      // Visitors always request; admins create checked in
      const visitor = await Visitor.create({
        visitorName: isVisitor
          ? req.user.name
          : req.body.visitorName,
        mobileNumber: isVisitor
          ? req.body.mobileNumber
          : req.body.mobileNumber,
        email: isVisitor
          ? req.user.email
          : req.body.email,
        organization:
          req.body.organization || "Self",
        personToMeet,
        purpose,
        visitDateTime:
          visitDateTime || Date.now(),
        user: isVisitor
          ? req.user.id
          : req.body.user || null,
        status: isVisitor
          ? "Pending"
          : "Checked In"
      });

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
// Admin / Receptionist / Viewer see all
// Visitor sees only their own records
// ============================================
router.get(
  "/",
  authenticate,
  authorize("admin", "receptionist", "viewer", "visitor"),
  async (req, res) => {
    try {
      const query =
        req.user.role === "visitor"
          ? {
              $or: [
                { user: req.user.id },
                // Legacy records created before user linking
                {
                  visitorName: {
                    $regex: `^${escapeRegex(req.user.name)}$`,
                    $options: "i"
                  }
                },
                {
                  email: {
                    $regex: `^${escapeRegex(req.user.email)}$`,
                    $options: "i"
                  }
                }
              ]
            }
          : {};

      const visitors = await Visitor.find(query).sort({
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
// Admin / Receptionist / Viewer see all
// Visitor sees only their own record
// ============================================
router.get(
  "/:id",
  authenticate,
  authorize("admin", "receptionist", "viewer", "visitor"),
  async (req, res) => {
    try {
      const visitor = await Visitor.findById(req.params.id);

      if (!visitor) {
        return res.status(404).json({
          message: "Visitor not found"
        });
      }

      if (
        req.user.role === "visitor" &&
        !isOwner(visitor, req.user)
      ) {
        return res.status(403).json({
          message: "Access denied"
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
// Admin / Receptionist: approve, check in, check out, edit
// Visitor: edit their own record, only while Pending
// ============================================ 
router.put(
  "/:id",
  authenticate,
  authorize(
    "admin",
    "receptionist",
    "visitor"
  ),
  async (req, res) => {
    try {
      const update = { ...req.body };

      const isVisitor = req.user.role === "visitor";

      if (isVisitor) {
        const existing = await Visitor.findById(
          req.params.id
        );

        if (!existing) {
          return res.status(404).json({
            message: "Visitor not found"
          });
        }

        if (!isOwner(existing, req.user)) {
          return res.status(403).json({
            message: "Access denied"
          });
        }

        // Once approved, the visitor can no longer change it
        if (existing.status !== "Pending") {
          return res.status(403).json({
            message:
              "This visit can no longer be edited. Contact the front desk."
          });
        }

        // Visitors may only correct these details
        const allowedFields = [
          "organization",
          "personToMeet",
          "purpose"
        ];

        for (const key of Object.keys(update)) {
          if (!allowedFields.includes(key)) {
            return res.status(403).json({
              message: `Cannot update ${key}`
            });
          }
        }
      }

      // Only these statuses are reachable
      const allowedStatuses = [
        "Pending",
        "Checked In",
        "Checked Out"
      ];

      if (
        update.status &&
        !allowedStatuses.includes(update.status)
      ) {
        return res.status(400).json({
          message: "Invalid status"
        });
      }

      // Identity fields belong to the visitor, not the admin
      delete update.user;

      const visitor = await Visitor.findByIdAndUpdate(
        req.params.id,
        update,
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