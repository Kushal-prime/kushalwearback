const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateCartItem = [
    body('productId')
        .isMongoId()
        .withMessage('Invalid product ID'),
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    body('size')
        .optional()
        .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'])
        .withMessage('Invalid size'),
    body('color.name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Color name must be between 1 and 50 characters'),
    body('color.hex')
        .optional()
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('Invalid color hex code')
];

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOrCreateCart(req.user._id);
        const populatedCart = await cart.getPopulatedCart();

        res.json({
            cart: {
                id: populatedCart._id,
                items: populatedCart.items,
                totalItems: populatedCart.totalItems,
                totalPrice: populatedCart.totalPrice,
                lastUpdated: populatedCart.lastUpdated
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            message: 'Server error while fetching cart'
        });
    }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', authenticateToken, validateCartItem, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { productId, quantity, size, color } = req.body;

        // Check if product exists and is active
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                message: 'Product is not available'
            });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Get or create cart
        const cart = await Cart.findOrCreateCart(req.user._id);

        // Add item to cart
        await cart.addItem(productId, quantity, size, color, product.price);

        // Get updated cart with populated products
        const updatedCart = await cart.getPopulatedCart();

        res.json({
            message: 'Item added to cart successfully',
            cart: {
                id: updatedCart._id,
                items: updatedCart.items,
                totalItems: updatedCart.totalItems,
                totalPrice: updatedCart.totalPrice,
                lastUpdated: updatedCart.lastUpdated
            }
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            message: 'Server error while adding item to cart'
        });
    }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', authenticateToken, [
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user._id, isActive: true });
        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        // Find the item in cart
        const cartItem = cart.items.id(itemId);
        if (!cartItem) {
            return res.status(404).json({
                message: 'Item not found in cart'
            });
        }

        // Check stock availability
        const product = await Product.findById(cartItem.product);
        if (product && product.stock < quantity) {
            return res.status(400).json({
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Update quantity
        await cart.updateQuantity(itemId, quantity);

        // Get updated cart with populated products
        const updatedCart = await cart.getPopulatedCart();

        res.json({
            message: 'Cart item updated successfully',
            cart: {
                id: updatedCart._id,
                items: updatedCart.items,
                totalItems: updatedCart.totalItems,
                totalPrice: updatedCart.totalPrice,
                lastUpdated: updatedCart.lastUpdated
            }
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            message: 'Server error while updating cart item'
        });
    }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', authenticateToken, async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id, isActive: true });
        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        // Check if item exists in cart
        const cartItem = cart.items.id(itemId);
        if (!cartItem) {
            return res.status(404).json({
                message: 'Item not found in cart'
            });
        }

        // Remove item
        await cart.removeItem(itemId);

        // Get updated cart with populated products
        const updatedCart = await cart.getPopulatedCart();

        res.json({
            message: 'Item removed from cart successfully',
            cart: {
                id: updatedCart._id,
                items: updatedCart.items,
                totalItems: updatedCart.totalItems,
                totalPrice: updatedCart.totalPrice,
                lastUpdated: updatedCart.lastUpdated
            }
        });

    } catch (error) {
        console.error('Remove cart item error:', error);
        res.status(500).json({
            message: 'Server error while removing cart item'
        });
    }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id, isActive: true });
        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        // Clear cart
        await cart.clearCart();

        res.json({
            message: 'Cart cleared successfully',
            cart: {
                id: cart._id,
                items: [],
                totalItems: 0,
                totalPrice: 0,
                lastUpdated: cart.lastUpdated
            }
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            message: 'Server error while clearing cart'
        });
    }
});

// @route   GET /api/cart/count
// @desc    Get cart item count
// @access  Private
router.get('/count', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id, isActive: true });
        
        if (!cart) {
            return res.json({
                count: 0
            });
        }

        res.json({
            count: cart.totalItems
        });

    } catch (error) {
        console.error('Get cart count error:', error);
        res.status(500).json({
            message: 'Server error while getting cart count'
        });
    }
});

// @route   POST /api/cart/merge
// @desc    Merge guest cart with user cart (for when user logs in)
// @access  Private
router.post('/merge', authenticateToken, async (req, res) => {
    try {
        const { guestCart } = req.body;

        if (!guestCart || !Array.isArray(guestCart)) {
            return res.status(400).json({
                message: 'Invalid guest cart data'
            });
        }

        const cart = await Cart.findOrCreateCart(req.user._id);

        // Merge guest cart items
        for (const item of guestCart) {
            try {
                const product = await Product.findById(item.id);
                if (product && product.isActive && product.stock > 0) {
                    await cart.addItem(
                        item.id,
                        Math.min(item.quantity, product.stock),
                        item.size,
                        item.color,
                        product.price
                    );
                }
            } catch (error) {
                console.error('Error merging item:', error);
                // Continue with other items
            }
        }

        // Get updated cart with populated products
        const updatedCart = await cart.getPopulatedCart();

        res.json({
            message: 'Guest cart merged successfully',
            cart: {
                id: updatedCart._id,
                items: updatedCart.items,
                totalItems: updatedCart.totalItems,
                totalPrice: updatedCart.totalPrice,
                lastUpdated: updatedCart.lastUpdated
            }
        });

    } catch (error) {
        console.error('Merge cart error:', error);
        res.status(500).json({
            message: 'Server error while merging cart'
        });
    }
});

module.exports = router; 