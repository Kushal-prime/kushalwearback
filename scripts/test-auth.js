const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
    console.log('🧪 Testing KushalWear Authentication...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData.message);
        console.log('   Status:', healthResponse.status);
        console.log('');

        // Test 2: Login with Admin
        console.log('2. Testing Admin Login...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@kushalwear.com',
                password: 'Admin123!'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Admin Login Successful!');
            console.log('   User:', loginData.user.name);
            console.log('   Role:', loginData.user.role);
            console.log('   Token received:', !!loginData.token);
            console.log('');
        } else {
            const errorData = await loginResponse.json();
            console.log('❌ Admin Login Failed:');
            console.log('   Status:', loginResponse.status);
            console.log('   Error:', errorData.message);
            console.log('');
        }

        // Test 3: Signup New User
        console.log('3. Testing User Signup...');
        const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Test123!'
            })
        });

        if (signupResponse.ok) {
            const signupData = await signupResponse.json();
            console.log('✅ User Signup Successful!');
            console.log('   Message:', signupData.message);
            console.log('');
        } else {
            const errorData = await signupResponse.json();
            console.log('❌ User Signup Failed:');
            console.log('   Status:', signupResponse.status);
            console.log('   Error:', errorData.message);
            console.log('');
        }

        // Test 4: Login with New User
        console.log('4. Testing New User Login...');
        const newUserLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'Test123!'
            })
        });

        if (newUserLoginResponse.ok) {
            const newUserData = await newUserLoginResponse.json();
            console.log('✅ New User Login Successful!');
            console.log('   User:', newUserData.user.name);
            console.log('   Role:', newUserData.user.role);
            console.log('   Token received:', !!newUserData.token);
            console.log('');
        } else {
            const errorData = await newUserLoginResponse.json();
            console.log('❌ New User Login Failed:');
            console.log('   Status:', newUserLoginResponse.status);
            console.log('   Error:', errorData.message);
            console.log('');
        }

        console.log('🎉 Authentication testing completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure the server is running: npm run dev');
        console.log('2. Check if MongoDB is connected');
        console.log('3. Verify the server is on port 3000');
    }
}

// Run the test
testAuth(); 