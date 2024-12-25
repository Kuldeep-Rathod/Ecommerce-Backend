import { NextFunction, Request, Response } from "express";
import { errorMiddleware, TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { NewProductRequestBody } from "../types/types.js";
import errorHandler from "../utils/utilityClass.js";
import { rm } from "fs";

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

        if (!name || !price || !stock || !category)
          {

            rm(photo?.path, () => {
              console.log("File deleted successfully");
            })

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
