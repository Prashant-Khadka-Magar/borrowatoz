import asynchandler from "express-async-handler";
import { RentalRequest } from "../models/rentalRequest.model.js";
import mongoose from "mongoose";
import { Listing } from "../models/listing.model.js";
import { Rental } from "../models/rental.model.js";

function calculateTotal({
  price,
  billingUnit,
  startDate,
  endDate,
  guestCount,
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!Number.isFinite(price) || price < 0) throw new Error("Invalid price");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    throw new Error("Invalid dates");
  if (end <= start) throw new Error("Invalid date range");

  const ms = end.getTime() - start.getTime();
  const HOUR_MS = 1000 * 60 * 60;
  const DAY_MS = 1000 * 60 * 60 * 24;

  switch (billingUnit) {
    case "HOUR": {
      const hours = Math.ceil(ms / HOUR_MS);
      return price * hours;
    }
    case "DAY": {
      const days = Math.max(1, Math.ceil(ms / DAY_MS));
      return price * days;
    }
    case "PER_GUEST": {
      const guests = Number(guestCount);
      if (!Number.isInteger(guests) || guests < 1)
        throw new Error("guestCount required for PER_GUEST");
      return price * guests;
    }
    case "PER_GROUP": {
      return price;
    }
    default:
      throw new Error("Invalid billingUnit");
  }
}

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
        message: "Invalid startDate or endDate",
      });
    }

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ success: false, message: "startDate must be before endDate" });
    }

    const message = (req.body.message ?? "").trim();

    const listing = await Listing.findById(listingId).select(
      "owner status price billingUnit type"
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

    const billingUnit = String(listing.billingUnit ?? "").toUpperCase();

    let guestCount = 1;

    if (listing.type === "SERVICE" && billingUnit === "PER_GUEST") {
      const raw = req.body.guestCount;
      const parsed = typeof raw === "string" ? Number(raw) : raw;

      if (!Number.isInteger(parsed) || parsed < 1) {
        return res.status(400).json({
          success: false,
          message:
            "guestCount is required and must be >= 1 for PER_GUEST services",
        });
      }
      guestCount = parsed;
    }

    if (listing.type === "ITEM") guestCount = 1;

    const rentalRequest = await RentalRequest.create({
      listing: listingId,
      lender: lenderId,
      borrower: borrowerId,
      startDate,
      endDate,
      message,
      guestCount,
    });

    return res.status(200).json(rentalRequest);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to create request" });
  }
});

const getMyRequests = asynchandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    const requests = await RentalRequest.find({ borrower: userId })
      .populate("listing", "title images")
      .populate("lender", "firstName lastName");

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to get requests" });
  }
});

const getIncomingRequest = asynchandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    const status = String(req.query.status ?? "")
      .trim()
      .toUpperCase();

    const filter = { lender: userId };

    if (status) {
      filter.status = status;
    }

    const requests = await RentalRequest.find(filter)
      .populate("listing", "title images")
      .populate("borrower", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to get requests" });
  }
});

const approveRentalRequest = asynchandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request id" });
    }

    const request = await RentalRequest.findById(requestId)
      .populate("listing")
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found",
      });
    }

    if (request.lender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to approve this request",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`,
      });
    }

    //in caseof double click
    const existingRental = await Rental.findOne({
      rentalRequest: request._id,
    });

    if (existingRental) {
      return res.status(400).json({
        success: false,
        message: "Rental already created for this request",
      });
    }

    const listing = request.listing;

    if (!listing || listing.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Listing is no longer active",
      });
    }

    if (
      listing.owner?.toString?.() &&
      listing.owner.toString() !== request.lender.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Request lender does not match listing owner",
      });
    }

    const billingUnit = String(listing.billingUnit ?? "").toUpperCase();
    const allowedUnits = ["HOUR", "DAY", "PER_GUEST", "PER_GROUP"];

    if (!allowedUnits.includes(billingUnit)) {
      return res.status(400).json({
        success: false,
        message: "Listing has invalid billingUnit",
      });
    }

    if (listing.type === "ITEM" && !["HOUR", "DAY"].includes(billingUnit)) {
      return res.status(400).json({
        success: false,
        message: "ITEM listings can only be billed by HOUR or DAY",
      });
    }

    let guestCount = 1;

    if (listing.type === "SERVICE" && billingUnit === "PER_GUEST") {
      const gc = Number(request.guestCount);
      if (!Number.isInteger(gc) || gc < 1) {
        return res.status(400).json({
          success: false,
          message: "guestCount is required for PER_GUEST services",
        });
      }
      guestCount = gc;
    }

    const totalAmount = calculateTotal({
      price: listing.price,
      billingUnit,
      startDate: request.startDate,
      endDate: request.endDate,
      guestCount,
    });

    const rental = await Rental.create({
      listing: listing._id,
      lender: request.lender,
      borrower: request.borrower,
      rentalRequest: request._id,
      startDate: request.startDate,
      endDate: request.endDate,
      priceAtBooking: listing.price,
      billingUnit: billingUnit,
      totalAmount,
    });

    await RentalRequest.findByIdAndUpdate(
      request._id,
      { $set: { status: "APPROVED" } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Rental request approved",
      rental,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to get requests" });
  }
});

const rejectRentalRequest = asynchandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request id" });
    }

    const request = await RentalRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found",
      });
    }

    if (request.lender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to approve this request",
      });
    }

    const rejectionReason = (req.body?.message ?? "").trim();

    if (rejectionReason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Rejection message too long",
      });
    }

    await RentalRequest.findByIdAndUpdate(
      request._id,
      {
        $set: {
          status: "REJECTED",
          rejectionReason: rejectionReason || undefined,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Rental request rejected",
      rejectionReason,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to get reject request" });
  }
});

const cancelRentalRequest = asynchandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request id" });
    }

    const request = await RentalRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found",
      });
    }

    if (request.borrower.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this request",
      });
    }

    await RentalRequest.findByIdAndUpdate(
      request._id,
      {
        $set: {
          status: "CANCELLED",
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Rental request cancelled",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to get cancel reques" });
  }
});

export {
  createRentalRequest,
  getMyRequests,
  getIncomingRequest,
  approveRentalRequest,
  rejectRentalRequest,
  cancelRentalRequest
};
