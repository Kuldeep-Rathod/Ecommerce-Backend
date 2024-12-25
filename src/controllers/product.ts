import { NextFunction, Request, Response } from "express";
import { errorMiddleware, TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { NewProductRequestBody } from "../types/types.js";
import errorHandler from "../utils/utilityClass.js";
import { rm } from "fs";
import { create } from "domain";

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

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
        });
    }
);

export const getLatestProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(201).json({
            success: true,
            products,
        });
    }
);

export const getAllCategories = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const categories = await Product.find({}).distinct("category");

        return res.status(201).json({
            success: true,
            categories,
        });
    }
);

export const getAdminProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const products = await Product.find({});

        return res.status(201).json({
            success: true,
            products,
        });
    }
);

export const getSingleProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const product = await Product.findById(req.params.id);

        return res.status(201).json({
            success: true,
            product,
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

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
);
