import mongoose, { Schema } from 'mongoose';
import { Product } from './product.js';

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: String,
            ref: 'User', // Reference to your User model
            required: [true, 'User ID is required'],
            unique: true, // Each user has only one wishlist
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product', // Reference to Product model
                    required: [true, 'Product ID is required'],
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Optional: Virtual population to get product details without storing them
wishlistSchema.virtual('products', {
    ref: 'Product',
    localField: 'items.product',
    foreignField: '_id',
    justOne: false,
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
