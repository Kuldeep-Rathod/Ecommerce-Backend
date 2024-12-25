import express from "express";
import dotenv from "dotenv";
import { connect } from "http2";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";

//importing routes
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";


dotenv.config();

const port = process.env.PORT || 3005;

const app = express();

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.send(`Server is running on http://localhost:${port}`);
});

// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
