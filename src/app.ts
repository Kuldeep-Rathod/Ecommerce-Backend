import express from "express";
import dotenv from "dotenv";
import { connect } from "http2";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import morgan from "morgan";


//importing routes
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js"

dotenv.config();

const port = process.env.PORT || 3005;
const mongoURI = process.env.MONGO_URI || "";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

connectDB(mongoURI);

export const myCache = new NodeCache();

app.get("/", (req, res) => {
    res.send(`Server is running on http://localhost:${port}`);
});

// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
