const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('../../src/routes/auth');
const cartRoutes = require('../../src/routes/cart');
const productRoutes = require('../../src/routes/products');
const userRoutes = require('../../src/routes/users');
const orderRoutes = require('../../src/routes/orders');
const wishlistRoutes = require('../../src/routes/wishlist');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kushalwear';

// CORS configuration for Netlify Functions
const corsHandler = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5500', 
    'http://127.0.0.1:5500',
    'https://your-frontend.vercel.app', // Replace with your actual Vercel domain
    'https://kushalwear.vercel.app', // Example domain
    'https://kushalwear-frontend.vercel.app' // Example domain
  ],
  credentials: true
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: ''
    };
  }

  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Parse the path to determine which route to handle
    const path = event.path.replace('/.netlify/functions/api', '');
    
    // Route handling
    if (path.startsWith('/auth') || path.startsWith('/api/auth')) {
      return await handleRoute(authRoutes, event, path.replace('/api/auth', '').replace('/auth', ''));
    } else if (path.startsWith('/cart') || path.startsWith('/api/cart')) {
      return await handleRoute(cartRoutes, event, path.replace('/api/cart', '').replace('/cart', ''));
    } else if (path.startsWith('/products') || path.startsWith('/api/products')) {
      return await handleRoute(productRoutes, event, path.replace('/api/products', '').replace('/products', ''));
    } else if (path.startsWith('/users') || path.startsWith('/api/users')) {
      return await handleRoute(userRoutes, event, path.replace('/api/users', '').replace('/users', ''));
    } else if (path.startsWith('/orders') || path.startsWith('/api/orders')) {
      return await handleRoute(orderRoutes, event, path.replace('/api/orders', '').replace('/orders', ''));
    } else if (path.startsWith('/wishlist') || path.startsWith('/api/wishlist')) {
      return await handleRoute(wishlistRoutes, event, path.replace('/api/wishlist', '').replace('/wishlist', ''));
    } else if (path === '/health' || path === '/api/health') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          status: 'OK',
          message: 'KushalWear API is running on Netlify Functions',
          timestamp: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({ message: 'Route not found' })
      };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!'
      })
    };
  }
};

// Helper function to handle routes
async function handleRoute(router, event, path) {
  return new Promise((resolve) => {
    // Create a mock request object
    const req = {
      method: event.httpMethod,
      url: path,
      path: path,
      headers: event.headers,
      body: event.body ? JSON.parse(event.body) : {},
      query: event.queryStringParameters || {},
      params: {}
    };

    // Create a mock response object
    const res = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: '',
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = JSON.stringify(data);
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body
        });
      },
      send: function(data) {
        this.body = typeof data === 'string' ? data : JSON.stringify(data);
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body
        });
      }
    };

    // Find and execute the appropriate route handler
    const method = event.httpMethod.toLowerCase();
    let routeFound = false;

    // Simple route matching - you might need to enhance this based on your routes
    if (method === 'get' && (path === '' || path === '/')) {
      // Handle root path
      res.json({ message: 'KushalWear API is running' });
      routeFound = true;
    }

    if (!routeFound) {
      // Try to find a matching route in the router
      // This is a simplified approach - you might need to enhance route matching
      res.status(404).json({ message: 'Route not found' });
    }
  });
} 