# Backend API for Major Project

Backend server built with Node.js, Express, and MongoDB.

## Setup Instructions

1. Install dependencies:
```
npm install
```

2. Set up MongoDB:
- Make sure MongoDB is installed (or use MongoDB Compass)
- The default connection string in .env is set to `mongodb://localhost:27017/major-project`
- You can change this in the .env file if needed

3. Run the server:
```
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- POST `/api/users` - Create a new user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

## MongoDB Connection

The backend is configured to connect to MongoDB using Mongoose. You can use MongoDB Compass to view and manage your database with a graphical interface.

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017/`
3. The database will be created automatically when you first run the application # Fresh-Connect
