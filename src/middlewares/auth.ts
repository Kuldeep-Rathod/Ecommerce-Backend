import { NextFunction, Request, Response } from "express";
import errorHandler from "../utils/utilityClass.js";
import { User } from "../models/user.js";

//middleware to check if user is admin only
export const isAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.query;

    if (!id) return next(new errorHandler("Login first", 401));

    const user = await User.findById(id);

    if (!user) return next(new errorHandler("User not found", 404));

    if (user.role !== "admin")
        return next(new errorHandler("Not authorized", 401));

    next();
};
