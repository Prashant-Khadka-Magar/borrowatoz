import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Rental } from "../models/rental.model.js";
import { Listing } from "../models/listing.model.js";
import { Review } from "../models/review.model.js";

const getMyRentals = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    console.log(userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    //role=borrower|lender|all (default all)
    const role = String(req.query.role ?? "all")
      .trim()
      .toLowerCase();

    //status=ACTIVE|COMPLETED|CANCELLED|DISPUTED
    const status = String(req.query.status ?? "")
      .trim()
      .toUpperCase();

    const filter = {};

    if (role === "borrower") filter.borrower = userId;
    else if (role === "lender") filter.lender = userId;
    else filter.$or = [{ borrower: userId }, { lender: userId }];

    if (status) {
      const allowed = ["ACTIVE", "COMPLETED", "CANCELLED", "DISPUTED"];
      if (!allowed.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }
      filter.status = status;
    }

    const rentals = await Rental.find(filter)
      .populate("listing", "title images price billingUnit type city")
      .populate("lender", "firstName lastName")
      .populate("borrower", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, rentals });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to get rentals" });
  }
});

const getRentalById = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const rentalId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    if (!mongoose.Types.ObjectId.isValid(rentalId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid rental id" });
    }

    const rental = await Rental.findById(rentalId)
      .populate("listing", "title images price billingUnit type city owner")
      .populate("lender", "firstName lastName")
      .populate("borrower", "firstName lastName")
      .lean();

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });
    }

    const isBorrower =
      String(rental.borrower?._id ?? rental.borrower) === String(userId);
    const isLender =
      String(rental.lender?._id ?? rental.lender) === String(userId);

    if (!isBorrower && !isLender) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to view this rental",
        });
    }

    return res.status(200).json({ success: true, rental });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to get rental" });
  }
});

const cancelRental = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const rentalId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    if (!mongoose.Types.ObjectId.isValid(rentalId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid rental id" });
    }

    const rental = await Rental.findById(rentalId).select(
      "lender borrower status startDate endDate",
    );

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });
    }

    const isBorrower = rental.borrower.toString() === userId.toString();
    const isLender = rental.lender.toString() === userId.toString();

    if (!isBorrower && !isLender) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to cancel this rental",
        });
    }

    if (rental.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: `Rental cannot be cancelled (current status: ${rental.status})`,
      });
    }

    const reason = String(req.body?.reason ?? "").trim();
    if (reason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason too long (max 500 chars)",
      });
    }

    const now = new Date();
    if (rental.endDate && rental.endDate <= now) {
      return res.status(400).json({
        success: false,
        message: "Rental already ended; cannot cancel",
      });
    }

    const updated = await Rental.findByIdAndUpdate(
      rentalId,
      {
        $set: {
          status: "CANCELLED",
          cancelledBy: userId,
          cancellationReason: reason || undefined,
        },
      },
      { new: true, runValidators: true },
    )
      .populate("listing", "title images")
      .populate("lender", "firstName lastName")
      .populate("borrower", "firstName lastName");

    return res.status(200).json({
      success: true,
      message: "Rental cancelled",
      rental: updated,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to cancel rental" });
  }
});

const markRentalCompleted = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const rentalId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    if (!mongoose.Types.ObjectId.isValid(rentalId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid rental id" });
    }

    const rental = await Rental.findById(rentalId).select(
      "lender borrower status endDate",
    );

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });
    }

    if (rental.lender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only lender can mark rental completed",
      });
    }

    if (rental.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: `Rental cannot be completed (current status: ${rental.status})`,
      });
    }

    // Optional rule: only after endDate unless ?force=true
    const force = String(req.query.force ?? "false").toLowerCase() === "true";
    const now = new Date();
    if (!force && rental.endDate && rental.endDate > now) {
      return res.status(400).json({
        success: false,
        message:
          "Rental has not ended yet. Use ?force=true if you really mean it.",
      });
    }

    const updated = await Rental.findByIdAndUpdate(
      rentalId,
      { $set: { status: "COMPLETED" } },
      { new: true, runValidators: true },
    )
      .populate("listing", "title images")
      .populate("lender", "firstName lastName")
      .populate("borrower", "firstName lastName");

    return res.status(200).json({
      success: true,
      message: "Rental marked completed",
      rental: updated,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to complete rental" });
  }
});

function parseRating(raw) {
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return n;
}

/**
 * POST /api/rentals/:id/reviews
 * Borrower -> LISTING review (rating + optional comment)
 */
const createListingReviewForRental = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const rentalId = req.params.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(rentalId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid rental id" });
  }

  const rating = parseRating(req.body.rating);
  if (!rating) {
    return res.status(400).json({
      success: false,
      message: "rating must be a number between 1 and 5",
    });
  }

  const comment = String(req.body.comment ?? "").trim();

  const session = await mongoose.startSession();

  try {
    let created;

    await session.withTransaction(async () => {
      const rental = await Rental.findById(rentalId)
        .select("status borrower lender listing")
        .session(session);

      if (!rental) {
        const err = new Error("Rental not found");
        err.statusCode = 404;
        throw err;
      }

      if (rental.status !== "COMPLETED") {
        const err = new Error(
          "You can only review after the rental is COMPLETED",
        );
        err.statusCode = 400;
        throw err;
      }

      // v1 rule: borrower reviews listing
      if (String(rental.borrower) !== String(userId)) {
        const err = new Error(
          "Only the borrower can review this rental's listing",
        );
        err.statusCode = 403;
        throw err;
      }

      // Create Review (LISTING)
      created = await Review.create(
        [
          {
            rental: rental._id,
            targetType: "LISTING",
            listing: rental.listing,
            reviewer: userId,
            reviewee: rental.lender, // supports "provider rating from listings" if you want
            reviewerRole: "BORROWER",
            rating,
            comment,
            status: "PUBLISHED",
          },
        ],
        { session },
      ).then((docs) => docs[0]);

      // Update Listing cache (avgRating + ratingCount)
      const listing = await Listing.findById(rental.listing)
        .select("avgRating ratingCount")
        .session(session);

      if (!listing) {
        const err = new Error("Listing not found for this rental");
        err.statusCode = 404;
        throw err;
      }

      const oldCount = Number(listing.ratingCount ?? 0);
      const oldAvg = Number(listing.avgRating ?? 0);

      const newCount = oldCount + 1;
      const newAvgRaw = (oldAvg * oldCount + rating) / newCount;

      listing.ratingCount = newCount;
      listing.avgRating = Math.round(newAvgRaw * 100) / 100;

      await listing.save({ session, validateBeforeSave: true });
    });

    return res.status(201).json({
      success: true,
      message: "Listing review created",
      review: created,
    });
  } catch (err) {
    console.log(err)
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already submitted a listing review for this rental",
      });
    }
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to create review",
    });
  } finally {
    session.endSession();
  }
});

/**
 * POST /api/rentals/:id/borrower-rating
 * Lender -> USER rating of borrower (rating only; no comment in v1)
 *
 * Body: { rating: 1-5 }
 */
const createBorrowerRatingForRental = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const rentalId = req.params.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  if (!mongoose.Types.ObjectId.isValid(rentalId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid rental id" });
  }

  const rating = parseRating(req.body.rating);
  if (!rating) {
    return res.status(400).json({
      success: false,
      message: "rating must be a number between 1 and 5",
    });
  }

  // v1 UX: rating only (no written review about a person)
  const comment = String(req.body.comment ?? "").trim();
  if (comment) {
    return res.status(400).json({
      success: false,
      message: "Borrower rating does not accept comment (rating only)",
    });
  }

  try {
    const rental = await Rental.findById(rentalId).select(
      "status borrower lender",
    );

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });
    }

    if (rental.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "You can only rate the borrower after the rental is COMPLETED",
      });
    }

    // v1 rule: lender rates borrower
    if (String(rental.lender) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the lender can rate the borrower for this rental",
      });
    }

    const created = await Review.create({
      rental: rental._id,
      targetType: "USER",
      listing: null,
      reviewer: userId,
      reviewee: rental.borrower, // borrower being rated
      reviewerRole: "LENDER",
      rating,
      comment: "",
      status: "PUBLISHED",
    });

    return res.status(201).json({
      success: true,
      message: "Borrower rating created",
      rating: created,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already rated this borrower for this rental",
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create borrower rating",
    });
  }
});






export { getMyRentals, getRentalById, cancelRental, markRentalCompleted, createListingReviewForRental, createBorrowerRatingForRental };
