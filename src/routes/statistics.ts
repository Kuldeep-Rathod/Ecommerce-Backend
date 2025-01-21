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
router.get("/statistics", getDashboardStatistics);

//route "/api/v1/dashboard/pie"
router.get("/pie", getPieCharts);

//route "/api/v1/dashboard/bar"
router.get("/bar", getBarCharts);

//route "/api/v1/dashboard/line"
router.get("/line", getLineCharts);

export default router;
