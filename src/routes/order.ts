import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { myOrders, newOrder } from "../controllers/order.js";

const router = express.Router();

//route "/api/v1/order/new"
router.post("/new", newOrder);

//route "/api/v1/order/my"
router.get("/my", myOrders)

export default router;
