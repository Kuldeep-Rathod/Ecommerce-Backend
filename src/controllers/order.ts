import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidatCache, reduceStock } from "../utils/features.js";
import errorHandler from "../utils/utilityClass.js";

export const newOrder = TryCatch(
    async (
        req: Request<{}, {}, NewOrderRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const {
            shippingInfo,
            orderItems,
            user,
            subtotal,
            tax,
            shippingCharges,
            discount,
            total,
        } = req.body;

        if (
            !shippingInfo ||
            !orderItems ||
            !user ||
            !subtotal ||
            !tax ||
            !total
        )
            return next(new errorHandler("All fields are required", 400));

        await Order.create({
            shippingInfo,
            orderItems,
            user,
            subtotal,
            tax,
            shippingCharges,
            discount,
            total,
        });

        await reduceStock(orderItems);

        await invalidatCache({ order: true, product: true, admin: true });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
        });
    }
);
