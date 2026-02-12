import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
  {
    // For BorrowAtoZ: most chats are between borrower & lender, often tied to listing/rentalRequest
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      validate: [(arr) => arr.length >= 2, "At least 2 participants required"],
      index: true,
      required: true,
    },

    listing: { type: Schema.Types.ObjectId, ref: "Listing", index: true },
    rentalRequest: { type: Schema.Types.ObjectId, ref: "RentalRequest", index: true },
    rental: { type: Schema.Types.ObjectId, ref: "Rental", index: true },

    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },

    // Simple “soft” state (optional)
    isBlocked: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Helps quickly find a conversation by the same participants+context
conversationSchema.index(
  { participants: 1, listing: 1, rentalRequest: 1, rental: 1 },
  { name: "participants_context_idx" }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
