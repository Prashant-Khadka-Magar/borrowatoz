import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    participantsHash: { type: String, required: true, index: true },

    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true },
);



conversationSchema.index({ participants: 1, listing: 1 }, { unique: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);
