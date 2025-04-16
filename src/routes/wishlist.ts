import express from 'express';
import {
    clearWishlist,
    getWishlist,
    removeWishlistItem,
    toggleWishlistItem,
} from '../controllers/wishlist.js';

const router = express.Router();

//route "/api/v1/wishlist"
router.get('/', getWishlist);

//route "/api/v1/wishlist/clear"
router.delete('/clear', clearWishlist);

//route "/api/v1/wishlist/:productId"
router.delete('/:productId', removeWishlistItem);

//route "/api/v1/wishlist/toggle"
router.post('/toggle', toggleWishlistItem);

export default router;
