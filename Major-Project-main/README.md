# 🔐 Full Stack Authentication Project

A modern full-stack application demonstrating user authentication using the MERN stack (MongoDB, Express.js, React.js, Node.js).

## ✨ Features

- 👤 User Registration with email and password
- 🔑 User Login with JWT authentication
- 🛡️ Protected Routes
- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS
- ✅ Form validation
- ⚠️ Error handling
- 💾 Persistent login state

## 🛠️ Tech Stack

### 🌐 Frontend
- ⚛️ React.js with Vite
- 🔄 React Router for navigation
- 🎨 Tailwind CSS for styling
- 🔌 Axios for API requests
- 📦 Context API for state management
- 🎯 Remix Icons for UI icons

### ⚙️ Backend
- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB with Mongoose
- 🔒 JWT for authentication
- 🔑 Bcrypt for password hashing
- 🔄 CORS for cross-origin requests

## 📁 Project Structure

```
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context providers
│   │   └── ...
│   ├── package.json
│   └── README.md
│
├── backend/                 # Backend application
│   ├── controllers/        # Request handlers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── package.json
│   └── README.md
│
└── README.md               # Main README file
```

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/Amanpatel30/Major-Project.git
```

2. Install MongoDB Community Server
- Download from: https://www.mongodb.com/try/download/community
- Install with default settings
- Add MongoDB to system PATH

3. Start MongoDB
```bash
mongod
```

4. Setup Backend
```bash
cd backend
npm install
npm run dev
```

5. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

6. Create .env files:

Backend (.env):
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/majorproject
JWT_SECRET=your_jwt_secret_key_here
```

Frontend (.env):
```
VITE_BASE_URL=http://localhost:5001/api
```

## 📜 Available Scripts

In the backend directory:
```bash
npm run dev   # Start development server
```

In the frontend directory:
```bash
npm run dev   # Start development server
npm run build # Build for production
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ by **Aman Patel**

## Recent Updates

### CORS and Database Connection Fixes

We've made several improvements to handle CORS issues and database connection problems:

1. **Enhanced CORS Configuration**:
   - Updated the CORS settings in `backend/app.js` to properly allow requests from the frontend
   - Added specific origins, methods, and headers to the CORS configuration

2. **Improved Error Handling**:
   - Enhanced error middleware to provide better error messages
   - Added specific handling for MongoDB connection errors
   - Improved logging for better debugging

3. **Graceful Fallbacks**:
   - The backend server now starts even if MongoDB is not available
   - Added mock data support in the frontend for when the database is unavailable
   - Created a fallback mechanism in API services to use mock data during connection issues

4. **MongoDB Setup Guide**:
   - Added `MONGODB_SETUP.md` with instructions for installing and configuring MongoDB

## Running the Application

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will start on port 5001. If MongoDB is not available, the server will still start but with limited functionality.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on port 5173. You can access it at http://localhost:5173.

## Database

This application uses MongoDB. For full functionality, MongoDB should be running on port 27017.

If MongoDB is not available, the application will use mock data for demonstration purposes. See `MONGODB_SETUP.md` for setup instructions.

## Hotel Management System

A comprehensive hotel management system with features for hotel owners, customers, and administrators.

## Features

- Dashboard with real-time analytics
- Menu item management
- Order management
- Inventory management
- User authentication and authorization
- And more...

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hotel-management-system
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with the following variables:
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/hotel-management
JWT_SECRET=your_jwt_secret
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

### Seeding the Database

To populate the database with sample data for testing:

1. Make sure MongoDB is running
2. Run the seeder script:
```bash
cd backend
npm run seed
```

This will create:
- Sample menu items
- Sample orders for the past 7 days
- Additional orders to create top-selling items data

You can also specify a custom hotel ID when running the seeder:
```bash
cd backend
npm run seed <your-hotel-id>
```

## Dashboard Data

The dashboard displays real data from the database:

- **Total Revenue**: Sum of all completed orders
- **Total Orders**: Count of all orders
- **Monthly Sales**: Revenue for the current month
- **Pending Orders**: Count of orders with status 'pending' or 'processing'
- **Weekly Sales Chart**: Shows sales data for the past 7 days
- **Top Selling Items**: Shows the most sold menu items based on order quantity

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
