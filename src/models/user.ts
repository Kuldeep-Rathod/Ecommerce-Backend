import mongoose from "mongoose";
import validator from "validator";

interface IUser {
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "admin" | "user";
    gender: "Male" | "Female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    // virtual properties
    age: number;
}

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: [true, "Please enter user id"],
        },
        name: {
            type: String,
            required: [true, "Please enter user name"],
        },
        email: {
            type: String,
            required: [true, "Please enter user email"],
            unique: [true, "Email already exists"],
            validate: validator.default.isEmail,
        },
        photo: {
            type: String,
            required: [true, "Please add user photo"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        gender: {
            type: String,
            enum: ["Male", "Female"],
            required: [true, "Please enter user gender"],
        },
        dob: {
            type: Date,
            required: [true, "Please enter date of birth"],
        },
    },
    {
        timestamps: true,
    }
);

userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    const age = today.getFullYear() - dob.getFullYear();

    if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
        return age - 1;
    } else {
        return age;
    }
});

export const User = mongoose.model<IUser>("User", userSchema);
