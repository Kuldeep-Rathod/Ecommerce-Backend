import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import {
    allCoupons,
    applyDiscount,
    createPaymentIntent,
    deleteCoupon,
    newCoupon,
} from "../controllers/payment.js";

const router = express.Router();

//route "/api/v1/payment/create"
router.post("/create", createPaymentIntent);

//route "/api/v1/payment/discount"
router.post("/discount", applyDiscount);

//route "/api/v1/payment/coupon/new"
router.post("/coupon/new", isAdmin, newCoupon);

//route "/api/v1/payment/coupon/all"
router.get("/coupon/all", isAdmin, allCoupons);


//route "/api/v1/payment/coupon/delete/:couponCode"
router.delete("/coupon/delete/:couponCode", isAdmin, deleteCoupon);

export default router;

