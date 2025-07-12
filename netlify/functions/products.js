const mongoose = require('mongoose');
const Product = require('../../src/models/Product');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kushalwear';

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

    const method = event.httpMethod;
    const path = event.path.replace('/.netlify/functions/products', '');
    const queryParams = event.queryStringParameters || {};

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Get all products
    if (method === 'GET' && (path === '' || path === '/')) {
      const { category, gender, limit = 20, page = 1, sort = 'createdAt', order = 'desc' } = queryParams;
      
      let query = {};
      
      if (category) {
        query.category = category;
      }
      
      if (gender) {
        query.gender = gender;
      }

      const sortObj = {};
      sortObj[sort] = order === 'desc' ? -1 : 1;

      const products = await Product.find(query)
        .sort(sortObj)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Product.countDocuments(query);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalProducts: total,
            hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
            hasPrev: parseInt(page) > 1
          }
        })
      };
    }

    // Get single product by ID
    if (method === 'GET' && path.startsWith('/')) {
      const productId = path.substring(1);
      
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Invalid product ID' })
        };
      }

      const product = await Product.findById(productId);
      
      if (!product) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Product not found' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ product })
      };
    }

    // Create new product (Admin only)
    if (method === 'POST' && (path === '' || path === '/')) {
      const body = JSON.parse(event.body || '{}');
      
      // Check authorization (you might want to add proper auth middleware)
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Authorization required' })
        };
      }

      const { name, description, price, category, gender, sizes, images, stock } = body;

      if (!name || !price || !category || !gender) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Missing required fields' })
        };
      }

      const product = new Product({
        name,
        description,
        price,
        category,
        gender,
        sizes: sizes || [],
        images: images || [],
        stock: stock || 0
      });

      await product.save();

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Product created successfully',
          product
        })
      };
    }

    // Update product (Admin only)
    if (method === 'PUT' && path.startsWith('/')) {
      const productId = path.substring(1);
      const body = JSON.parse(event.body || '{}');
      
      // Check authorization
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Authorization required' })
        };
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Invalid product ID' })
        };
      }

      const product = await Product.findByIdAndUpdate(
        productId,
        body,
        { new: true, runValidators: true }
      );

      if (!product) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Product not found' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Product updated successfully',
          product
        })
      };
    }

    // Delete product (Admin only)
    if (method === 'DELETE' && path.startsWith('/')) {
      const productId = path.substring(1);
      
      // Check authorization
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Authorization required' })
        };
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Invalid product ID' })
        };
      }

      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Product not found' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Product deleted successfully'
        })
      };
    }

    // Search products
    if (method === 'GET' && path === '/search') {
      const { q, limit = 20, page = 1 } = queryParams;
      
      if (!q) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Search query is required' })
        };
      }

      const searchRegex = new RegExp(q, 'i');
      const query = {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      };

      const products = await Product.find(query)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Product.countDocuments(query);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalProducts: total,
            hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
            hasPrev: parseInt(page) > 1
          }
        })
      };
    }

    // Get categories
    if (method === 'GET' && path === '/categories') {
      const categories = await Product.distinct('category');
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ categories })
      };
    }

    // Default response for unhandled routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Route not found' })
    };

  } catch (error) {
    console.error('Products function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!'
      })
    };
  }
}; 