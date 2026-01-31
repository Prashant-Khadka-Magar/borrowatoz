// routes/rental.routes.js
import express from "express";
import {
  getMyRentals,
  getRentalById,
  cancelRental,
  markRentalCompleted,
} from "../controllers/rental.controller.js";

const router = express.Router();

router.get("/me", getMyRentals);
router.get("/:id", getRentalById);
router.patch("/:id/cancel", cancelRental);
router.patch("/:id/complete", markRentalCompleted);

export default router;
