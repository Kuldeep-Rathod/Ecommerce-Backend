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

export const invalidatCache = ({
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
        myCache.del([
            "admin-statistics",
            "admin-piecharts",
            "admin-barcharts",
            "admin-linecharts",
        ]);
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

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return thisMonth * 100;

    const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
    return Number(percent.toFixed(0));
};

// Count the number of documents for each category
export const getInventories = async ({
    categories,
    totalProducts,
}: {
    categories: string[];
    totalProducts: number;
}) => {
    const categoryCountsPromise = categories.map((category) =>
        Product.countDocuments({ category })
    );

    const results = await Promise.allSettled(categoryCountsPromise);

    const categoryCounts: Record<string, number>[] = [];

    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            categoryCounts.push({
                [categories[index]]: Math.round(
                    (result.value / totalProducts) * 100
                ), // Access the value directly for fulfilled results
            });
        } else {
            console.error(
                `Error counting documents for category ${categories[index]}:`,
                result.reason
            );
        }
    });

    return categoryCounts;
};

export interface MyDocument extends Document {
    createdAt: Date;
    discount: number;
    total: number;
}

type funcProps = {
    length: number;
    docArray: MyDocument[];
    today: Date;
    property?: string;
};

export const getMonthlyCounts = ({
    length,
    docArray,
    today,
    property,
}: funcProps) => {
    const data: number[] = new Array(length).fill(0);

    docArray.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff =
            (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            if (property && i[property as keyof MyDocument] != null) {
                data[length - monthDiff - 1] += i[
                    property as keyof MyDocument
                ] as number;
            } else {
                data[length - monthDiff - 1] += 1;
            }
        }
    });

    return data;
};
