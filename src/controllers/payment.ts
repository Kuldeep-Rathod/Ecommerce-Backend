import { NextFunction, Request, Response } from 'express';
import { TryCatch } from '../middlewares/error.js';
import errorHandler from '../utils/utilityClass.js';
import { Coupon } from '../models/coupon.js';
import { stripe } from '../app.js';

// route "/api/v1/payment/create"
export const createPaymentIntent = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { amount } = req.body;

        if (!amount) return next(new errorHandler('Please enter amount', 400));

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(amount) * 100,
            currency: 'inr',
        });

        return res.status(201).json({
            success: true,
            client_secret: paymentIntent.client_secret,
        });
    }
);

// route "/api/v1/payment/coupon/new"
export const newCoupon = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { couponCode, amount } = req.body;

        if (!couponCode || !amount)
            return next(new errorHandler('All fields are required', 400));

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

        if (!couponCode) {
            return next(new errorHandler('Coupon code is required', 400));
        }

        const discount = await Coupon.findOne({ couponCode });

        if (!discount) {
            return next(new errorHandler('Invalid coupon code', 400));
        }

        return res.status(200).json({
            success: true,
            discount: discount.amount,
        });
    }
);

// route "/api/v1/payment/coupon/all"
export const allCoupons = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });

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

        if (!coupon) return next(new errorHandler('Coupon not found', 404));

        await Coupon.deleteOne({ couponCode });

        return res.status(200).json({
            success: true,
            message: `Coupon ${couponCode} deleted successfully`,
        });
    }
);
