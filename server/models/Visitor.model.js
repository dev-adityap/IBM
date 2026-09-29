const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: true,
      trim: true
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true
    },

    organization: {
      type: String,
      required: true,
      trim: true
    },

    personToMeet: {
      type: String,
      required: true,
      trim: true
    },

    purpose: {
      type: String,
      required: true,
      trim: true
    },

    visitDateTime: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["Checked In", "Checked Out"],
      default: "Checked In"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Visitor", visitorSchema);