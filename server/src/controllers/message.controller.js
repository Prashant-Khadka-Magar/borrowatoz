import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

function mustBeParticipant(conversation, userId) {
  return conversation.participants.some(
    (p) => p.toString() === userId.toString(),
  );
}

const getConversationMessages = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const { id: conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid conversation id" });
  }

  const conversation = await Conversation.findById(conversationId)
    .select("participants")
    .lean();

  if (!conversation) {
    return res
      .status(404)
      .json({ success: false, message: "Conversation not found" });
  }

  if (!mustBeParticipant(conversation, userId)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = { conversation: toObjectId(conversationId) };

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "firstName lastName avatar")
      .lean(),
    Message.countDocuments(filter),
  ]);


   return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    messages,
  });
});


const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id: conversationId } = req.params;

  const text = (req.body?.text ?? "").trim();
  if (!text) {
    return res.status(400).json({ success: false, message: "Text required" });
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ success: false, message: "Invalid conversation id" });
  }

  const conversation = await Conversation.findById(conversationId)
    .select("participants listing")
    .lean();

  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  if (!mustBeParticipant(conversation, userId)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const receiverId = conversation.participants.find(
    (p) => p.toString() !== userId.toString()
  );

  const msg = await Message.create({
    conversation: conversationId,
    sender: userId,
    receiver: receiverId,
    text,
  });

  await Conversation.updateOne(
    { _id: conversationId },
    { $set: { lastMessage: text, lastMessageAt: new Date() } }
  );

  return res.status(201).json({
    success: true,
    message: "Message sent",
    data: msg,
  });
});

const markConversationRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { id: conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ success: false, message: "Invalid conversation id" });
  }

  const conversation = await Conversation.findById(conversationId)
    .select("participants")
    .lean();

  if (!conversation) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  if (!mustBeParticipant(conversation, userId)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const now = new Date();

  const result = await Message.updateMany(
    { conversation: conversationId, receiver: userId, isRead: false },
    { $set: { isRead: true, readAt: now } }
  );

  return res.status(200).json({
    success: true,
    message: "Marked as read",
    updated: result.modifiedCount ?? 0,
  });
});



export { getConversationMessages, sendMessage, markConversationRead };
