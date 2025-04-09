import express from 'express';
import {
    deleteUser,
    getAllUsers,
    getUser,
    newUser,
} from "../controllers/user.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

//route "/api/v1/user/new"
router.post("/new", newUser);

//route "api/v1/user/all"
router.get("/all", isAdmin, getAllUsers);

//route "api/v1/user/dynamic :id"
router.route("/:id").get(getUser).delete(isAdmin, deleteUser);

export default router;
