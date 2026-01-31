
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Rental } from "../models/rental.model.js";

const getMyRentals = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    // Optional: ?role=borrower|lender|all (default all)
    const role = String(req.query.role ?? "all").trim().toLowerCase();

    // Optional: ?status=ACTIVE|COMPLETED|CANCELLED|DISPUTED
    const status = String(req.query.status ?? "").trim().toUpperCase();

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

    const isBorrower = String(rental.borrower?._id ?? rental.borrower) === String(userId);
    const isLender = String(rental.lender?._id ?? rental.lender) === String(userId);

    if (!isBorrower && !isLender) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this rental" });
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
      "lender borrower status startDate endDate"
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
        .json({ success: false, message: "Not authorized to cancel this rental" });
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

    // Optional real-world rule: disallow cancelling after it ended
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
      { new: true, runValidators: true }
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
      "lender borrower status endDate"
    );

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });
    }

    // Usually lender marks completed. If you want borrower too, allow both.
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
        message: "Rental has not ended yet. Use ?force=true if you really mean it.",
      });
    }

    const updated = await Rental.findByIdAndUpdate(
      rentalId,
      { $set: { status: "COMPLETED" } },
      { new: true, runValidators: true }
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

export { getMyRentals, getRentalById, cancelRental, markRentalCompleted };
