import mongoose from "mongoose";

const priceSubmissionSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      trim: true
    },
    region: {
      type: String,
      required: true,
      trim: true
    },
    market: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewComment: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

priceSubmissionSchema.index({ status: 1, createdAt: -1 });

export const PriceSubmission = mongoose.model("PriceSubmission", priceSubmissionSchema);
