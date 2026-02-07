import express from "express";
import { login, logout, profile, register, verifyOtp } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { getLenderProviderRating } from "../controllers/rental.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);
router.get("/profile",protect, profile);
router.get("/:id/provider-rating", getLenderProviderRating);
router.get("/:id/borrower-rating", getBorrowerRatingSummary);


export default router;
