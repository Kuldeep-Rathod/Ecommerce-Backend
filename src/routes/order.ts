import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import {
    allOrders,
    deleteOrder,
    getSingleOrder,
    myOrders,
    newOrder,
    processOrder,
} from "../controllers/order.js";

const router = express.Router();

//route "/api/v1/order/new"
router.post("/new", newOrder);

//route "/api/v1/order/my"
router.get("/my", myOrders);

//route "/api/v1/order/all"
router.get("/all", isAdmin, allOrders);

//route "/api/v1/order/:id"
router
    .route("/:id")
    .get(getSingleOrder)
    .put(isAdmin, processOrder)
    .delete(isAdmin, deleteOrder);

export default router;
