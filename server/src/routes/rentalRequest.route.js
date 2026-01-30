import express from "express";
import {
  approveRentalRequest,
  cancelRentalRequest,
  createRentalRequest,
  getIncomingRequest,
  getMyRequests,
  rejectRentalRequest,
} from "../controllers/rentalRequest.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/listings/:id", protect, createRentalRequest);
router.get("/me", protect, getMyRequests);
router.get("/incoming", protect, getIncomingRequest);
router.patch("/:id/approve", protect, approveRentalRequest);
router.patch("/:id/reject", protect, rejectRentalRequest);
router.patch("/:id/cancel", protect, cancelRentalRequest);

export default router;
