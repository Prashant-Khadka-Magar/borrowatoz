import asynchandler from "express-async-handler";
import { RentalRequest } from "../models/rentalRequest.model";
import mongoose from "mongoose";
import { Listing } from "../models/listing.model";
import { Rental } from "../models/rental.model";

const createRentalRequest = asynchandler(async (req, res) => {
  try {
    const listingId = req.params.id;

    const borrowerId = req.user?._id;

    if (!borrowerId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid listing id" });
    }

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate/endDate",
      });
    }

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ success: false, message: "startDate must be before endDate" });
    }

    const message = (req.body.message ?? "").trim();

    const listing = await Listing.findById(listingId).select(
      "owner status price priceUnit"
    );

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    if (listing.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ success: false, message: "Listing is not available" });
    }

    const lenderId = listing.owner;

    const existingRequest = await RentalRequest.exists({
      listing: listingId,
      startDate,
      endDate,
      borrower: borrowerId,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate request not allowed" });
    }

    if (String(lenderId) === String(borrowerId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own listing",
      });
    }

    const overLapRental = await Rental.exists({
      listing: listingId,
      status: { $in: ["ACTIVE"] },
      startDate: { $lt: endDate },
    });

    if (overLapRental) {
      return res
        .status(409)
        .json({ success: false, message: "Dates are already booked" });
    }

    const rentalRequest = await RentalRequest.create({
      listing: listingId,
      lender: lenderId,
      borrower: borrowerId,
      startDate,
      endDate,
      message,
    });

    return res.status(200).json(rentalRequest);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to create request" });
  }
});

export { createRentalRequest };
