import express from "express";
import {
  addPhoto,
  browseListing,
  createListing,
  getListingById,
  removePhoto,
  updateListing,
} from "../controllers/listing.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/add-listing",
  protect,
  upload.fields([{ name: "images", maxCount: 10 }]),
  createListing
);

router.get("/", browseListing);
router.get("/:id", getListingById);
router.post("/update/:id", protect, updateListing);
router.post(
  "/update/:id/add-photo",
  protect,
  upload.fields([{ name: "images", maxCount: 10 }]),
  addPhoto
);
router.post("/update/:id/remove-photo", protect, removePhoto);

export default router;
