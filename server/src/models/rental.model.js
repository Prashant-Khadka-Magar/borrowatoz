import mongoose, { Schema } from "mongoose";

const rentalSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    lender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rentalRequest: {
      type: Schema.Types.ObjectId,
      ref: "RentalRequest",
      required: true,
      unique: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    priceAtBooking: {
      type: Number,
      required: true,
      min: 0,
    },

    billingUnit: {
      type: String,
      enum: ["HOUR", "DAY", "PER_GUEST", "PER_GROUP"],
      default: "DAY",
      index: true,
      validate: {
        validator: function (v) {
          if (this.type === "ITEM") return v === "HOUR" || v === "DAY";
          return true;
        },
        message: "ITEM listings can only use HOUR or DAY billing.",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED", "DISPUTED"],
      default: "ACTIVE",
      index: true,
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    billingUnit: {
      type: String,
      enum: ["HOUR", "DAY", "PER_GUEST", "PER_GROUP"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Rental = mongoose.model("Rental", rentalSchema);
