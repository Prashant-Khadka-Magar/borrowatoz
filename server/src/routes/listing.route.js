import express from "express";
import { browseListing, createListing, getListingById } from "../controllers/listing.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/add-listing",
  protect,
  upload.fields([{ name: "images", maxCount: 10 }]),
  createListing
);

router.get("/",browseListing)
router.get("/:id",getListingById)

export default router;
