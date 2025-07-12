const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['men', 'women', 'unisex', 'accessories']
    },
    subcategory: {
        type: String,
        trim: true
    },
    images: [{
        type: String,
        required: [true, 'At least one image is required']
    }],
    mainImage: {
        type: String,
        required: [true, 'Main image is required']
    },
    sizes: [{
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    }],
    colors: [{
        name: String,
        hex: String
    }],
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    material: {
        type: String,
        trim: true
    },
    care: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 500
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    discount: {
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        validUntil: Date
    },
    weight: {
        type: Number,
        min: 0
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    }
}, {
    timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    if (this.discount && this.discount.percentage > 0) {
        return this.price - (this.price * this.discount.percentage / 100);
    }
    return this.price;
});

// Virtual for discount status
productSchema.virtual('hasDiscount').get(function() {
    if (!this.discount || this.discount.percentage === 0) return false;
    if (this.discount.validUntil && new Date() > this.discount.validUntil) return false;
    return true;
});

// Method to update rating
productSchema.methods.updateRating = function() {
    if (this.reviews.length === 0) {
        this.rating.average = 0;
        this.rating.count = 0;
        return;
    }
    
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
};

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
    if (!this.sku) {
        this.sku = `KW-${this.category.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
    next();
});

// Pre-save middleware to update rating
productSchema.pre('save', function(next) {
    this.updateRating();
    next();
});

// Static method to find featured products
productSchema.statics.findFeatured = function() {
    return this.find({ isFeatured: true, isActive: true });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true });
};

// Static method to search products
productSchema.statics.search = function(query) {
    return this.find({
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
};

module.exports = mongoose.model('Product', productSchema); 