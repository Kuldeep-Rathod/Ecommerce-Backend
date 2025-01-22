import { NextFunction, Request, Response } from "express";
import { errorMiddleware, TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import {
    BaseQuery,
    NewProductRequestBody,
    SearchRequestQuery,
} from "../types/types.js";
import errorHandler from "../utils/utilityClass.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidatCache } from "../utils/features.js";

//Revalidate the cache on new, updated, or deleted products and on New orders
export const getLatestProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        let products;

        if (myCache.has("latestProduct")) {
            products = JSON.parse(myCache.get("latestProduct") as string);
        } else {
            products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
            myCache.set("latestProduct", JSON.stringify(products));
        }

        return res.status(200).json({
            success: true,
            products,
        });
    }
);

//Revalidate the cache on new, updated, or deleted products and on New orders
export const getAllCategories = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        let categories;

        if (myCache.has("categories")) {
            categories = JSON.parse(myCache.get("categories") as string);
        } else {
            categories = await Product.find({}).distinct("category");
            myCache.set("categories", JSON.stringify(categories));
        }

        return res.status(200).json({
            success: true,
            categories,
        });
    }
);

//Revalidate the cache on new, updated, or deleted products and on New orders
export const getAdminProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        let products;

        if (myCache.has("adminProducts")) {
            products = JSON.parse(myCache.get("adminProducts") as string);
        } else {
            products = await Product.find({});
            myCache.set("adminProducts", JSON.stringify(products));
        }

        return res.status(201).json({
            success: true,
            products,
        });
    }
);

//Revalidate the cache on new, updated, or deleted products and on New orders
export const getSingleProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        let product;
        const { id } = req.params;

        if (myCache.has(`product-${id}`)) {
            product = JSON.parse(myCache.get(`product-${id}`) as string);
        } else {
            product = await Product.findById(id);
            if (!product) {
                return next(new errorHandler("Product not found", 404));
            }

            myCache.set(`product-${id}`, JSON.stringify(product));
        }

        return res.status(201).json({
            success: true,
            product,
        });
    }
);

export const newProduct = TryCatch(
    async (
        req: Request<{}, {}, NewProductRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { name, price, stock, category } = req.body;
        const photo = req.file;

        if (!photo)
            return next(new errorHandler("Please add product photo", 400));

        if (!name || !price || !stock || !category) {
            rm(photo?.path, () => {
                console.log("File deleted successfully");
            });

            return next(new errorHandler("All fields are required", 400));
        }

        await Product.create({
            name,
            price,
            stock,
            category: category.toLowerCase(),
            photo: photo?.path,
        });

        //invalidate the cache
        invalidatCache({ product: true, admin: true });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
        });
    }
);

export const updateProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { name, price, stock, category } = req.body; // Destructure from req.body

        const product = await Product.findById(id);

        if (!product) {
            return next(new errorHandler("Product not found", 404));
        }

        const photo = req.file;

        // Handle new photo upload
        if (photo) {
            // Delete old photo if it exists
            if (product.photo) {
                rm(product.photo, (err) => {
                    if (err) {
                        console.error("Error deleting old photo:", err);
                    } else {
                        console.log("Old photo deleted successfully");
                    }
                });
            }
            product.photo = photo.path; // Update the photo path
        }

        // Update other fields conditionally
        if (name) product.name = name;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (category) product.category = category.toLowerCase(); // Normalize category

        await product.save(); // Save updated product

        //invalidate the cache
        invalidatCache({
            product: true,
            productId: String(product._id),
            admin: true,
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
        });
    }
);

export const deleteProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params; // Extract ID from request parameters

        const product = await Product.findById(id);

        if (!product) {
            return next(new errorHandler("Product not found", 404));
        }

        // Delete old photo if it exists
        if (product.photo) {
            rm(product.photo, (err) => {
                if (err) {
                    console.error("Error deleting product photo:", err);
                } else {
                    console.log("Product photo deleted successfully");
                }
            });
        }

        // Ensure the correct product is deleted
        await Product.deleteOne({ _id: id });

        //invalidate the cache
        invalidatCache({
            product: true,
            productId: String(product._id),
            admin: true,
        });

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
);

export const getAllProducts = TryCatch(
    async (
        req: Request<{}, {}, {}, SearchRequestQuery>,
        res: Response,
        next: NextFunction
    ) => {
        const { search, price, category, sort } = req.query;

        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

        const skip = (page - 1) * limit;

        const baseQuery: BaseQuery = {};

        if (search)
            baseQuery.name = {
                $regex: search,
                $options: "i",
            };

        if (price)
            baseQuery.price = {
                $lte: Number(price),
            };

        if (category) baseQuery.category = category;

        // Fetch paginated products based on the query, sort, limit, and skip parameters
        const productPromise = Product.find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip);

        const [products, filteredProducts] = await Promise.all([
            productPromise, // Fetch the paginated and sorted products
            Product.find(baseQuery), // Fetch all products that match the filter criteria
        ]);

        const totalPage = Math.ceil(filteredProducts.length / limit);

        return res.status(201).json({
            success: true,
            products,
            totalPage,
        });
    }
);

const deleteRandomsProducts = async (count: number = 10) => {
    const products = await Product.find({}).skip(10);

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        await product.deleteOne();
    }

    console.log({ succecss: true });
};
