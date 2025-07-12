const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', authenticateToken, [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.id').isNumeric().withMessage('Item ID must be numeric'),
    body('items.*.name').notEmpty().withMessage('Item name is required'),
    body('items.*.price').isNumeric().withMessage('Item price must be numeric'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shipping.name').notEmpty().withMessage('Shipping name is required'),
    body('shipping.email').isEmail().withMessage('Valid shipping email is required'),
    body('shipping.phone').notEmpty().withMessage('Shipping phone is required'),
    body('shipping.address').notEmpty().withMessage('Shipping address is required'),
    body('shipping.city').notEmpty().withMessage('Shipping city is required'),
    body('shipping.state').notEmpty().withMessage('Shipping state is required'),
    body('shipping.zipCode').notEmpty().withMessage('Shipping zip code is required'),
    body('shipping.country').notEmpty().withMessage('Shipping country is required'),
    body('payment.method').isIn(['card', 'paypal', 'bank']).withMessage('Invalid payment method'),
    body('subtotal').isNumeric().withMessage('Subtotal must be numeric'),
    body('tax').isNumeric().withMessage('Tax must be numeric'),
    body('shippingCost').isNumeric().withMessage('Shipping cost must be numeric'),
    body('total').isNumeric().withMessage('Total must be numeric')
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

        const orderData = {
            user: req.user._id,
            items: req.body.items,
            shipping: req.body.shipping,
            payment: req.body.payment,
            backing: req.body.backing || {},
            subtotal: req.body.subtotal,
            tax: req.body.tax,
            shippingCost: req.body.shippingCost,
            total: req.body.total
        };

        const order = new Order(orderData);
        await order.save();

        // Populate user info for response
        await order.populate('user', 'name email');

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                user: order.user,
                items: order.items,
                shipping: order.shipping,
                payment: {
                    method: order.payment.method
                },
                subtotal: order.subtotal,
                tax: order.tax,
                shippingCost: order.shippingCost,
                total: order.total,
                status: order.status,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            message: 'Server error while creating order'
        });
    }
});

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (userId) {
            query.user = userId;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            message: 'Server error while fetching orders'
        });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.findByUser(req.user._id);
        
        res.json({
            orders: orders.map(order => ({
                _id: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                total: order.total,
                status: order.status,
                createdAt: order.createdAt,
                itemCount: order.items.length
            }))
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            message: 'Server error while fetching user orders'
        });
    }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics (admin only)
// @access  Private/Admin
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            summary: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                ordersByStatus: ordersByStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                recentOrders: recentOrders.map(order => ({
                    orderNumber: order.orderNumber,
                    user: order.user ? order.user.name : 'Unknown User',
                    total: order.total,
                    status: order.status,
                    createdAt: order.createdAt
                }))
            }
        });

    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            message: 'Server error while fetching order statistics'
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID (admin or order owner)
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Check if user is admin or order owner
        if (req.user.role !== 'admin' && order.user && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        res.json({
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                user: order.user,
                items: order.items,
                shipping: order.shipping,
                payment: {
                    method: order.payment.method,
                    cardName: order.payment.cardName
                },
                backing: order.backing,
                subtotal: order.subtotal,
                tax: order.tax,
                shippingCost: order.shippingCost,
                total: order.total,
                status: order.status,
                trackingNumber: order.trackingNumber,
                notes: order.notes,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            message: 'Server error while fetching order'
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/:id/status', authenticateToken, requireAdmin, [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid status'),
    body('trackingNumber').optional().isString(),
    body('notes').optional().isString()
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

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        const updates = {
            status: req.body.status
        };

        if (req.body.trackingNumber !== undefined) {
            updates.trackingNumber = req.body.trackingNumber;
        }

        if (req.body.notes !== undefined) {
            updates.notes = req.body.notes;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('user', 'name email');

        res.json({
            message: 'Order status updated successfully',
            order: updatedOrder
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            message: 'Server error while updating order status'
        });
    }
});

module.exports = router; 