const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kushalwear';
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'kushalgarse@gamil.com' });
        
        if (existingAdmin) {
            // Update existing user to admin role
            existingAdmin.role = 'admin';
            existingAdmin.name = 'Kushal';
            await existingAdmin.save();
            console.log('✅ Existing user updated to admin!');
            console.log('📧 Email: kushalgarse@gamil.com');
            console.log('🔑 Password: kushal@666');
            console.log('👑 Role: admin');
            console.log('👤 Name: Kushal');
            return;
        }

        // Create new admin user
        const adminUser = new User({
            name: 'Kushal',
            email: 'kushalgarse@gamil.com',
            password: 'kushal@666',
            role: 'admin',
            isActive: true
        });

        await adminUser.save();
        
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: kushalgarse@gamil.com');
        console.log('🔑 Password: kushal@666');
        console.log('👑 Role: admin');
        console.log('👤 Name: Kushal');
        console.log('');
        console.log('You can now login to the admin panel at: http://localhost:5500/html/admin.html');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createAdminUser(); 