const mongoose = require('mongoose');
const Product = require('../src/models/Product');
require('dotenv').config();

const sampleProducts = [
    {
        name: "Men's Classic Jacket",
        description: "A timeless classic jacket perfect for any occasion. Made with premium materials for comfort and style.",
        price: 99.99,
        originalPrice: 129.99,
        category: "men",
        subcategory: "jackets",
        images: ["images/OIP (1).jpg"],
        mainImage: "images/OIP (1).jpg",
        sizes: ["S", "M", "L", "XL"],
        colors: [
            { name: "Navy Blue", hex: "#1e3a8a" },
            { name: "Black", hex: "#000000" },
            { name: "Charcoal", hex: "#374151" }
        ],
        stock: 50,
        brand: "KushalWear",
        material: "Premium Cotton Blend",
        care: "Machine wash cold, tumble dry low",
        tags: ["jacket", "men", "classic", "premium"],
        rating: {
            average: 4.5,
            count: 12
        },
        isActive: true,
        isFeatured: true,
        discount: {
            percentage: 23,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
    },
    {
        name: "Women's Elegant Dress",
        description: "An elegant dress that combines sophistication with comfort. Perfect for special occasions.",
        price: 129.99,
        originalPrice: 159.99,
        category: "women",
        subcategory: "dresses",
        images: ["images/R (1).jpg"],
        mainImage: "images/R (1).jpg",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
            { name: "Rose Gold", hex: "#b76e79" },
            { name: "Emerald", hex: "#10b981" },
            { name: "Sapphire", hex: "#3b82f6" }
        ],
        stock: 35,
        brand: "KushalWear",
        material: "Silk Blend",
        care: "Dry clean only",
        tags: ["dress", "women", "elegant", "formal"],
        rating: {
            average: 4.8,
            count: 8
        },
        isActive: true,
        isFeatured: true,
        discount: {
            percentage: 19,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    },
    {
        name: "Casual Comfort Shirt",
        description: "A comfortable and stylish casual shirt perfect for everyday wear. Breathable fabric for all-day comfort.",
        price: 59.99,
        originalPrice: 79.99,
        category: "men",
        subcategory: "shirts",
        images: ["images/shrit.jpg"],
        mainImage: "images/shrit.jpg",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: [
            { name: "White", hex: "#ffffff" },
            { name: "Light Blue", hex: "#93c5fd" },
            { name: "Pink", hex: "#fbbf24" }
        ],
        stock: 75,
        brand: "KushalWear",
        material: "100% Cotton",
        care: "Machine wash warm, tumble dry medium",
        tags: ["shirt", "men", "casual", "comfort"],
        rating: {
            average: 4.3,
            count: 25
        },
        isActive: true,
        isFeatured: true,
        discount: {
            percentage: 25,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    },
    {
        name: "Elegant Evening Dress",
        description: "A stunning evening dress that will make you the center of attention. Perfect for formal events and parties.",
        price: 149.99,
        originalPrice: 199.99,
        category: "women",
        subcategory: "dresses",
        images: ["images/pretty.jpg"],
        mainImage: "images/pretty.jpg",
        sizes: ["XS", "S", "M", "L"],
        colors: [
            { name: "Black", hex: "#000000" },
            { name: "Red", hex: "#dc2626" },
            { name: "Navy", hex: "#1e3a8a" }
        ],
        stock: 20,
        brand: "KushalWear",
        material: "Premium Silk",
        care: "Dry clean only",
        tags: ["dress", "women", "evening", "formal", "elegant"],
        rating: {
            average: 4.9,
            count: 15
        },
        isActive: true,
        isFeatured: true,
        discount: {
            percentage: 25,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    }
];

async function addSampleProducts() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kushalwear';
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Clear existing products (optional - comment out if you want to keep existing)
        // await Product.deleteMany({});
        // console.log('Cleared existing products');

        // Add sample products
        for (const productData of sampleProducts) {
            // Check if product already exists
            const existingProduct = await Product.findOne({ name: productData.name });
            
            if (existingProduct) {
                console.log(`Product "${productData.name}" already exists, skipping...`);
                continue;
            }

            const product = new Product(productData);
            await product.save();
            console.log(`Added product: ${productData.name} (ID: ${product._id})`);
        }

        console.log('\n✅ Sample products added successfully!');
        console.log('\nProduct IDs for testing:');
        
        const products = await Product.find({ name: { $in: sampleProducts.map(p => p.name) } });
        products.forEach(product => {
            console.log(`${product.name}: ${product._id}`);
        });

    } catch (error) {
        console.error('Error adding sample products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
if (require.main === module) {
    addSampleProducts();
}

module.exports = { addSampleProducts }; 