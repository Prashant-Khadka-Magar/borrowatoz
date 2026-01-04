import express from "express";
import { getCategoriesNames } from "../controllers/listing.controller.js";

const router = express.Router();

router.get("/", getCategoriesNames);

export default router;
