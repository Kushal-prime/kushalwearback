const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/kushalwear';

async function checkDatabase() {
    try {
        console.log('🔍 Checking MongoDB connection...');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB connection successful!');
        
        const db = mongoose.connection;
        console.log('📊 Connection state:', db.readyState === 1 ? 'Connected' : 'Disconnected');
        
        // Check collections
        const collections = await db.db.listCollections().toArray();
        console.log('\n📁 Collections found:');
        collections.forEach(collection => {
            console.log(`  - ${collection.name}`);
        });
        
        // Get statistics for each collection
        const Product = require('./models/Product');
        const User = require('./models/User');
        const Cart = require('./models/Cart');
        
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const cartCount = await Cart.countDocuments();
        
        console.log('\n📈 Database Statistics:');
        console.log(`  Products: ${productCount}`);
        console.log(`  Users: ${userCount}`);
        console.log(`  Carts: ${cartCount}`);
        
        // Show sample products
        const sampleProducts = await Product.find().limit(3).select('name price category');
        console.log('\n🛍️ Sample Products:');
        sampleProducts.forEach(product => {
            console.log(`  - ${product.name} (${product.category}) - $${product.price}`);
        });
        
        // Check admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            console.log('\n👤 Admin User:');
            console.log(`  Email: ${adminUser.email}`);
            console.log(`  Name: ${adminUser.name}`);
            console.log(`  Status: ${adminUser.isActive ? 'Active' : 'Inactive'}`);
        }
        
        console.log('\n🎉 Database check completed successfully!');
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        
        if (error.name === 'MongoNetworkError') {
            console.log('\n💡 Troubleshooting:');
            console.log('1. Start MongoDB: mongod');
            console.log('2. Check if MongoDB is running on port 27017');
            console.log('3. Verify MongoDB installation');
        }
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed');
    }
}

// Run the check
checkDatabase(); 