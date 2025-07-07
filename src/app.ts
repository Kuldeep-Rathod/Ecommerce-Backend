import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import NodeCache from 'node-cache';
import Stripe from 'stripe';
import { connectRedis } from './config/connectRedis.js';
import { errorMiddleware } from './middlewares/error.js';
import { registerRoutes } from './routes.js';
import { connectDB } from './config/connectDB.js';

dotenv.config();

const port = process.env.PORT || 3005;
const mongoURI = process.env.MONGO_URI || '';
const stripeKey = process.env.STRIPE_KEY || '';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

connectDB(mongoURI);
connectRedis();

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

app.get('/', (req, res) => {
    res.send(`Server is running on http://localhost:${port}`);
});

registerRoutes(app);

app.use('/uploads', express.static('uploads'));
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
