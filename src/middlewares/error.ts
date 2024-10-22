import { NextFunction, Request, Response } from "express";
import errorHandler from "../utils/utilityClass.js";
import { ControllerType } from "../types/types.js";

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

export const TryCatch =
    (func: ControllerType) =>
    (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(func(req, res, next)).catch(next);
    };
