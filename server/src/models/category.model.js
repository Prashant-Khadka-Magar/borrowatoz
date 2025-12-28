import mongoose,{Schema} from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["ITEM", "SERVICE"],
      required: true,
      index: true,
    },

    order: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);


export const Category=mongoose.model("Category", categorySchema)