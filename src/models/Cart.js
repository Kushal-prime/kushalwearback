const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    },
    color: {
        name: String,
        hex: String
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
cartSchema.index({ user: 1, isActive: 1 });
cartSchema.index({ 'items.product': 1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total price
cartSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1, size = null, color = null, price = null) {
    const existingItem = this.items.find(item => 
        item.product.toString() === productId.toString() &&
        item.size === size &&
        item.color?.name === color?.name
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            product: productId,
            quantity,
            size,
            color,
            price
        });
    }
    
    this.lastUpdated = new Date();
    return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
    this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
    this.lastUpdated = new Date();
    return this.save();
};

// Method to update item quantity
cartSchema.methods.updateQuantity = function(itemId, quantity) {
    const item = this.items.id(itemId);
    if (item) {
        if (quantity <= 0) {
            return this.removeItem(itemId);
        }
        item.quantity = quantity;
        this.lastUpdated = new Date();
        return this.save();
    }
    throw new Error('Item not found in cart');
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
    this.items = [];
    this.lastUpdated = new Date();
    return this.save();
};

// Method to get cart with populated products
cartSchema.methods.getPopulatedCart = function() {
    return this.populate({
        path: 'items.product',
        select: 'name price mainImage stock isActive'
    });
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateCart = async function(userId) {
    let cart = await this.findOne({ user: userId, isActive: true });
    
    if (!cart) {
        cart = new this({ user: userId });
        await cart.save();
    }
    
    return cart;
};

// Pre-save middleware to update lastUpdated
cartSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

module.exports = mongoose.model('Cart', cartSchema); 