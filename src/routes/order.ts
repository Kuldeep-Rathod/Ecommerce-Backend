import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { newOrder } from "../controllers/order.js";

const router = express.Router();

//route "/api/v1/order/new"
router.post("/new", newOrder);

export default router;
