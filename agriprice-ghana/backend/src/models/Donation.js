import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      default: "Anonymous"
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      default: "GHS"
    },
    reference: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["initialized", "success", "failed"],
      default: "initialized"
    },
    paymentProvider: {
      type: String,
      default: "paystack"
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

export const Donation = mongoose.model("Donation", donationSchema);
