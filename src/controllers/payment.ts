import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import errorHandler from "../utils/utilityClass.js";
import { Coupon } from "../models/coupon.js";
import { disconnect } from "process";

// route "/api/v1/payment/coupon/new"
export const newCoupon = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { couponCode, amount } = req.body;

        if (!couponCode || !amount)
            return next(new errorHandler("All fields are required", 400));

        await Coupon.create({ couponCode, amount });

        return res.status(201).json({
            success: true,
            message: `Coupon ${couponCode} created successfully`,
        });
    }
);

// route "/api/v1/payment/discount"
export const applyDiscount = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { couponCode } = req.body;

        const discount = await Coupon.findOne({ couponCode });

        if (!discount)
            return next(new errorHandler("Invalid coupon code", 400));

        return res.status(200).json({
            success: true,
            discount: discount.amount,
        });
    }
);

// route "/api/v1/payment/coupon/all"
export const allCoupons = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const coupons = await Coupon.find({});

        return res.status(200).json({
            success: true,
            coupons,
        });
    }
);

// route "/api/v1/payment/coupon/delete/:couponCode"
export const deleteCoupon = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { couponCode } = req.params;

        const coupon = await Coupon.findOne({ couponCode });

        if (!coupon) return next(new errorHandler("Coupon not found", 404));

        await Coupon.deleteOne({ couponCode });

        return res.status(200).json({
            success: true,
            message: `Coupon ${couponCode} deleted successfully`,
        });
    }
);
