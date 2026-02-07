// routes/rental.routes.js
import express from "express";
import {
  getMyRentals,
  getRentalById,
  cancelRental,
  markRentalCompleted,
  createListingReviewForRental,
  createBorrowerRatingForRental,
} from "../controllers/rental.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me",protect, getMyRentals);
router.get("/:id",protect, getRentalById);
router.patch("/:id/cancel",protect, cancelRental);
router.patch("/:id/complete",protect, markRentalCompleted);
router.get(":id/reviews",protect,createListingReviewForRental);
router.get(":id/borrower-rating",protect,createBorrowerRatingForRental);

export default router;
