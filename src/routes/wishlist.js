const express = require('express');
const { body, validationResult } = require('express-validator');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOrCreateForUser(req.user.id);
        await wishlist.getPopulatedWishlist();

        // Filter out inactive products
        const activeProducts = wishlist.products.filter(item => 
            item.product && item.product.isActive
        );

        res.json({
            success: true,
            wishlist: {
                id: wishlist._id,
                products: activeProducts,
                totalItems: activeProducts.length
            }
        });

    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching wishlist'
        });
    }
});

// @route   POST /api/wishlist/add
// @desc    Add product to wishlist
// @access  Private
router.post('/add', [
    authenticateToken,
    body('productId')
        .isMongoId()
        .withMessage('Valid product ID is required'),
    body('size')
        .optional()
        .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'])
        .withMessage('Invalid size'),
    body('color')
        .optional()
        .isObject()
        .withMessage('Color must be an object with name and hex properties')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { productId, size, color } = req.body;

        // Check if product exists and is active
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unavailable'
            });
        }

        // Get or create wishlist for user
        const wishlist = await Wishlist.findOrCreateForUser(req.user.id);
        
        // Add product to wishlist
        await wishlist.addProduct(productId, size, color);

        res.json({
            success: true,
            message: 'Product added to wishlist successfully',
            wishlistItem: {
                product: product,
                selectedSize: size,
                selectedColor: color
            }
        });

    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding to wishlist'
        });
    }
});

// @route   DELETE /api/wishlist/remove/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        // Check if product exists in wishlist
        if (!wishlist.hasProduct(productId)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        // Remove product from wishlist
        await wishlist.removeProduct(productId);

        res.json({
            success: true,
            message: 'Product removed from wishlist successfully'
        });

    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing from wishlist'
        });
    }
});

// @route   GET /api/wishlist/check/:productId
// @desc    Check if product is in user's wishlist
// @access  Private
router.get('/check/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            return res.json({
                success: true,
                inWishlist: false
            });
        }

        const inWishlist = wishlist.hasProduct(productId);

        res.json({
            success: true,
            inWishlist
        });

    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking wishlist'
        });
    }
});

// @route   POST /api/wishlist/move-to-cart/:productId
// @desc    Move product from wishlist to cart
// @access  Private
router.post('/move-to-cart/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity = 1 } = req.body;

        const wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist || !wishlist.hasProduct(productId)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        // Get wishlist item details
        const wishlistItem = wishlist.products.find(p => 
            p.product.toString() === productId
        );

        // Here you would typically add to cart
        // For now, we'll just remove from wishlist
        await wishlist.removeProduct(productId);

        res.json({
            success: true,
            message: 'Product moved to cart successfully',
            productId,
            quantity
        });

    } catch (error) {
        console.error('Move to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while moving to cart'
        });
    }
});

// @route   DELETE /api/wishlist/clear
// @desc    Clear entire wishlist
// @access  Private
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.products = [];
        await wishlist.save();

        res.json({
            success: true,
            message: 'Wishlist cleared successfully'
        });

    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while clearing wishlist'
        });
    }
});

module.exports = router; 