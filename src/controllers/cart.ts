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

    // Fetch product details for all items
    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const enrichedItems = cartItems.map((item) => {
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

    // Backend calculations
    const subTotal = enrichedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    const shippingCharges = subTotal > 1000 ? 0 : 200;
    const tax = Math.round(subTotal * 0.18);
    const discount = 0; // Add logic if you apply coupons later
    const total = subTotal + tax + shippingCharges - discount;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            cartItems: enrichedItems,
            subTotal,
            tax,
            shippingCharges,
            discount,
            total,
        });
    } else {
        cart.cartItems.splice(0, cart.cartItems.length, ...enrichedItems);
        cart.subTotal = subTotal;
        cart.tax = tax;
        cart.shippingCharges = shippingCharges;
        cart.discount = discount;
        cart.total = total;
        await cart.save();
    }

    res.status(200).json({
        success: true,
        message: 'Cart updated',
        cart,
    });
});

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

    const cart = await Cart.findOne({ user: userId }).populate(
        'cartItems.productId'
    );

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
