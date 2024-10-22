import express from "express";
import {
    deleteUser,
    getAllUsers,
    getUser,
    newUser,
} from "../controllers/user.js";

const router = express.Router();

//route "/api/v1/user/new"
router.post("/new", newUser);

//route "api/v1/user/all"
router.get("/all", getAllUsers);

//route "api/v1/user/dynamic :id"
router.route("/:id").get(getUser).delete(deleteUser);

export default router;
