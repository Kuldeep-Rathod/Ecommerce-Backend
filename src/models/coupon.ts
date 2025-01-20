import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: [true, "Please enter coupon code"],
        unique: [true, "Coupon code already exists"],
    },
    amount: {
        type: Number,
        required: [true, "Please enter discount amount"],
    },
});

export const Coupon = mongoose.model("Coupon", couponSchema);
