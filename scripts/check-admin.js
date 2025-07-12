const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdminUser() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kushalwear';
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');

        // Find the admin user
        const adminUser = await User.findOne({ email: 'kushalgarse@gamil.com' });
        
        if (adminUser) {
            console.log('✅ Admin user found!');
            console.log('📧 Email:', adminUser.email);
            console.log('👤 Name:', adminUser.name);
            console.log('👑 Role:', adminUser.role);
            console.log('✅ Active:', adminUser.isActive);
            console.log('🆔 User ID:', adminUser._id);
        } else {
            console.log('❌ Admin user not found!');
        }

        // Check all users
        const allUsers = await User.find({});
        console.log('\n📊 All users in database:');
        allUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
        });

    } catch (error) {
        console.error('❌ Error checking admin user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkAdminUser(); 