import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import {
    getBarCharts,
    getDashboardStatistics,
    getLineCharts,
    getPieCharts,
} from "../controllers/statistics.js";

const router = express.Router();

//route "/api/v1/dashboard/statistics"
router.get("/statistics", isAdmin, getDashboardStatistics);

//route "/api/v1/dashboard/pie"
router.get("/pie", isAdmin, getPieCharts);

//route "/api/v1/dashboard/bar"
router.get("/bar", isAdmin, getBarCharts);

//route "/api/v1/dashboard/line"
router.get("/line", isAdmin, getLineCharts);

export default router;
