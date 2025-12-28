import express from "express";
import { createListing } from "../controllers/listing.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/add-listing",
  protect,
  upload.fields([{ name: "images", maxCount: 10 }]),
  createListing
);

export default router;
