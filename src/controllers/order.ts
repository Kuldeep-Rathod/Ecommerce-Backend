import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidatCache, reduceStock } from "../utils/features.js";
import errorHandler from "../utils/utilityClass.js";
import { myCache } from "../app.js";

//Get my orders
export const myOrders = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id: user } = req.query;

        const key = `my-orders-${user}`;

        let orders = [];

        if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
        else {
            orders = await Order.find({ user });
            myCache.set(key, JSON.stringify(orders));
        }

        return res.status(200).json({
            success: true,
            orders,
        });
    }
);

//Get all orders
export const allOrders = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const key = `all-orders`;

        let orders = [];

        if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
        else {
            orders = await Order.find().populate("user", "name");
            myCache.set(key, JSON.stringify(orders));
        }

        return res.status(200).json({
            success: true,
            orders,
        });
    }
);

//Get single order
export const getSingleOrder = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const key = `order-${id}`;

        let order;

        if (myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
        else {
            order = await Order.findById(id).populate("user", "name");

            if (!order) {
                return next(new errorHandler("Order not found", 404));
            }
            myCache.set(key, JSON.stringify(order));
        }

        return res.status(200).json({
            success: true,
            order,
        });
    }
);

//Create new order
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
