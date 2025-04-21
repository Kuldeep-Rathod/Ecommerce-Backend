import { NextFunction, Request, Response } from 'express';
import { errorMiddleware, TryCatch } from '../middlewares/error.js';
import { Product } from '../models/product.js';
import {
    BaseQuery,
    NewProductRequestBody,
    SearchRequestQuery,
} from '../types/types.js';
import fs from 'fs';
import errorHandler from '../utils/utilityClass.js';
import { rm } from 'fs';
import { myCache } from '../app.js';
import { invalidatCache } from '../utils/features.js';
import cloudinary from '../utils/cloudinary.js';

//Revalidate the cache on new, updated, or deleted products and on New orders
export const getLatestProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        let products;

        if (myCache.has('latestProduct')) {
            products = JSON.parse(myCache.get('latestProduct') as string);
        } else {
            products = await Product.find({}).sort({ createdAt: -1 }).limit(8);
            myCache.set('latestProduct', JSON.stringify(products));
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

        if (myCache.has('categories')) {
            categories = JSON.parse(myCache.get('categories') as string);
        } else {
            categories = await Product.find({}).distinct('category');
            myCache.set('categories', JSON.stringify(categories));
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

        if (myCache.has('adminProducts')) {
            products = JSON.parse(myCache.get('adminProducts') as string);
        } else {
            products = await Product.find({}).sort({ createdAt: -1 });
            myCache.set('adminProducts', JSON.stringify(products));
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
                return next(new errorHandler('Product not found', 404));
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
        const {
            name,
            price,
            originalPrice,
            stock,
            category,
            brand,
            description,
            features,
            colors,
        } = req.body;

        const images = req.files as Express.Multer.File[];

        console.log('body', req.body); // Check if name, price, etc., are coming
        console.log(req.files);

        // Check required fields
        if (
            !name ||
            !price ||
            !originalPrice ||
            !stock ||
            !category ||
            !brand ||
            !description ||
            !images ||
            images.length === 0
        ) {
            // Clean up uploaded files
            images?.forEach((file) => fs.unlinkSync(file.path));
            return next(
                new errorHandler(
                    'All fields including at least one image are required',
                    400
                )
            );
        }

        // Upload images to Cloudinary
        const imageUploadResults = await Promise.all(
            images.map((image) =>
                cloudinary.uploader.upload(image.path, {
                    folder: 'uploads',
                    resource_type: 'auto',
                })
            )
        );

        // Clean up local files
        images.forEach((image) => fs.unlinkSync(image.path));

        // Build the product object
        const product = await Product.create({
            name,
            price,
            originalPrice,
            stock,
            category: category.toLowerCase(),
            brand,
            description,
            features: Array.isArray(features) ? features : features?.split(','),
            colors: Array.isArray(colors) ? colors : colors?.split(','),
            images: imageUploadResults.map((result) => result.secure_url),
        });

        // Invalidate cache
        invalidatCache({ product: true, admin: true });

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
        });
    }
);

export const updateProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const {
            name,
            price,
            stock,
            category,
            brand,
            description,
            originalPrice,
            features,
            colors,
        } = req.body;

        const files = req.files as Express.Multer.File[];

        const product = await Product.findById(id);
        if (!product) {
            // Clean up any uploaded images
            files?.forEach((file) => fs.unlinkSync(file.path));
            return next(new errorHandler('Product not found', 404));
        }

        // 🔥 Handle new image uploads
        if (files && files.length > 0) {
            // Delete previous images from Cloudinary
            const deleteResults = await Promise.all(
                product.images.map(async (imageUrl) => {
                    const parts = imageUrl.split('/');
                    const publicIdWithExt = parts.slice(-2).join('/');
                    const publicId = publicIdWithExt.replace(
                        /\.(jpg|jpeg|png|webp|gif)$/,
                        ''
                    );
                    return cloudinary.uploader.destroy(publicId);
                })
            );

            console.log('Deleted images from Cloudinary:', deleteResults);

            // Upload new images
            const uploadResults = await Promise.all(
                files.map((file) =>
                    cloudinary.uploader.upload(file.path, {
                        folder: 'uploads',
                        resource_type: 'auto',
                    })
                )
            );

            // Replace images
            product.images = uploadResults.map((result) => result.secure_url);

            // Delete uploaded files from server
            files.forEach((file) => fs.unlinkSync(file.path));
        }

        // ✅ Update other fields conditionally
        if (name) product.name = name;
        if (price) product.price = price;
        if (originalPrice) product.originalPrice = originalPrice;
        if (stock) product.stock = stock;
        if (category) product.category = category.toLowerCase();
        if (brand) product.brand = brand;
        if (description) product.description = description;
        if (features) {
            product.features = Array.isArray(features)
                ? features
                : features.split(',');
        }
        if (colors) {
            product.colors = Array.isArray(colors) ? colors : colors.split(',');
        }

        await product.save();

        // Invalidate cache
        invalidatCache({
            product: true,
            productId: String(product._id),
            admin: true,
        });

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product,
        });
    }
);

export const deleteProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return next(new errorHandler('Product not found', 404));
        }

        // 🧹 Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            await Promise.all(
                product.images.map(async (imageUrl) => {
                    try {
                        const parts = imageUrl.split('/');
                        const publicIdWithExt = parts.slice(-2).join('/');
                        const publicId = publicIdWithExt.replace(
                            /\.(jpg|jpeg|png|webp|gif)$/,
                            ''
                        );
                        const result = await cloudinary.uploader.destroy(
                            publicId
                        );
                        console.log(`Deleted image: ${publicId}`, result);
                    } catch (error) {
                        console.error(
                            'Failed to delete Cloudinary image:',
                            error
                        );
                    }
                })
            );
        }

        // 🗑️ Delete product from DB
        await product.deleteOne();

        // 🚫 Invalidate cache
        invalidatCache({
            product: true,
            productId: String(product._id),
            admin: true,
        });

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
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
                $options: 'i',
            };

        if (price)
            baseQuery.price = {
                $lte: Number(price),
            };

        if (category) baseQuery.category = category;

        // Fetch paginated products based on the query, sort, limit, and skip parameters
        const productPromise = Product.find(baseQuery)
            .sort(sort ? { price: sort === 'asc' ? 1 : -1 } : { createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const [products, filteredProducts] = await Promise.all([
            productPromise,
            Product.find(baseQuery),
        ]);

        const totalPage = Math.ceil(filteredProducts.length / limit);

        return res.status(201).json({
            success: true,
            products,
            totalPage,
        });
    }
);
