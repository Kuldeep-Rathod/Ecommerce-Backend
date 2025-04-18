import mongoose from 'mongoose';
import { trim } from 'validator';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        brand: {
            type: String,
            required: [true, 'Brand is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
        },
        originalPrice: {
            type: Number,
            required: [true, 'Original price is required'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        features: {
            type: [String],
            default: [],
        },
        colors: {
            type: [String],
            default: [],
        },
        images: {
            type: [String],
            required: [true, 'At least one image is required'],
            
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model('Product', productSchema);
