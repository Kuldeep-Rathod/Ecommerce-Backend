import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import {
    allCoupons,
    applyDiscount,
    deleteCoupon,
    newCoupon,
} from "../controllers/payment.js";

const router = express.Router();

//route "/api/v1/payment/discount"
router.get("/discount", applyDiscount);

//route "/api/v1/payment/coupon/new"
router.post("/coupon/new", isAdmin, newCoupon);

//route "/api/v1/payment/coupon/all"
router.get("/coupon/all", isAdmin, allCoupons);


//route "/api/v1/payment/coupon/delete/:couponCode"
router.delete("/coupon/delete/:couponCode", isAdmin, deleteCoupon);

export default router;

