# KushalWear Backend - Netlify Functions Deployment

This backend is configured to run as Netlify Functions, providing a serverless API for the KushalWear clothing website.

## 🚀 Quick Start

### 1. Deploy to Netlify

1. **Connect your GitHub repository to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select the `kushalwearback` repository
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `public`
     - Functions directory: `netlify/functions`

2. **Set Environment Variables in Netlify:**
   - Go to Site Settings > Environment Variables
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     NODE_ENV=production
     ```

### 2. API Endpoints

Once deployed, your API will be available at:
- **Base URL**: `https://your-site-name.netlify.app/.netlify/functions/`

#### Available Functions:
- **Health Check**: `/.netlify/functions/health`
- **Authentication**: `/.netlify/functions/auth`
- **Products**: `/.netlify/functions/products`

#### Example API Calls:
```javascript
// Health check
fetch('https://your-site.netlify.app/.netlify/functions/health')

// Get products
fetch('https://your-site.netlify.app/.netlify/functions/products')

// Login
fetch('https://your-site.netlify.app/.netlify/functions/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
})
```

## 🔧 Frontend Integration (Vercel)

### 1. Update Frontend API Configuration

In your frontend code, update the API base URL:

```javascript
// Environment variable for Vercel
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-site.netlify.app/.netlify/functions';

// Example API calls
const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return response.json();
};

const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

### 2. Set Environment Variables in Vercel

In your Vercel dashboard:
1. Go to your project settings
2. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-site.netlify.app/.netlify/functions
   ```

### 3. CORS Configuration

The Netlify Functions are already configured with CORS headers to allow requests from:
- `http://localhost:3000` (local development)
- `http://localhost:5500` (local development)
- `https://your-frontend.vercel.app` (production)

Update the CORS origins in the function files if needed.

## 🛠 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 3. Run Locally
```bash
# Start Netlify Functions locally
npm run netlify-dev

# Or use the CLI directly
netlify dev
```

This will start the functions at `http://localhost:8888/.netlify/functions/`

### 4. Test Functions
```bash
# Health check
curl http://localhost:8888/.netlify/functions/health

# Get products
curl http://localhost:8888/.netlify/functions/products
```

## 📁 Project Structure

```
backend/
├── netlify/
│   ├── functions/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── products.js      # Product management
│   │   └── health.js        # Health check
│   └── netlify.toml         # Netlify configuration
├── src/
│   ├── models/              # MongoDB models
│   ├── routes/              # Express routes (for reference)
│   └── middleware/          # Middleware functions
├── package.json
└── README-NETLIFY.md
```

## 🔒 Security

### Environment Variables
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment (development/production)

### CORS Configuration
Functions include CORS headers to allow cross-origin requests from your frontend domain.

## 📊 Monitoring

### Netlify Function Logs
- View function logs in the Netlify dashboard
- Monitor function execution times and errors
- Check function invocations in the Functions tab

### Health Check
Use the health endpoint to monitor API status:
```bash
curl https://your-site.netlify.app/.netlify/functions/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Function Timeout**
   - Netlify Functions have a 10-second timeout limit
   - Optimize database queries and external API calls

2. **CORS Errors**
   - Ensure your frontend domain is in the CORS origins list
   - Check that the API URL is correct

3. **Database Connection**
   - Verify `MONGODB_URI` is set correctly in Netlify
   - Ensure MongoDB Atlas allows connections from Netlify's IP ranges

4. **Environment Variables**
   - Redeploy after adding new environment variables
   - Check variable names match exactly

### Debug Mode
Set `NODE_ENV=development` to get detailed error messages in function responses.

## 🔄 Deployment Workflow

1. Push changes to GitHub
2. Netlify automatically deploys from the main branch
3. Functions are built and deployed
4. Test the new endpoints
5. Update frontend if needed

## 📞 Support

For issues with:
- **Netlify Functions**: Check Netlify documentation
- **MongoDB**: Verify connection string and network access
- **Frontend Integration**: Ensure CORS and API URLs are correct

---

**Note**: This backend is optimized for serverless deployment on Netlify. For traditional server deployment, use the `server.js` file instead. 