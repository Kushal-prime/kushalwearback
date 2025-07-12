const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        selectedSize: {
            type: String,
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
        },
        selectedColor: {
            name: String,
            hex: String
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'products.product': 1 });

// Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId, size = null, color = null) {
    // Check if product already exists
    const existingProduct = this.products.find(p => p.product.toString() === productId.toString());
    
    if (existingProduct) {
        // Update existing product with new size/color if provided
        if (size) existingProduct.selectedSize = size;
        if (color) existingProduct.selectedColor = color;
        existingProduct.addedAt = new Date();
    } else {
        // Add new product
        this.products.push({
            product: productId,
            selectedSize: size,
            selectedColor: color
        });
    }
    
    return this.save();
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
    this.products = this.products.filter(p => p.product.toString() !== productId.toString());
    return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
    return this.products.some(p => p.product.toString() === productId.toString());
};

// Method to get wishlist with populated products
wishlistSchema.methods.getPopulatedWishlist = function() {
    return this.populate({
        path: 'products.product',
        select: 'name price mainImage category rating discount isActive'
    });
};

// Static method to find or create wishlist for user
wishlistSchema.statics.findOrCreateForUser = async function(userId) {
    let wishlist = await this.findOne({ user: userId });
    
    if (!wishlist) {
        wishlist = new this({ user: userId, products: [] });
        await wishlist.save();
    }
    
    return wishlist;
};

module.exports = mongoose.model('Wishlist', wishlistSchema); 