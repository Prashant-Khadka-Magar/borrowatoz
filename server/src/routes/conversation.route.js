import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getConversationMessages,
  markConversationRead,
  sendMessage,
} from "../controllers/message.controller.js";
import {
  getConversationById,
  getMyConversations,
  getOrCreateConversationFromListing,
} from "../controllers/conversation.controller.js";

const router = express.Router();

//conversation
router.post(
  "/from-listing/:listingId",
  protect,
  getOrCreateConversationFromListing,
);
router.get("/me", protect, getMyConversations);
router.get("/:id", protect, getConversationById);

//Message
router.get("/:id/messages", protect, getConversationMessages);
router.post("/:id/messages", protect, sendMessage);
router.patch("/:id//read", protect, markConversationRead);

export default router;
