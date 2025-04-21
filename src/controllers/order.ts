import { NextFunction, Request, Response } from 'express';
import { TryCatch } from '../middlewares/error.js';
import { NewOrderRequestBody } from '../types/types.js';
import { Order } from '../models/order.js';
import { invalidatCache, reduceStock } from '../utils/features.js';
import errorHandler from '../utils/utilityClass.js';
import { myCache } from '../app.js';

//Get my orders
export const myOrders = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id: user } = req.query;

        const key = `my-orders-${user}`;

        let orders = [];

        if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
        else {
            orders = await Order.find({ user }).sort({ createdAt: -1 });
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
            orders = await Order.find()
                .sort({ createdAt: -1 })
                .populate('user', 'name');
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
            order = await Order.findById(id).populate('user', 'name');

            if (!order) {
                return next(new errorHandler('Order not found', 404));
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
            subTotal,
            tax,
            shippingCharges,
            discount,
            total,
        } = req.body;

        if (
            !shippingInfo ||
            !orderItems ||
            !user ||
            !subTotal ||
            !tax ||
            !total
        )
            return next(new errorHandler('All fields are required', 400));

        const order = await Order.create({
            shippingInfo,
            orderItems,
            user,
            subTotal,
            tax,
            shippingCharges,
            discount,
            total,
        });

        await reduceStock(orderItems);

        invalidatCache({
            order: true,
            product: true,
            admin: true,
            userId: user,
            productId: order.orderItems.map((i) => String(i.productId)),
        });

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully',
        });
    }
);

//Process order
export const processOrder = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return next(new errorHandler('Order not found', 404));
        }

        switch (order.status) {
            case 'Processing':
                order.status = 'Shipped';
                break;
            case 'Shipped':
                order.status = 'Delivered';
                break;
            default:
                return next(new errorHandler('Order already delivered', 400));
        }

        await order.save();

        // Invalidate the cache for the single order
        const orderKey = `order-${id}`;
        if (myCache.has(orderKey)) {
            myCache.del(orderKey);
        }

        invalidatCache({
            order: true,
            product: false,
            admin: true,
            userId: order.user,
            orderId: String(order._id),
        });

        return res.status(200).json({
            success: true,
            message: 'Order Processed successfully',
        });
    }
);

// Delete order
export const deleteOrder = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return next(new errorHandler('Order not found', 404));
        }

        await order.deleteOne();

        // Invalidate the cache for the single order
        const orderKey = `order-${id}`;
        if (myCache.has(orderKey)) {
            myCache.del(orderKey);
        }

        invalidatCache({
            order: true,
            product: false,
            admin: true,
            userId: order.user,
            orderId: String(order._id),
        });

        return res.status(200).json({
            success: true,
            message: 'Order Deleted successfully',
        });
    }
);
