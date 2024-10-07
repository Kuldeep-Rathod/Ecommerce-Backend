import express from "express";
import { newUser } from "../controllers/user.js";

const router = express.Router();

//route "/api/v1/user/new"
router.post("/new", newUser);
router.get("/now", user);

export default router;
