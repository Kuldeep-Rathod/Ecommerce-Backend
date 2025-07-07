import { Express } from 'express';

import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import productRoutes from './routes/products.js';
import dashboardRoutes from './routes/statistics.js';
import userRoutes from './routes/user.js';
import wishlistRoutes from './routes/wishlist.js';

export const registerRoutes = (app: Express) => {
    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/product', productRoutes);
    app.use('/api/v1/order', orderRoutes);
    app.use('/api/v1/payment', paymentRoutes);
    app.use('/api/v1/dashboard', dashboardRoutes);
    app.use('/api/v1/wishlist', wishlistRoutes);
    app.use('/api/v1/cart', cartRoutes);
};
