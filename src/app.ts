import express from "express";

//importing routes
import userRoutes from "./routes/user.js";
import { connect } from "http2";
import { connectDB } from "./utils/features.js";

const port = 4000;

const app = express();

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.send(`Server is running on http://localhost:${port}`);
})

// using routes
app.use("/api/v1/user", userRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
