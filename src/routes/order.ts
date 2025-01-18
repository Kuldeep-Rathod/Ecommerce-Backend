import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { allOrders, getSingleOrder, myOrders, newOrder } from "../controllers/order.js";

const router = express.Router();

//route "/api/v1/order/new"
router.post("/new", newOrder);

//route "/api/v1/order/my"
router.get("/my", myOrders)

//route "/api/v1/order/all"
router.get("/all", isAdmin, allOrders)

//route "/api/v1/order/:id"
router.route("/:id").get(getSingleOrder)

export default router;
