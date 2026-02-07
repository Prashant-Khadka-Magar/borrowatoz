// controllers/review.read.controller.js
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Review } from "../models/review.model.js";

export const getListingReviews = asyncHandler(async (req, res) => {
  const listingId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid listing id",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(20, Number(req.query.limit) || 5);
  const skip = (page - 1) * limit;

  const filter = {
    targetType: "LISTING",
    listing: new mongoose.Types.ObjectId(listingId),
    status: "PUBLISHED",
    comment: { $ne: "" },
  };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .select("rating comment reviewer createdAt")
      .populate("reviewer", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    reviews,
  });
});
