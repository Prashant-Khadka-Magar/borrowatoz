import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["TEXT", "SYSTEM"],
      default: "TEXT",
      index: true,
    },

    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      required: function () {
        return this.type === "TEXT";
      },
    },

    // Read receipts: store who has read it
    readBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
