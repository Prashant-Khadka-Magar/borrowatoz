import asyncHandler from "express-async-handler";
import { Listing } from "../models/listing.model.js";
import { Category } from "../models/category.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const createListing = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const title = (req.body.title ?? "").trim();
  const description = (req.body.description ?? "").trim();
  const type = req.body.type;
  const category = req.body.category ?? null;

  const images = Array.isArray(req.body.images) ? req.body.images : [];

  const priceRaw = req.body.price;
  const price = typeof priceRaw === "string" ? Number(priceRaw) : priceRaw;

  const priceUnit = req.body.priceUnit ?? "DAY";
  const deliveryMode = req.body.deliveryMode ?? "PICKUP";

  const cityRaw = (req.body.city ?? "").trim();

  if (!title || !description || !type || !cityRaw) {
    return res.status(400).json({
      success: false,
      message: "Required fields are missing",
    });
  }

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid price",
    });
  }

  if (!["ITEM", "SERVICE"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid listing type",
    });
  }

  if (!["HOUR", "DAY", "JOB"].includes(priceUnit)) {
    return res.status(400).json({
      success: false,
      message: "Invalid price unit",
    });
  }

  if (!["PICKUP", "DROPOFF", "DELIVERY", "ONLINE"].includes(deliveryMode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid delivery mode",
    });
  }

  let updatedImages = [];
  const imagePaths = req.files?.images;

  if (imagePaths) {
    for (const imagePath of imagePaths) {
      try {
        const uploadedImage = await uploadOnCloudinary(imagePath.path);
        updatedImages.push({
          url: uploadedImage.url,
          publicId: uploadedImage.public_id,
        });
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res
          .status(500)
          .json({ error: "ERROR UPLOADING IMAGE TO CLOUDINARY" });
      }
    }
  }

  if (category) {
    const categoryDoc = await Category.findById(category).lean();
    if (!categoryDoc || !categoryDoc.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category",
      });
    }

    if (categoryDoc.type !== type) {
      return res.status(400).json({
        success: false,
        message: "Category does not match listing type",
      });
    }
  }

  const listing = await Listing.create({
    owner: userId,
    title,
    description,
    type,
    category,
    images: updatedImages,
    price,
    priceUnit,
    deliveryMode,
    city: cityRaw.toLowerCase(),
  });

  return res.status(201).json({
    success: true,
    message: "Listing created successfully",
    listing,
  });
});

const browseListing = asyncHandler(async (req, res) => {
  try {
    
  } catch (error) {
    res.status(500).json({ message: "error getting messages" });
  }
});

export { createListing };
