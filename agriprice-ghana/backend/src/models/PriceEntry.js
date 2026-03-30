import mongoose from "mongoose";

const priceEntrySchema = new mongoose.Schema(
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
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    source: {
      type: String,
      enum: ["seed", "submission", "admin-edit"],
      default: "submission"
    }
  },
  { timestamps: true }
);

priceEntrySchema.index({ crop: 1, region: 1, createdAt: -1 });

export const PriceEntry = mongoose.model("PriceEntry", priceEntrySchema);
