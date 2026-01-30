import mongoose, { Schema } from "mongoose";

const rentalRequestSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    lender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxLength: 500,
    },

    guestCount: {
      type: Number,
      min: 1,
      default: 1,
    },
  },
  { timestamps: true }
);

export const RentalRequest = mongoose.model(
  "RentalRequest",
  rentalRequestSchema
);
