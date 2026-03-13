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

conversationSchema.pre("validate", function () {
  if (Array.isArray(this.participants) && this.participants.length === 2) {
    const [a, b] = this.participants.map((id) => id.toString()).sort();
    this.participants = [a, b].map((id) => new mongoose.Types.ObjectId(id));
    this.participantsHash = `${a}_${b}`;
  }
});

// One conversation per (pair + listing)
conversationSchema.index({ participantsHash: 1, listing: 1 }, { unique: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);
