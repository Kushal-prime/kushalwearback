const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/kushalwear';

async function setupDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Successfully connected to MongoDB!');
        console.log('Database: kushalwear');
        
        // Test the connection
        const db = mongoose.connection;
        console.log('Connection state:', db.readyState);
        
        // Create some sample products
        const Product = require('./models/Product');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        // Sample products data
        const sampleProducts = [
            {
                name: "Men's Jacket",
                description: "Classic men's jacket perfect for any occasion",
                price: 99.99,
                category: "men",
                subcategory: "jackets",
                images: ["OIP (1).jpg"],
                mainImage: "OIP (1).jpg",
                sizes: ["S", "M", "L", "XL"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "Navy", hex: "#000080" }
                ],
                stock: 50,
                brand: "KushalWear",
                material: "Premium Cotton",
                tags: ["jacket", "men", "formal", "classic"],
                isActive: true,
                isFeatured: true
            },
            {
                name: "Women's Dress",
                description: "Elegant women's dress for special occasions",
                price: 129.99,
                category: "women",
                subcategory: "dresses",
                images: ["R (1).jpg"],
                mainImage: "R (1).jpg",
                sizes: ["XS", "S", "M", "L"],
                colors: [
                    { name: "Red", hex: "#FF0000" },
                    { name: "Blue", hex: "#0000FF" }
                ],
                stock: 30,
                brand: "KushalWear",
                material: "Silk Blend",
                tags: ["dress", "women", "elegant", "formal"],
                isActive: true,
                isFeatured: true
            },
            {
                name: "Casual Shirt",
                description: "Comfortable casual shirt for everyday wear",
                price: 59.99,
                category: "men",
                subcategory: "shirts",
                images: ["shrit.jpg"],
                mainImage: "shrit.jpg",
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: [
                    { name: "White", hex: "#FFFFFF" },
                    { name: "Light Blue", hex: "#ADD8E6" }
                ],
                stock: 75,
                brand: "KushalWear",
                material: "Cotton",
                tags: ["shirt", "men", "casual", "comfortable"],
                isActive: true,
                isFeatured: false
            },
            {
                name: "Elegant Dress",
                description: "Beautiful elegant dress for special events",
                price: 149.99,
                category: "women",
                subcategory: "dresses",
                images: ["pretty.jpg"],
                mainImage: "pretty.jpg",
                sizes: ["XS", "S", "M", "L"],
                colors: [
                    { name: "Pink", hex: "#FFC0CB" },
                    { name: "Purple", hex: "#800080" }
                ],
                stock: 25,
                brand: "KushalWear",
                material: "Premium Fabric",
                tags: ["dress", "women", "elegant", "special"],
                isActive: true,
                isFeatured: true
            },
            {
                name: "Classic Suit",
                description: "Professional classic suit for business meetings",
                price: 299.99,
                category: "men",
                subcategory: "suits",
                images: ["OIP (1).jpg"],
                mainImage: "OIP (1).jpg",
                sizes: ["S", "M", "L", "XL"],
                colors: [
                    { name: "Charcoal", hex: "#36454F" },
                    { name: "Navy", hex: "#000080" }
                ],
                stock: 20,
                brand: "KushalWear",
                material: "Wool Blend",
                tags: ["suit", "men", "business", "professional"],
                isActive: true,
                isFeatured: true
            },
            {
                name: "Formal Gown",
                description: "Stunning formal gown for special occasions",
                price: 249.99,
                category: "women",
                subcategory: "gowns",
                images: ["women.jpg.webp"],
                mainImage: "women.jpg.webp",
                sizes: ["XS", "S", "M", "L"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "Gold", hex: "#FFD700" }
                ],
                stock: 15,
                brand: "KushalWear",
                material: "Silk",
                tags: ["gown", "women", "formal", "luxury"],
                isActive: true,
                isFeatured: true
            }
        ];
        
        // Insert sample products
        const products = await Product.insertMany(sampleProducts);
        console.log(`✅ Created ${products.length} sample products`);
        
        // Create a sample admin user
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        
        // Check if admin user exists
        const existingAdmin = await User.findOne({ email: 'admin@kushalwear.com' });
        
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('Admin123!', 12);
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@kushalwear.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true
            });
            
            await adminUser.save();
            console.log('✅ Created admin user: admin@kushalwear.com / Admin123!');
        } else {
            console.log('ℹ️ Admin user already exists');
        }
        
        // Show database statistics
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        
        console.log('\n📊 Database Statistics:');
        console.log(`Products: ${productCount}`);
        console.log(`Users: ${userCount}`);
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Start the backend server: npm run dev');
        console.log('2. Serve the frontend files (e.g., using Live Server)');
        console.log('3. Test the application at http://localhost:5500');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.name === 'MongoNetworkError') {
            console.log('\n💡 Troubleshooting:');
            console.log('1. Make sure MongoDB is running: mongod');
            console.log('2. Check if MongoDB is installed correctly');
            console.log('3. Try starting MongoDB manually');
        }
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the setup
setupDatabase(); 