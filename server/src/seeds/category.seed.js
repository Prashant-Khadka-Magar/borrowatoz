export const categories = [
  // ITEM – TOOLS
  { name: "Power Tools", slug: "power-tools", type: "ITEM", order: 1 },
  { name: "Hand Tools", slug: "hand-tools", type: "ITEM", order: 2 },
  { name: "Gardening Tools", slug: "gardening-tools", type: "ITEM", order: 3 },
  { name: "Construction Equipment", slug: "construction-equipment", type: "ITEM", order: 4 },
  { name: "Automotive Tools", slug: "automotive-tools", type: "ITEM", order: 5 },
  { name: "Measuring Tools", slug: "measuring-tools", type: "ITEM", order: 6 },

  // ITEM – ELECTRONICS / GEAR
  { name: "Camera Equipment", slug: "camera-equipment", type: "ITEM", order: 10 },
  { name: "Audio Equipment", slug: "audio-equipment", type: "ITEM", order: 11 },
  { name: "Lighting Equipment", slug: "lighting-equipment", type: "ITEM", order: 12 },
  { name: "Video Equipment", slug: "video-equipment", type: "ITEM", order: 13 },
  { name: "Projectors", slug: "projectors", type: "ITEM", order: 14 },
  { name: "Computers & Laptops", slug: "computers-laptops", type: "ITEM", order: 15 },
  { name: "Gaming Consoles", slug: "gaming-consoles", type: "ITEM", order: 16 },

  // ITEM – EVENT / OUTDOOR
  { name: "Event Equipment", slug: "event-equipment", type: "ITEM", order: 20 },
  { name: "Party Supplies", slug: "party-supplies", type: "ITEM", order: 21 },
  { name: "Tents & Canopies", slug: "tents-canopies", type: "ITEM", order: 22 },
  { name: "Tables & Chairs", slug: "tables-chairs", type: "ITEM", order: 23 },
  { name: "Outdoor Equipment", slug: "outdoor-equipment", type: "ITEM", order: 24 },

  // SERVICE – HOME & PERSONAL
  { name: "Cleaning Services", slug: "cleaning-services", type: "SERVICE", order: 30 },
  { name: "Moving Help", slug: "moving-help", type: "SERVICE", order: 31 },
  { name: "Handyman Services", slug: "handyman-services", type: "SERVICE", order: 32 },
  { name: "Plumbing Services", slug: "plumbing-services", type: "SERVICE", order: 33 },
  { name: "Electrical Services", slug: "electrical-services", type: "SERVICE", order: 34 },
  { name: "Painting Services", slug: "painting-services", type: "SERVICE", order: 35 },
  { name: "Furniture Assembly", slug: "furniture-assembly", type: "SERVICE", order: 36 },

  // SERVICE – SKILLS / TECH
  { name: "IT Support", slug: "it-support", type: "SERVICE", order: 40 },
  { name: "Web Development", slug: "web-development", type: "SERVICE", order: 41 },
  { name: "Graphic Design", slug: "graphic-design", type: "SERVICE", order: 42 },
  { name: "Tutoring", slug: "tutoring", type: "SERVICE", order: 43 },
  { name: "Photography Services", slug: "photography-services", type: "SERVICE", order: 44 },
  { name: "Videography Services", slug: "videography-services", type: "SERVICE", order: 45 },

  // SERVICE – OUTDOOR / LOGISTICS
  { name: "Landscaping", slug: "landscaping", type: "SERVICE", order: 50 },
  { name: "Lawn Mowing", slug: "lawn-mowing", type: "SERVICE", order: 51 },
  { name: "Snow Removal", slug: "snow-removal", type: "SERVICE", order: 52 },
  { name: "Junk Removal", slug: "junk-removal", type: "SERVICE", order: 53 },
  { name: "Delivery Services", slug: "delivery-services", type: "SERVICE", order: 54 },
];



import { Category } from "../models/category.model.js";
import connectDB from "../db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const seedCategories = async () => {
  try {
    await connectDB();

    await Category.deleteMany(); // safe for dev only
    await Category.insertMany(categories);

    console.log("✅ Categories seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedCategories();
