import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { myCache } from "../app.js";
import { da } from "@faker-js/faker";
import { start } from "repl";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
import { User } from "../models/user.js";
import { calculatePercentage } from "../utils/features.js";

export const getDashboardStatistics = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        let dashboardStatistics = {};

        if (myCache.has("admin-statistics")) {
            dashboardStatistics = JSON.parse(
                myCache.get("admin-statistics") as string
            );
        } else {
            const today = new Date();

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const thisMonth = {
                start: new Date(today.getFullYear(), today.getMonth(), 1),
                end: today,
            };

            const lastMonth = {
                start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                end: new Date(today.getFullYear(), today.getMonth(), 0),
            };

            const thisMonthProductsPromise = await Product.find({
                createdAt: {
                    $gte: thisMonth.start,
                    $lt: thisMonth.end,
                },
            });

            const lastMonthProductsPromise = await Product.find({
                createdAt: {
                    $gte: lastMonth.start,
                    $lt: lastMonth.end,
                },
            });

            const thisMonthUsersPromise = await User.find({
                createdAt: {
                    $gte: thisMonth.start,
                    $lt: thisMonth.end,
                },
            });

            const lastMonthUsersPromise = await User.find({
                createdAt: {
                    $gte: lastMonth.start,
                    $lt: lastMonth.end,
                },
            });

            const thisMonthOrdersPromise = await Order.find({
                createdAt: {
                    $gte: thisMonth.start,
                    $lt: thisMonth.end,
                },
            });

            const lastMonthOrdersPromise = await Order.find({
                createdAt: {
                    $gte: lastMonth.start,
                    $lt: lastMonth.end,
                },
            });

            const lastSixMonthsOrdersPromise = await Order.find({
                createdAt: {
                    $gte: sixMonthsAgo,
                    $lt: today,
                },
            });

            const [
                thisMonthProducts,
                lastMonthProducts,
                thisMonthUsers,
                lastMonthUsers,
                thisMonthOrders,
                lastMonthOrders,
                totalProducts,
                totalUsers,
                totalOrders,
                lastSixMonthsOrders,
            ] = await Promise.all([
                thisMonthProductsPromise,
                lastMonthProductsPromise,
                thisMonthUsersPromise,
                lastMonthUsersPromise,
                thisMonthOrdersPromise,
                lastMonthOrdersPromise,
                Product.countDocuments(),
                User.countDocuments(),
                Order.find({}).select("total"),
                lastSixMonthsOrdersPromise,
            ]);

            const thisMonthRevenue = thisMonthOrders.reduce(
                (total, order) => total + (order.total || 0),
                0
            );
            const lastMonthRevenue = lastMonthOrders.reduce(
                (total, order) => total + (order.total || 0),
                0
            );

            const changePercent = {
                revenue: calculatePercentage(
                    thisMonthRevenue,
                    lastMonthRevenue
                ),
                product: calculatePercentage(
                    thisMonthProducts.length,
                    lastMonthProducts.length
                ),
                user: calculatePercentage(
                    thisMonthUsers.length,
                    lastMonthUsers.length
                ),
                order: calculatePercentage(
                    thisMonthOrders.length,
                    lastMonthOrders.length
                ),
            };

            const totalRevenue = totalOrders.reduce(
                (total, order) => total + (order.total || 0),
                0
            );

            const counts = {
                revenue: totalRevenue,
                products: totalProducts,
                users: totalUsers,
                orders: totalOrders.length,
            };

            const orderMonthCounts = new Array(6).fill(0);
            const orderMonthlyRevenue = new Array(6).fill(0);

            lastSixMonthsOrders.forEach((order) => {
                const creationDate = order.createdAt;
                const monthDiff = today.getMonth() - creationDate.getMonth();

                if (monthDiff < 6) {
                    orderMonthCounts[6 - monthDiff - 1] += 1;
                    orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
                }
            });

            dashboardStatistics = {
                changePercent,
                counts,
                chart: {
                    order: orderMonthCounts,
                    revenue: orderMonthlyRevenue,
                },
            };

            myCache.set(
                "admin-statistics",
                JSON.stringify(dashboardStatistics)
            );
        }

        return res.status(200).json({
            success: true,
            Statistics: dashboardStatistics,
        });
    }
);
export const getPieCharts = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {}
);
export const getBarCharts = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {}
);
export const getLineChart = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {}
);
