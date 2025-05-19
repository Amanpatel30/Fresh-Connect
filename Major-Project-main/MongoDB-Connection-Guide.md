# MongoDB Connection Guide

## Issue Resolution

We encountered and resolved the following MongoDB connection issues:

1. **Connection timeout**: Updated MongoDB connection settings in `backend/server.js` with longer timeouts and better connection pooling options.

2. **Authentication failure**: Reset the test hotel user account password directly in the MongoDB database to ensure proper password hashing.

3. **API connection**: Added improved error handling in `frontend/src/services/api.js` to better diagnose and report MongoDB-related issues.

## Current Status

The system is now properly connected to MongoDB:

- MongoDB service is running correctly on your system
- The backend server successfully connects to the database
- Authentication is working with the test account
- The API can interact with the database collections

## Login Credentials

You can use the following test account to login:
- Email: `hotel1@example.com`
- Password: `password123`

## Maintaining Stable Database Connection

To ensure your application maintains a stable connection to MongoDB:

1. **Always verify MongoDB is running** before starting your application. Check with:
   ```
   Get-Service -Name MongoDB
   ```

2. **Use the test-mongo.js script** to verify direct database connectivity:
   ```
   cd backend
   node test-mongo.js
   ```

3. **Check the backend logs** for any database connection errors when starting the server:
   ```
   cd backend
   npm start
   ```

4. If you encounter login issues, you can reset the test user password with:
   ```
   cd backend
   node scripts/resetPassword.js
   ```

5. **Check for port conflicts** if the server fails to start:
   ```
   netstat -ano | findstr :5001
   ```

## Database Collections

Your database currently contains the following collections:
- feedbacks
- products
- menuitems
- orders
- inventories
- urgentsales
- purchases
- menuItems
- users
- hotels

## Troubleshooting Common Issues

1. **"Operation users.findOne() buffering timed out after 10000ms"**:
   - This indicates MongoDB connection issues
   - Verify that MongoDB service is running
   - Check for firewall blocking the connection
   - The increased timeout settings should mitigate this issue

2. **"Invalid email or password"**:
   - If you're sure the credentials are correct, try resetting the password using the script

3. **"EADDRINUSE"** (Address already in use):
   - Another application is already using port 5001
   - Find and terminate the process or use a different port
   
4. **Browser shows "Network Error"**:
   - Ensure both frontend and backend servers are running
   - Check for CORS issues in the browser console
   - Verify the API paths are correct

Remember to check MongoDB logs if persistent issues occur! 