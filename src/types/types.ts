import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product.js";

export interface NewUserRequestBody {
    name: string;
    email: string;
    gender: string;
    photo: string;
    _id: string;
    dob: Date;
}

export interface NewProductRequestBody {
    name: string;
    price: number;
    stock: number;
    category: string;
}

export type ControllerType = any;

//i used "any" because if i use bottom type then i will get error in user.ts in router

// export type ControllerType = (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
    search?: string;
    price?: string;
    category?: string;
    sort?: string;
    page?: string;
};

export interface BaseQuery {
    name?: {
        $regex: string;
        $options: string;
    };
    price?: {
        $lte: number;
    };
    category?: string;
}

export type InvalidateCacheProps = {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
};

export type OrderItemType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
};

export type ShippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
};

export interface NewOrderRequestBody {
    shippingInfo: ShippingInfoType;
    user: string;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    orderItems: OrderItemType[];
}
