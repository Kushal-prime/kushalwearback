const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    items: [
        {
            id: {
                type: Number,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    shipping: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    payment: {
        method: {
            type: String,
            enum: ['card', 'paypal', 'bank'],
            required: true
        },
        cardNumber: {
            type: String,
            default: ''
        },
        cardExpiry: {
            type: String,
            default: ''
        },
        cardName: {
            type: String,
            default: ''
        }
    },
    backing: {
        newsletter: {
            type: Boolean,
            default: false
        },
        reviews: {
            type: Boolean,
            default: false
        },
        updates: {
            type: Boolean,
            default: false
        },
        special: {
            type: Boolean,
            default: false
        }
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        try {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            
            // Get count of orders today using a more reliable method
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const count = await this.constructor.countDocuments({
                createdAt: {
                    $gte: today,
                    $lt: tomorrow
                }
            });
            
            const orderNumber = `KW${year}${month}${day}${(count + 1).toString().padStart(4, '0')}`;
            this.orderNumber = orderNumber;
        } catch (error) {
            console.error('Error generating order number:', error);
            // Fallback order number
            const timestamp = Date.now().toString().slice(-8);
            this.orderNumber = `KW${timestamp}`;
        }
    }
    next();
});

// Instance method to get order summary
orderSchema.methods.getOrderSummary = function() {
    return {
        orderNumber: this.orderNumber,
        total: this.total,
        status: this.status,
        createdAt: this.createdAt,
        itemCount: this.items.length
    };
};

// Static method to get orders by user
orderSchema.statics.findByUser = function(userId) {
    return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to get orders by status
orderSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema); 