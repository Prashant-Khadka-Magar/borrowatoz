import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const listingSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["ITEM", "SERVICE"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },

    images: {
      type: [imageSchema],
      validate: [(arr) => arr.length <= 10, "Max 10 images allowed"],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    priceUnit: {
      type: String,
      enum: ["HOUR", "DAY", "JOB"],
      default: "DAY",
    },

    deliveryMode: {
      type: String,
      enum: ["PICKUP", "DROPOFF", "DELIVERY", "ONLINE"],
      default: "PICKUP",
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED"],
      default: "ACTIVE",
      index: true,
    },

    avgRating: { type: Number, default: 0, min: 0, max: 5 },

    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Listing = mongoose.model("Listing", listingSchema);
