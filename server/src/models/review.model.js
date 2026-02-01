// models/review.model.js
import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    /**
     * The completed rental this feedback belongs to.
     * Prevents fake reviews/ratings (must come from a real Rental).
     */
    rental: {
      type: Schema.Types.ObjectId,
      ref: "Rental",
      required: true,
      index: true,
    },

    /**
     * What is being reviewed:
     * - LISTING: borrower reviews the listing experience (rating + optional comment)
     * - USER: lender rates the borrower as a person (rating only in v1)
     */
    targetType: {
      type: String,
      enum: ["LISTING", "USER"],
      required: true,
      index: true,
    },

    /**
     * Listing being reviewed (required only when targetType === "LISTING")
     */
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      index: true,
      default: null,
    },

    /**
     * Who wrote it
     */
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Who is being reviewed
     * - for LISTING target: usually the lender (provider)
     * - for USER target: borrower (rated by lender)
     */
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Role of reviewer in the rental
     */
    reviewerRole: {
      type: String,
      enum: ["BORROWER", "LENDER"],
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isFinite,
        message: "rating must be a valid number",
      },
    },

    /**
     * Optional text review.
     * We will allow it only for LISTING reviews in controller (v1).
     */
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    status: {
      type: String,
      enum: ["PUBLISHED", "HIDDEN"],
      default: "PUBLISHED",
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * One feedback per rental per reviewer per targetType
 * - Borrower can leave LISTING review
 * - Lender can leave USER rating
 */
reviewSchema.index(
  { rental: 1, reviewer: 1, targetType: 1 },
  { unique: true }
);

reviewSchema.index({ listing: 1, targetType: 1, createdAt: -1 });
reviewSchema.index({ reviewee: 1, targetType: 1, createdAt: -1 });

/**
 * Conditional requirement: listing is required when targetType === "LISTING"
 */
reviewSchema.pre("validate", function (next) {
  if (this.targetType === "LISTING" && !this.listing) {
    this.invalidate("listing", "listing is required for LISTING reviews");
  }
  if (this.targetType === "USER") {
    // ensure listing isn't accidentally set
    this.listing = null;
  }
  next();
});

export const Review = mongoose.model("Review", reviewSchema);
