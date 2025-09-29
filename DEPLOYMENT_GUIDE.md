# Ayush Terminology Portal - Deployment Guide

This guide walks you through deploying the Ayush Terminology Portal backend on Render and updating the frontend to connect to it.

## Table of Contents
1. [Backend Deployment on Render](#backend-deployment-on-render)
2. [Frontend Configuration](#frontend-configuration)
3. [Testing the Deployment](#testing-the-deployment)
4. [Troubleshooting](#troubleshooting)

## Backend Deployment on Render

### Prerequisites
- A Render account (sign up at https://render.com)
- A GitHub or GitLab account with the project repository
- MongoDB URI (from MongoDB Atlas or your MongoDB provider)
- Vercel URL for your frontend

### Deployment Steps

1. **Push Your Code to a Git Repository**
   Ensure your code is pushed to a Git repository (GitHub, GitLab, etc.) that Render can access.

2. **Create a New Web Service on Render**
   - Log in to your Render account
   - Click the "New" button and select "Web Service"
   - Connect your Git repository containing the project

3. **Configure the Web Service**
   - **Name**: Choose a name for your service (e.g., `ayush-terminology-backend`)
   - **Region**: Select a region close to your users
   - **Branch**: Select the branch to deploy (usually `main`)
   - **Root Directory**: Enter `server` (this is where your server code is located)
   - **Runtime**: Select `Node`
   - **Build Command**: Enter `npm install`
   - **Start Command**: Enter `node server.js`

4. **Set Up Environment Variables**
   Under the "Environment Variables" section, add these variables:
   
   | Variable | Value |
   |----------|-------|
   | NODE_ENV | production |
   | PORT | 5000 |
   | MONGODB_URI | Your MongoDB connection string (keep this secure) |
   | FRONTEND_URL | Your Vercel frontend URL (e.g., https://your-frontend.vercel.app) |
   | API_VERSION | v1 |

5. **Deploy the Service**
   Click the "Create Web Service" button to start the deployment process.

6. **Verify the Deployment**
   - Once deployed, visit the `/health` endpoint of your Render service URL to confirm it's running
   - Example: `https://your-service.onrender.com/health`
   - You should see a response like `{"status":"ok","message":"Server is running"}`

## Frontend Configuration

Now that your backend is deployed, you need to update your frontend to connect to it.

### Update Frontend API URL

1. **Locate the API Configuration in Your Frontend**
   Find where your frontend is configured to connect to the backend API. This is typically in a configuration file or an environment variable.

2. **Update the API URL**
   - Replace the local development URL (e.g., `http://localhost:5000`) with your Render service URL
   - Example: `https://your-service.onrender.com/api/v1`

3. **Deploy the Updated Frontend**
   - Commit your changes and push to your frontend repository
   - Vercel should automatically deploy the updated frontend

## Testing the Deployment

After updating both the backend and frontend, test that they work correctly together:

1. **Test API Endpoints**
   - Use tools like Postman or curl to test your API endpoints
   - Example: `curl https://your-service.onrender.com/api/v1/terminology`

2. **Test Frontend Functionality**
   - Visit your Vercel frontend URL
   - Ensure all features that rely on the backend work correctly
   - Check for any console errors in the browser

3. **Monitor Logs**
   - Check Render logs for any errors or issues
   - Monitor MongoDB connection status

## Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Issues**
   **This is critical for deployment success!**
   
   - **IP Whitelisting in MongoDB Atlas**:
     - Go to https://cloud.mongodb.com/ and log in to your account
     - Navigate to your cluster -> Security -> Network Access
     - Click "Add IP Address"
     - For Render deployment, you have two options:
       - **Option 1 (Recommended for Production)**: Add Render's IP addresses
       - **Option 2 (For Testing/Development)**: Choose "Allow access from anywhere" (less secure but easier for testing)
     - Click "Confirm" to save changes
   
   - **Verify your MongoDB connection string**:
     - Ensure it's correctly formatted with your username, password, and cluster name
     - It should look something like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/<databaseName>?retryWrites=true&w=majority`
   
   - **Test your MongoDB connection locally first**:
     ```bash
     cd server
     node test-mongodb-connection.js
     ```
     This script will help you verify if your MongoDB connection works before deploying to Render
   
   - Check Render logs for specific connection errors

2. **CORS Errors**
   - Ensure your `FRONTEND_URL` environment variable on Render matches your Vercel URL exactly
   - Check that there are no trailing slashes in the URL
   - Verify the CORS configuration in your `config.js` file

3. **Service Not Starting**
   - Check Render logs for startup errors
   - Verify that all environment variables are set correctly
   - Ensure your `package.json` has the correct `start` script

4. **Slow Initial Response**
   - Render services may go to sleep after periods of inactivity (on free plans)
   - Consider upgrading to a paid plan for constant availability

## Additional Notes

- For production environments, consider using a custom domain for your Render service
- Set up proper monitoring and alerting for your deployed services
- Regularly update dependencies to keep your application secure
- Make sure to back up your MongoDB database regularly

If you encounter any issues during deployment that aren't covered in this guide, refer to the [Render documentation](https://render.com/docs) or reach out to their support team.