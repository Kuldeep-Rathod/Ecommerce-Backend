import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
    name: string;
    email: string;
    gender: string;
    photo: string;
    _id: string;
    dob: Date;
}

export type ControllerType = any;

//i used "any" because if i use bottom type then i will get error in user.ts in router

// export type ControllerType = (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => Promise<void | Response<any, Record<string, any>>>;
