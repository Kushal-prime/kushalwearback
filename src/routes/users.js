const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            user: req.user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: 'Server error while fetching profile'
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage('Please enter a valid phone number'),
    body('address.street')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Street address too long'),
    body('address.city')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('City name too long'),
    body('address.state')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('State name too long'),
    body('address.zipCode')
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage('Zip code too long'),
    body('address.country')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Country name too long'),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL')
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

        const updates = req.body;
        const allowedUpdates = ['name', 'phone', 'address', 'avatar'];
        const filteredUpdates = {};

        // Only allow specific fields to be updated
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            filteredUpdates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            message: 'Server error while updating profile'
        });
    }
});

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
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

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            message: 'Server error while changing password'
        });
    }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        // Soft delete - mark account as inactive
        await User.findByIdAndUpdate(req.user._id, {
            isActive: false
        });

        res.json({
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            message: 'Server error while deleting account'
        });
    }
});

// Admin routes
// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalUsers: total,
                hasNextPage,
                hasPrevPage,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            message: 'Server error while fetching users'
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            message: 'Server error while fetching user'
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', authenticateToken, requireAdmin, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Invalid role'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean')
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

        const updates = req.body;
        const allowedUpdates = ['name', 'email', 'role', 'isActive'];
        const filteredUpdates = {};

        // Only allow specific fields to be updated
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            filteredUpdates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'User updated successfully',
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Update user error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            message: 'Server error while updating user'
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'User deleted successfully',
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            message: 'Server error while deleting user'
        });
    }
});

module.exports = router; 