# 🛍️ KushalWear Backend - Vercel Deployment

This is the backend API for the KushalWear e-commerce platform, designed for deployment on Vercel.

## 📁 Backend Structure

```
backend/
├── src/                   # Backend source code
│   ├── routes/            # API route handlers
│   │   ├── auth.js        # Authentication routes
│   │   ├── cart.js        # Cart management
│   │   ├── products.js    # Product management
│   │   ├── users.js       # User management
│   │   └── orders.js      # Order processing
│   ├── models/            # Database models
│   │   ├── User.js        # User schema
│   │   ├── Product.js     # Product schema
│   │   ├── Cart.js        # Cart schema
│   │   └── Order.js       # Order schema
│   ├── middleware/        # Custom middleware
│   │   └── auth.js        # Authentication middleware
│   └── utils/             # Utility functions
├── scripts/               # Utility scripts
│   ├── setup-db.js        # Database setup
│   ├── create-admin.js    # Admin user creation
│   ├── check-admin.js     # Admin verification
│   ├── test-auth.js       # Authentication testing
│   ├── check-db.js        # Database health check
│   ├── start-site.bat     # Windows startup script
│   ├── check-status.bat   # Status checking script
│   └── fix-login.bat      # Login troubleshooting
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
└── package-lock.json      # Locked dependency versions
```

## 🚀 Vercel Deployment

### Quick Deploy
1. **Connect to GitHub**: Link your GitHub repository to Vercel
2. **Build settings**:
   - **Framework Preset**: Node.js
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
   - **Root Directory**: `backend`

### Manual Deploy
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd backend
   vercel
   ```

3. **Set environment variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   ```

## 🔧 Environment Variables

### Required Variables
Set these in Vercel dashboard:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kushalwear
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

### Optional Variables
```env
CORS_ORIGIN=https://your-frontend-domain.netlify.app
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/admin` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get specific user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Health Check
- `GET /api/health` - API health status

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. **Create MongoDB Atlas account**
2. **Create cluster** (free tier available)
3. **Set up database access**:
   - Create database user
   - Set network access (0.0.0.0/0 for all IPs)
4. **Get connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/kushalwear
   ```

### Database Initialization
After deployment, run these commands:
```bash
# Setup database
node scripts/setup-db.js

# Create admin user
node scripts/create-admin.js
```

## 🔒 Security Features

### CORS Configuration
Update CORS settings in `server.js` to allow your frontend domain:
```javascript
app.use(cors({
    origin: ['https://your-frontend-domain.netlify.app'],
    credentials: true
}));
```

### Security Headers
- Helmet.js for security headers
- Rate limiting to prevent abuse
- JWT token validation
- Input sanitization

## 🚀 Vercel Configuration

### vercel.json (Optional)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 📊 Monitoring

### Vercel Analytics
- Function execution times
- Error rates
- Request volumes
- Performance metrics

### Custom Monitoring
- Database connection status
- API response times
- Error logging
- User activity tracking

## 🔄 Development

### Local Development
```bash
cd backend
npm install
npm start
```

### Environment Setup
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/kushalwear
JWT_SECRET=your-development-secret
NODE_ENV=development
PORT=3000
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check MongoDB URI format
   - Verify network access settings
   - Test connection with `node scripts/check-db.js`

2. **CORS Errors**
   - Update CORS origin in server.js
   - Check frontend domain configuration
   - Verify credentials setting

3. **Environment Variables**
   - Check Vercel environment variables
   - Verify variable names and values
   - Redeploy after changes

### Debug Commands
```bash
# Check database connection
node scripts/check-db.js

# Test authentication
node scripts/test-auth.js

# Verify admin user
node scripts/check-admin.js
```

## 📈 Performance

### Vercel Optimizations
- Serverless functions
- Global edge network
- Automatic scaling
- Cold start optimization

### Database Optimization
- Connection pooling
- Index optimization
- Query optimization
- Caching strategies

## 🔄 Updates and Maintenance

### Deployment Process
1. **Push changes** to GitHub
2. **Vercel auto-deploys** from connected repository
3. **Preview deployments** for pull requests
4. **Production deployment** from main branch

### Database Maintenance
- Regular backups
- Index optimization
- Performance monitoring
- Security updates

## 📞 Support

For backend-specific issues:
- Check Vercel documentation
- Review function logs
- Test API endpoints
- Monitor database performance

---

**Backend built for Vercel deployment** 🚀 