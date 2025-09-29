# Deployment Troubleshooting Guide

## Summary of Current Issue

Your Render deployment is running and responding to the root (`/`) and health (`/health`) endpoints, but all API endpoints (`/api/v1/terminology`, `/api/v1/upload`, etc.) are returning 404 errors despite being correctly registered in the code.

## Key Findings

✅ Configuration values are correct:
- API Prefix: `/api`
- API Version: `v1`
- Combined API Prefix: `/api/v1`
- Dotenv import is working properly
- Environment variables are accessible

## Possible Causes & Solutions

### 1. Route Registration Issues

Even though the configuration is correct, there might be an issue with how routes are registered or imported. Let's verify the route files:

```bash
# Check if route files exist and have the correct structure
ls -la server/routes/
```

### 2. Render-Specific Deployment Issues

Render might have specific requirements or behaviors that affect how Express routes are registered. Here are the most common issues:

#### Incorrect Build Command or Start Script

Ensure your Render service is configured with the correct commands:

- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `npm run server`

#### Missing Dependencies

Verify that all dependencies are properly installed on Render:

```bash
# Check package-lock.json is included in your repository
ls -la | grep package-lock.json
ls -la server/ | grep package-lock.json
```

#### Port Configuration

Ensure your application is listening on the correct port:

```javascript
// Your server.js already has this correct configuration:
const server = app.listen(config.server.port, '0.0.0.0', () => { ... });
```

### 3. Deployment Checklist

Use this checklist to verify all deployment requirements:

- [ ] MongoDB Atlas IP whitelisting is configured correctly (add Render's IP or set to 0.0.0.0/0 temporarily for testing)
- [ ] All required environment variables are set in the Render dashboard:
  - MONGODB_URI
  - PORT (usually auto-set by Render)
  - NODE_ENV=production
- [ ] The Render deployment is in a "Live" state (green status)
- [ ] Check Render logs for any startup errors or warnings
- [ ] Verify that the build process completes successfully

## Next Steps

1. **Check Render Logs**: The most important step is to examine the logs from your Render deployment. Look for any errors during startup or when routes are registered.

2. **Test with a Simplified API Route**: Create a minimal test route to isolate the issue:

```javascript
// Add this to server.js temporarily
export const testRouter = express.Router();
testRouter.get('/', (req, res) => res.json({ test: 'success' }));
app.use('/test-route', testRouter);
```

3. **Redeploy with Debug Logging**: Add additional logging to your server.js to track route registration:

```javascript
console.log(`Registering routes with prefix: ${apiPrefix}`);
console.log(`Routes registered: /terminology, /mapping, /emr, /upload`);
```

4. **Verify MongoDB Connection**: Ensure your application can connect to MongoDB from Render:

```bash
# Create a simple MongoDB connection test script
node server/test-mongodb-connection.js
```

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Express Route Debugging](https://expressjs.com/en/guide/routing.html)
- [MongoDB Atlas Connection Troubleshooting](https://www.mongodb.com/docs/atlas/troubleshoot-connection/)

Please let me know if you need help with any of these troubleshooting steps or if you'd like me to create any of the test scripts mentioned above!