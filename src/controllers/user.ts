import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import errorHandler from "../utils/utilityClass.js";

export const newUser = async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, gender, photo, _id, dob } = req.body;

        const user = await User.create({
            name,
            email,
            gender,
            photo,
            _id,
            dob : new Date(dob),
        });

        res.status(201).json({
            success: true,
            message: `Welcome, ${user.name} at Ecommerce`,
          });
    } catch (error) {
        next(error);
    }
};