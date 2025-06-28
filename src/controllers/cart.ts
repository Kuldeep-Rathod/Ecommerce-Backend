import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TryCatch } from '../middlewares/error.js';
import { Cart } from '../models/cart.js';
import { Product } from '../models/product.js';

export const upsertCart = TryCatch(async (req: Request, res: Response) => {
    const { userId } = req.query;
    const {
        cartItems,
    }: { cartItems: { productId: string; quantity: number }[] } = req.body;

    if (!Array.isArray(cartItems)) {
        return res
            .status(400)
            .json({ success: false, message: 'Invalid cart format' });
    }

    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Map new items
    const newItems = cartItems.map((item) => {
        const product = products.find(
            (p) => p._id.toString() === item.productId
        );
        return {
            productId: new mongoose.Types.ObjectId(item.productId),
            quantity: item.quantity,
            addedAt: new Date(),
            price: product?.price || 0,
            stock: product?.stock || 0,
            name: product?.name || 'Unknown Product',
            image: product?.images?.[0] || '',
        };
    });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // Create a new cart
        const subTotal = newItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        const shippingCharges = subTotal > 1000 ? 0 : 200;
        const tax = Math.round(subTotal * 0.18);
        const discount = 0;
        const total = subTotal + tax + shippingCharges - discount;

        cart = await Cart.create({
            user: userId,
            cartItems: newItems,
            subTotal,
            tax,
            shippingCharges,
            discount,
            total,
        });
    } else {
        // Merge with existing items
        const existingItems = cart.cartItems;

        newItems.forEach((newItem) => {
            const existing = existingItems.find(
                (e) => e.productId.toString() === newItem.productId.toString()
            );
            if (existing) {
                existing.quantity += newItem.quantity;
                existing.addedAt = new Date();
            } else {
                existingItems.push(newItem);
            }
        });

        // Recalculate totals
        const subTotal = existingItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        const shippingCharges = subTotal > 1000 ? 0 : 200;
        const tax = Math.round(subTotal * 0.18);
        const discount = 0;
        const total = subTotal + tax + shippingCharges - discount;

        cart.subTotal = subTotal;
        cart.tax = tax;
        cart.shippingCharges = shippingCharges;
        cart.discount = discount;
        cart.total = total;
        cart.cartItems = existingItems;

        await cart.save();
    }

    res.status(200).json({
        success: true,
        message: 'Cart updated',
        cart,
    });
});

export const updateCartItemQuantity = TryCatch(
    async (req: Request, res: Response) => {
        const { userId, productId, action } = req.query as {
            userId: string;
            productId: string;
            action: 'increment' | 'decrement';
        };

        if (
            !userId ||
            !productId ||
            !['increment', 'decrement'].includes(action)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid userId, productId, or action',
            });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        let itemIndex = cart.cartItems.findIndex(
            (item) => item.productId.toString() === productId
        );

        const itemExists = itemIndex !== -1;

        if (itemExists) {
            const item = cart.cartItems[itemIndex];

            if (action === 'increment') {
                cart.cartItems[itemIndex].quantity += 1;
                cart.cartItems[itemIndex].addedAt = new Date();
            } else if (action === 'decrement') {
                if (item.quantity > 1) {
                    cart.cartItems[itemIndex].quantity -= 1;
                    cart.cartItems[itemIndex].addedAt = new Date();
                } else {
                    cart.cartItems.splice(itemIndex, 1); // Remove item
                }
            }
        } else {
            if (action === 'increment') {
                // Fetch product from DB to get price, stock, etc.
                const product = await Product.findById(productId);

                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Product not found',
                    });
                }

                const newItem = {
                    productId: product._id,
                    quantity: 1,
                    addedAt: new Date(),
                    price: product.price,
                    stock: product.stock,
                    name: product.name,
                    image: product.images?.[0] || '',
                };

                cart.cartItems.push(newItem);
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found in cart',
                });
            }
        }

        // Recalculate totals
        const subTotal = cart.cartItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        const shippingCharges = subTotal > 1000 ? 0 : 200;
        const tax = Math.round(subTotal * 0.18);
        const discount = 0;
        const total = subTotal + tax + shippingCharges - discount;

        cart.subTotal = subTotal;
        cart.tax = tax;
        cart.shippingCharges = shippingCharges;
        cart.discount = discount;
        cart.total = total;

        await cart.save();

        res.status(200).json({
            success: true,
            message: `Item quantity ${
                action === 'increment' ? 'increased' : 'decreased'
            }`,
            cart,
        });
    }
);

export const removeCartItem = TryCatch(async (req: Request, res: Response) => {
    const { userId } = req.query;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return res
            .status(404)
            .json({ success: false, message: 'Cart not found' });
    }

    const item = cart.cartItems.find(
        (item) => item.productId.toString() === productId
    );

    if (!item) {
        return res
            .status(404)
            .json({ success: false, message: 'Item not found in cart' });
    }

    // Use Mongoose's pull method to safely remove the subdocument
    cart.cartItems.pull(item._id); // Pull by subdocument ID
    await cart.save();

    res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        cart,
    });
});

// Get Cart
export const getCart = TryCatch(async (req: Request, res: Response) => {
    const { userId } = req.query;

    const cart = await Cart.findOne({ user: userId });

    res.status(200).json({
        success: true,
        cart: cart || { cartItems: [] },
    });
});

// Clear Cart (e.g., after placing an order)
export const clearCart = TryCatch(async (req: Request, res: Response) => {
    const { userId } = req.query;

    const cart = await Cart.findOneAndDelete({ user: userId });

    if (!cart) {
        return res
            .status(404)
            .json({ success: false, message: 'Cart not found' });
    }

    res.status(200).json({
        success: true,
        message: 'Cart cleared',
    });
});
