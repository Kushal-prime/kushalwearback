#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating secure JWT secret...\n');

// Generate a secure random string
const secret = crypto.randomBytes(64).toString('hex');

console.log('✅ Your secure JWT secret:');
console.log('='.repeat(50));
console.log(secret);
console.log('='.repeat(50));

console.log('\n📝 Instructions:');
console.log('1. Copy this secret');
console.log('2. Go to your Netlify dashboard');
console.log('3. Add it as JWT_SECRET environment variable');
console.log('4. Redeploy your site');

console.log('\n⚠️  Security Notes:');
console.log('- Keep this secret secure and private');
console.log('- Never commit it to Git');
console.log('- Use different secrets for development and production');
console.log('- Regenerate this secret if it gets compromised');

console.log('\n🔗 Next steps:');
console.log('- Set MONGODB_URI environment variable in Netlify');
console.log('- Set JWT_SECRET environment variable in Netlify');
console.log('- Redeploy your site');
console.log('- Test the health endpoint'); 