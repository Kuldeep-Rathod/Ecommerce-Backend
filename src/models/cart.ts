import mongoose, { Schema } from 'mongoose';

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: String,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
        },
        cartItems: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, 'Product ID is required'],
                },
                quantity: {
                    type: Number,
                    required: [true, 'Quantity is required'],
                    min: [1, 'Quantity must be at least 1'],
                },
                price: {
                    type: Number,
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                    required: true,
                },
                stock: {
                    type: Number,
                    required: true,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        subTotal: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        shippingCharges: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Optional: If you want to populate full product details for debugging/UI
cartSchema.virtual('products', {
    ref: 'Product',
    localField: 'cartItems.productId',
    foreignField: '_id',
    justOne: false,
});

export const Cart = mongoose.model('Cart', cartSchema);
