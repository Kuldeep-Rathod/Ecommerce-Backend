import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import {
    deleteProduct,
    getAdminProduct,
    getAllCategories,
    getAllProducts,
    getLatestProduct,
    getSingleProduct,
    newProduct,
    updateProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

//To create a new product - /api/v1/product/new
router.post("/new", isAdmin, singleUpload, newProduct);

//To get all products - /api/v1/product/all
router.get("/all", getAllProducts);

//To get latest 5 products - /api/v1/product/latest
router.get("/latest", getLatestProduct);

//To get all categories - /api/v1/product/categories
router.get("/categories", getAllCategories);

//To get all products of admin - /api/v1/product/admin-product
router.get("/admin-product", isAdmin, getAdminProduct);

//To get, update and delete single product - /api/v1/product/:id
router
    .route("/:id")
    .get(getSingleProduct)
    .put(isAdmin, singleUpload, updateProduct)
    .delete(isAdmin, deleteProduct);

export default router;
