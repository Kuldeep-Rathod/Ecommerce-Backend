import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.js';
import { NewUserRequestBody } from '../types/types.js';
import { TryCatch } from '../middlewares/error.js';
import errorHandler from '../utils/utilityClass.js';

export const newUser = TryCatch(
    async (
        req: Request<{}, {}, NewUserRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { name, email, gender, photo, _id, dob } = req.body;

        let user = await User.findById(_id);

        if (user)
            return res.status(200).json({
                success: false,
                message: `Welcome back, ${user.name}`,
            });

        if (!_id || !name || !email || !gender || !photo || !dob)
            return next(new errorHandler('All fields are required', 400));

        user = await User.create({
            name,
            email,
            gender,
            photo,
            _id,
            dob: new Date(dob),
        });

        res.status(201).json({
            success: true,
            message: `Welcome, ${user.name} at Ecommerce`,
        });
    }
);

export const getAllUsers = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const users = await User.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            users,
        });
    }
);

export const getUser = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;

        const user = await User.findById(id);

        if (!user) return next(new errorHandler('User not found', 404));

        return res.status(200).json({
            success: true,
            user,
        });
    }
);

export const deleteUser = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;

        const user = await User.findById(id);

        if (!user) return next(new errorHandler('User not found', 404));

        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    }
);
