import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import { Listing } from "../models/listing.model.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const getMyConversations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Conversation.find({ participants: toObjectId(userId) })
        .select("participants listing lastMessage lastMessageAt")
        .populate("participants", "firstName lastName avatar")
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Conversation.countDocuments({ participants: toObjectId(userId) }),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      conversations: items,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "failed to get my conversations",
    });
  }
});

const getOrCreateConversationFromListing = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const { listingId } = req.params;

    const listing = await Listing.findById(listingId)
      .select("owner title")
      .lean();

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: "Listing not found" });
    }

    const ownerId = listing.owner?.toString();
    if (!ownerId) {
      return res
        .status(400)
        .json({ success: false, message: "Listing owner missing" });
    }

    if (ownerId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message your own listing",
      });
    }

    let conversation = await Conversation.findOne({
      listing: toObjectId(listingId),
      participants: { $all: [toObjectId(userId), toObjectId(ownerId)] },
    });

    

    if (!conversation) {
      conversation = await Conversation.create({
        listing: listingId,
        participants: [userId, ownerId],
        lastMessage: "",
        lastMessageAt: null,
      });
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "failed to get or create conversation",
    });
  }
});

const getConversationById = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const conversation = await Conversation.findById(id)
      .populate("participants", "firstName lastName avatar")
      .lean();

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const isMember = conversation.participants.includes(userId);

    if (!isMember) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "failed to get a conversation",
    });
  }
});

export { getMyConversations, getOrCreateConversationFromListing,getConversationById };
