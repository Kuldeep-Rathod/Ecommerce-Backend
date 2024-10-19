import { NextFunction, Request, Response } from "express";
import errorHandler from "../utils/utilityClass.js";

export const errorMiddleware = (
    error: errorHandler,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Ensure error is properly formatted
    error.message = error.message || "Something went wrong";
    error.statusCode = error.statusCode || 500;

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
    });
};
