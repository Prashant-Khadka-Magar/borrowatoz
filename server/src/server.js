import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/index.js";
import userRoutes from "./routes/user.route.js";
import listingRoutes from "./routes/listing.route.js";
import categoryRoutes from "./routes/category.route.js";
import rentalRequestRoutes from './routes/rentalRequest.route.js'
import cors from "cors";

dotenv.config({
  path: "./.env",
});

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());
// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: false }));
// Middleware to parse cookies from incoming requests
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/rental-requests", rentalRequestRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on ${PORT} `);
});


