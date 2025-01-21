import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { getDashboardStatistics } from "../controllers/statistics.js";

const router = express.Router();

//route "/api/v1/dashboard/statistics"
router.get("/statistics", getDashboardStatistics);

//route "/api/v1/dashboard/pie"
router.get("/pie");

//route "/api/v1/dashboard/bar"
router.get("/bar");

//route "/api/v1/dashboard/line"
router.get("/line");

export default router;
