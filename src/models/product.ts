import mongoose from "mongoose";
import { trim } from "validator";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter product name"],
        },
        photo: {
            type: String,
            required: [true, "Please add product photo"],
        },
        price: {
            type: String,
            required: [true, "Please enter product price"],
        },
        stock: {
            type: String,
            required: [true, "Please enter stock"],
        },
        category: {
            type: String,
            required: [true, "Please enter category"],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model("Product", productSchema);
