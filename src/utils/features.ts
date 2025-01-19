import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";

export const connectDB = async (uri: string) => {
    try {
        await mongoose.connect(uri, {
            dbName: "Ecommerce",
        });
        const connection = mongoose.connection;
        console.log(`MongoDB connected to ${connection.host}`);
    } catch (error) {
        console.log(error);
    }
};

export const invalidatCache = async ({
    product,
    order,
    admin,
    userId,
    orderId,
    productId,
}: InvalidateCacheProps) => {
    if (product) {
        const productKeys: string[] = [
            "latestProduct",
            "categories",
            "adminProducts",
        ];

        if (typeof productId === "string") {
            productKeys.push(`product-${productId}`);
        }

        if (typeof productId === "object") {
            productId.forEach((i) => productKeys.push(`product-${i}`));
        }

        myCache.del(productKeys);
    }
    if (order) {
        const orderKeys: string[] = [
            `all-orders`,
            `my-orders-${userId}`,
            `order-${orderId}}`,
        ];

        myCache.del(orderKeys);
    }
    if (admin) {
    }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);

        if (!product) throw new Error("Product not found");

        product.stock -= order.quantity;
        await product.save();
    }
};
