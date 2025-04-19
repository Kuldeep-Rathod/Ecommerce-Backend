import { Request, Response } from 'express';
import { Wishlist } from '../models/wishlist.js';
import { Product } from '../models/product.js';
import { TryCatch } from '../middlewares/error.js';
import mongoose from 'mongoose';

export const getWishlist = TryCatch(async (req: Request, res: Response) => {
    const { userId } = req.query;

    console.log(userId);

    const wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name price originalPrice images category stock', // Only fetch needed fields
    });

    if (!wishlist) {
        return res.status(200).json({ success: true, items: [] });
    }

    return res.status(200).json({
        success: true,
        items: wishlist.items,
    });
});

export const toggleWishlistItem = TryCatch(
    async (req: Request, res: Response) => {
        const { productId, userId }: { productId: string; userId: string } =
            req.body;

        if (!productId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and User ID are required',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Product ID format',
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const wishlist = await Wishlist.findOne({ user: userId });
        const existingItem = wishlist?.items.find((item) =>
            item.product.equals(productId)
        );

        let updatedWishlist;
        if (existingItem) {
            updatedWishlist = await Wishlist.findOneAndUpdate(
                { user: userId },
                { $pull: { items: { product: productId } } },
                { new: true }
            ).populate('items.product');
        } else {
            updatedWishlist = await Wishlist.findOneAndUpdate(
                { user: userId },
                { $addToSet: { items: { product: productId } } },
                { upsert: true, new: true }
            ).populate('items.product');
        }

        return res.status(200).json({
            success: true,
            message: existingItem
                ? 'Removed from wishlist'
                : 'Added to wishlist',
            // wishlist: updatedWishlist,
        });
    }
);

export const removeWishlistItem = TryCatch(
    async (req: Request, res: Response) => {
        const { userId }: { userId: string } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID are required',
            });
        }

        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { user: userId },
            { $pull: { items: { product: req.params.productId } } },
            { new: true }
        ).populate('items.product');

        if (!updatedWishlist) {
            return res
                .status(404)
                .json({ success: false, message: 'Wishlist not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Item removed',
            wishlist: updatedWishlist,
        });
    }
);

export const clearWishlist = TryCatch(async (req: Request, res: Response) => {
    const { userId }: { userId: string } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID are required',
        });
    }

    await Wishlist.findOneAndDelete({ user: userId });
    return res.status(200).json({
        success: true,
        message: 'Wishlist cleared',
    });
});
