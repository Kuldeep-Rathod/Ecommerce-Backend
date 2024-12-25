import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { newProduct } from "../controllers/product.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAdmin, upload, newProduct);

export default router;
