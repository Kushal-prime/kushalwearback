const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

// Validate required environment variables
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  throw new Error('MONGODB_URI environment variable is required');
}

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
    // Check MongoDB connection
    let dbStatus = 'disconnected';
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
    } else {
      // Try to connect
      try {
        await mongoose.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        dbStatus = 'connected';
      } catch (dbError) {
        dbStatus = 'error';
        console.error('Database connection error:', dbError);
      }
    }

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
        timestamp: new Date().toISOString(),
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      })
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        status: 'ERROR',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      })
    };
  }
}; 