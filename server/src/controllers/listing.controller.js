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

const updateListing = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const listingId = req.params.id;

  if (!userId)
    return res.status(401).json({ success: false, message: "Not authorized" });

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid listing id" });
  }

  const listing = await Listing.findById(listingId).select("owner type");
  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  if (listing.owner.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to update" });
  }

  const updates = {};

  if (req.body.city != null) {
    const city = String(req.body.city).trim().toLowerCase();
    if (!city)
      return res
        .status(400)
        .json({ success: false, message: "city cannot be empty" });
    updates.city = city;
  }

  if (req.body.type != null) {
    const type = String(req.body.type).trim().toUpperCase();
    if (!["ITEM", "SERVICE"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }
    updates.type = type;
  }

  if (req.body.category != null) {
    const categoryId = String(req.body.category).trim();
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category id" });
    }

    const cat = await Category.findById(categoryId)
      .select("_id type isActive")
      .lean();
    if (!cat || cat.isActive === false) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found/inactive" });
    }

    const effectiveType = updates.type ?? listing.type;
    if (cat.type !== effectiveType) {
      return res.status(400).json({
        success: false,
        message: "Category type does not match listing type",
      });
    }

    updates.category = cat._id;
  }

  if (req.body.price != null) {
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ success: false, message: "Invalid price" });
    }
    updates.price = price;
  }

  if (req.body.priceUnit != null) {
    const priceUnit = String(req.body.priceUnit).trim().toUpperCase();
    if (!["HOUR", "DAY", "JOB"].includes(priceUnit)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priceUnit" });
    }
    updates.priceUnit = priceUnit;
  }

  if (req.body.deliveryMode != null) {
    const deliveryMode = String(req.body.deliveryMode).trim().toUpperCase();
    if (!["PICKUP", "DROPOFF", "DELIVERY", "ONLINE"].includes(deliveryMode)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid deliveryMode" });
    }
    updates.deliveryMode = deliveryMode;
  }

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No valid fields provided to update" });
  }

  const updatedListing = await Listing.findByIdAndUpdate(
    listingId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return res.status(200).json({ success: true, listing: updatedListing });
});

const addPhoto = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const listingId = req.params.id;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid listing id" });
    }

    const listing = await Listing.findById(listingId).select("owner");
    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    if (listing.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to update" });
    }

    const imagePaths = req.files?.images ?? [];

    if (imagePaths.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }
    const updatedImages = [];

    for (const imagePath of imagePaths) {
      try {
        const uploadedImage = await uploadOnCloudinary(imagePath.path);

        if (!uploadedImage?.url || !uploadedImage?.public_id) {
          return res.status(500).json({
            success: false,
            message: "Cloudinary upload failed (missing url/public_id)",
          });
        }

        updatedImages.push({
          url: uploadedImage.url,
          publicId: uploadedImage.public_id,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        return res
          .status(500)
          .json({ error: "ERROR UPLOADING IMAGE TO CLOUDINARY" });
      }
    }

    await Listing.findByIdAndUpdate(
      listingId,
      { $push: { images: { $each: updatedImages } } },
      { new: true, runValidators: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Image updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "error adding photo" });
  }
});

const removePhoto = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const listingId = req.params.id;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid listing id" });
    }

    const listing = await Listing.findById(listingId).select("owner");
    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    if (listing.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to update" });
    }

    const imageId = String(req.body.publicId ?? "").trim();

    if (!imageId) {
      return res
        .status(404)
        .json({ success: false, message: "publicId is required" });
    }

    await Listing.findByIdAndUpdate(
      listingId,
      { $pull: { images: { publicId: imageId } } },
      { new: true, runValidators: true }
    );

    return res
      .status(200)
      .json({ success: true, message: "Image removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "error removing photo" });
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
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "error getting categories" });
  }
});

const getMyListing = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    const listings = await (await Listing.find({ owner: userId }))
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .lean();

    return res.status(200).json({ success: true, listings });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "error getting categories" });
  }
});

export {
  createListing,
  browseListing,
  getListingById,
  getCategoriesNames,
  updateListing,
  addPhoto,
  removePhoto,
  getMyListing
};
