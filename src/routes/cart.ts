import express from 'express';
import {
    upsertCart,
    getCart,
    removeCartItem,
    clearCart,
} from '../controllers/cart.js';

const router = express.Router();

// Route: POST "/api/v1/cart/upsert"
router.post('/upsert', upsertCart);

// Route: GET "/api/v1/cart/my"
router.get('/my', getCart);

// Route: DELETE "/api/v1/cart/clear"
router.delete('/clear', clearCart);

// Route: DELETE "/api/v1/cart/:productId"
router.delete('/:productId', removeCartItem);

export default router;
