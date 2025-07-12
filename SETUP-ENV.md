# Environment Variables Setup Guide

## 🚨 MongoDB Connection Error Fix

If you're seeing this error:
```
MongooseServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

It means your Netlify Functions are trying to connect to a local MongoDB instance instead of your cloud database. Follow these steps to fix it:

## 🔧 Step 1: Get Your MongoDB Atlas Connection String

1. **Log into MongoDB Atlas** (https://cloud.mongodb.com)
2. **Go to your cluster** and click "Connect"
3. **Choose "Connect your application"**
4. **Copy the connection string** - it should look like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/kushalwear?retryWrites=true&w=majority
   ```
5. **Replace `<username>`, `<password>`, and `<dbname>`** with your actual values

## 🔧 Step 2: Set Environment Variables in Netlify

1. **Go to your Netlify Dashboard** (https://app.netlify.com)
2. **Select your site** (the one connected to your `kushalwearback` repository)
3. **Go to Site Settings > Environment Variables**
4. **Add these variables:**

### Required Variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/kushalwear?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | A strong secret key for JWT tokens |
| `NODE_ENV` | `production` | Environment setting |

### Example Values:

```
MONGODB_URI=mongodb+srv://kushalwear:MyPassword123@cluster0.abc123.mongodb.net/kushalwear?retryWrites=true&w=majority
JWT_SECRET=kushalwear-super-secret-jwt-key-2024-production
NODE_ENV=production
```

## 🔧 Step 3: Redeploy Your Site

After adding the environment variables:

1. **Go to the Deploys tab** in your Netlify dashboard
2. **Click "Trigger deploy" > "Deploy site"**
3. **Wait for the deployment to complete**

## 🔧 Step 4: Test the Connection

1. **Visit your site**: `https://your-site-name.netlify.app`
2. **Click "Test Health"** button
3. **You should see**: `"database": "connected"` in the response

## 🛠 Local Development Setup

For local development, create a `.env` file in your backend directory:

```bash
# .env file (for local development only)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kushalwear?retryWrites=true&w=majority
JWT_SECRET=your-local-jwt-secret
NODE_ENV=development
```

Then run:
```bash
npm run netlify-dev
```

## 🔒 Security Notes

1. **Never commit your `.env` file** to Git
2. **Use strong, unique passwords** for MongoDB Atlas
3. **Generate a strong JWT secret** (you can use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
4. **Restrict MongoDB Atlas network access** to Netlify's IP ranges if possible

## 🚨 Troubleshooting

### Still getting connection errors?

1. **Check your MongoDB Atlas connection string** - make sure it's correct
2. **Verify your MongoDB Atlas username and password** are correct
3. **Check MongoDB Atlas Network Access** - ensure it allows connections from anywhere (0.0.0.0/0) or Netlify's IP ranges
4. **Check MongoDB Atlas Database Access** - ensure your user has the right permissions

### Environment variables not working?

1. **Redeploy your site** after adding environment variables
2. **Check variable names** - they must match exactly (case-sensitive)
3. **Check for typos** in the values

### Need help with MongoDB Atlas?

1. **Check MongoDB Atlas documentation**
2. **Verify your cluster is running**
3. **Check your billing status** - free tier has limitations

## 📞 Support

If you're still having issues:
1. Check the Netlify Function logs in your dashboard
2. Verify your MongoDB Atlas cluster is accessible
3. Test your connection string with a MongoDB client

---

**Remember**: Environment variables are essential for serverless functions to connect to external services like MongoDB Atlas. 