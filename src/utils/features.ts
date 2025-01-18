import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";

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
}: InvalidateCacheProps) => {
    if (product) {
        const productKeys: string[] = [
            "latestProduct",
            "categories",
            "adminProducts",
        ];

        const products = await Product.find({}).select("_id");

        products.forEach((i) => {
            productKeys.push(`product-${i._id}`);
        });

        myCache.del(productKeys);
    }
    if (order) {
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
