const express = require('express');
const { query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    query('category')
        .optional()
        .isIn(['men', 'women', 'unisex', 'accessories'])
        .withMessage('Invalid category'),
    query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number'),
    query('sort')
        .optional()
        .isIn(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'rating'])
        .withMessage('Invalid sort option'),
    query('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters')
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

        const {
            page = 1,
            limit = 12,
            category,
            minPrice,
            maxPrice,
            sort = 'newest',
            search
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort object
        let sortObj = {};
        switch (sort) {
            case 'price_asc':
                sortObj = { price: 1 };
                break;
            case 'price_desc':
                sortObj = { price: -1 };
                break;
            case 'name_asc':
                sortObj = { name: 1 };
                break;
            case 'name_desc':
                sortObj = { name: -1 };
                break;
            case 'rating':
                sortObj = { 'rating.average': -1 };
                break;
            case 'newest':
            default:
                sortObj = { createdAt: -1 };
                break;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const products = await Product.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .select('name price mainImage category rating isFeatured discount');

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        // Calculate pagination info
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts: total,
                hasNextPage,
                hasPrevPage,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            message: 'Server error while fetching products'
        });
    }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.findFeatured()
            .limit(8)
            .select('name price mainImage category rating discount');

        res.json({
            products
        });

    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            message: 'Server error while fetching featured products'
        });
    }
});

// @route   GET /api/products/categories
// @desc    Get products by category
// @access  Public
router.get('/categories/:category', [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
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

        const { category } = req.params;
        const { page = 1, limit = 12 } = req.query;

        // Validate category
        if (!['men', 'women', 'unisex', 'accessories'].includes(category)) {
            return res.status(400).json({
                message: 'Invalid category'
            });
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get products by category
        const products = await Product.findByCategory(category)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('name price mainImage category rating discount');

        // Get total count
        const total = await Product.countDocuments({ category, isActive: true });

        // Calculate pagination info
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            category,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts: total,
                hasNextPage,
                hasPrevPage,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            message: 'Server error while fetching products by category'
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate({
                path: 'reviews.user',
                select: 'name avatar'
            });

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        if (!product.isActive) {
            return res.status(404).json({
                message: 'Product not available'
            });
        }

        res.json({
            product
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            message: 'Server error while fetching product'
        });
    }
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', [
    query('q')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
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

        const { q: query, page = 1, limit = 12 } = req.query;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Search products
        const products = await Product.search(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('name price mainImage category rating discount');

        // Get total count
        const total = await Product.countDocuments({
            $and: [
                { isActive: true },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { tags: { $in: [new RegExp(query, 'i')] } }
                    ]
                }
            ]
        });

        // Calculate pagination info
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            query,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts: total,
                hasNextPage,
                hasPrevPage,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            message: 'Server error while searching products'
        });
    }
});

// @route   POST /api/products/:id/review
// @desc    Add review to product
// @access  Private
router.post('/:id/review', optionalAuth, [
    query('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    query('comment')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comment must be less than 500 characters')
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

        const { id } = req.params;
        const { rating, comment } = req.body;

        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                message: 'Authentication required to add review'
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        if (!product.isActive) {
            return res.status(404).json({
                message: 'Product not available'
            });
        }

        // Check if user already reviewed this product
        const existingReview = product.reviews.find(
            review => review.user.toString() === req.user._id.toString()
        );

        if (existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this product'
            });
        }

        // Add review
        product.reviews.push({
            user: req.user._id,
            rating: parseInt(rating),
            comment: comment || ''
        });

        await product.save();

        // Populate user info for the new review
        const updatedProduct = await Product.findById(id)
            .populate({
                path: 'reviews.user',
                select: 'name avatar'
            });

        res.json({
            message: 'Review added successfully',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            message: 'Server error while adding review'
        });
    }
});

module.exports = router; 