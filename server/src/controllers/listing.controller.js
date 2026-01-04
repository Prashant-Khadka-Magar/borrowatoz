import asyncHandler from "express-async-handler";
import { Listing } from "../models/listing.model.js";
import { Category } from "../models/category.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import mongoose from "mongoose";

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

// city,type,category,q,minPrice,maxPrice,priceUnit,deliveryMode,page,limit,sort
const browseListing = asyncHandler(async (req, res) => {
  try {
    let filter = {};

    const city = (req.query.city || "toronto").trim().toLowerCase();
    filter.city = city;

    const type = (req.query.type ?? "").trim().toUpperCase();

    if (type) {
      if (!["ITEM", "SERVICE"].includes(type)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid type" });
      }
      filter.type = type;
    }

    const category = (req.query.category ?? "").toString().trim();
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category id" });
      }

      filter.category = new mongoose.Types.ObjectId(category);
    }

    //no filtering option based on price unit fot customers
    //no filtering option based on deliverymode fot customers

    const minPriceRaw = req.query.minPrice;
    const maxPriceRaw = req.query.maxPrice;

    if (minPriceRaw != null || maxPriceRaw != null) {
      const priceFilter = {};

      if (minPriceRaw != null) {
        const minPrice = Number(minPriceRaw);
        if (!Number.isFinite(minPrice) || minPrice < 0) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid minPrice" });
        }
        priceFilter.$gte = minPrice;
      }

      if (maxPriceRaw != null) {
        const maxPrice = Number(maxPriceRaw);
        if (!Number.isFinite(maxPrice) || maxPrice < 0) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid maxPrice" });
        }
        priceFilter.$lte = maxPrice;
      }

      filter.price = priceFilter;
    }

    const q = (req.query.q || "").trim();
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const sortKey = (req.query.sort ?? "newest").toString();

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
    };

    const sort = sortMap[sortKey] ?? sortMap.newest;

    const pageRaw = req.query.page;
    const page = Number.parseInt(pageRaw, 10) || 1;
    const limit = 10;
    const skip = page * limit - limit;

    const projection =
      "title type images price priceUnit deliveryMode city owner createdAt";

    const [items, total] = await Promise.all([
      Listing.find(filter)
        .select(projection)
        .populate({ path: "owner", select: "firstName lastName" })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    res.status(500).json({ message: "error getting messages" });
  }
});

const getListingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, json: "Invalid ID" });
    }

    const listing = await Listing.findById(id)
      .populate({ path: "category", select: "name slug type" })
      .populate({ path: "owner", select: "firstName lastName" })
      .lean();

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    return res.status(200).json({ success: true, listing });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "error getting specific listing" });
  }
});

const getCategoriesNames = asyncHandler(async (req, res) => {
  try {
    const type = (req.query.type ?? "").toString().trim().toUpperCase();

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "type query param is required",
      });
    }

    if (!["ITEM", "SERVICE"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
      });
    }

    const categories = await Category.find({ type })
      .select("name") // include slug if you need URLs
      .sort({ order: 1, name: 1 }) // if order exists
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "error getting categories" });
  }
});
export { createListing, browseListing, getListingById, getCategoriesNames };
