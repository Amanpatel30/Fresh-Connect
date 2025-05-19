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
npm start
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
PORT=4000
MONGODB_URI=mongodb://localhost:27017/majorproject
JWT_SECRET=your_jwt_secret_key_here
```

Frontend (.env):
```
VITE_BASE_URL=http://localhost:4000/api
```

## 📜 Available Scripts

In the backend directory:
```bash
npm start     # Start the server
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

# Seller Dashboard with MongoDB Integration

This project implements a comprehensive seller dashboard for an e-commerce platform, with full MongoDB integration for all seller-related functionalities.

## Features

- **Profile Management**: Sellers can manage their profile information, including business details, contact information, and profile images.
- **Product Management**: CRUD operations for products, including image uploads, stock management, and categorization.
- **Order Management**: View and manage orders, update order status, and track shipping.
- **Payment Methods**: Add, edit, and manage payment methods for receiving payments.
- **Payment Transactions**: View payment history, transaction details, and earnings summary.
- **Urgent Sales**: Create and manage time-limited sales for products.
- **Dashboard Analytics**: View sales statistics, order metrics, and product performance.

## Technical Implementation

### Backend

- **MongoDB Models**: Comprehensive data models for all entities (users, products, orders, payment methods, transactions, etc.)
- **RESTful API**: Well-structured API endpoints for all seller operations
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Error Handling**: Robust error handling with informative error messages
- **File Uploads**: Support for image uploads with proper storage and retrieval

### Frontend

- **React Components**: Modular and reusable components for all seller pages
- **Material UI**: Modern and responsive UI design
- **State Management**: Efficient state management with React hooks
- **Form Handling**: Comprehensive form validation and submission
- **API Integration**: Service-based approach for API communication
- **Offline Support**: Fallback to mock data when server is unavailable

## API Endpoints

### Profile

- `GET /api/seller/profile` - Get seller profile
- `PUT /api/seller/profile` - Update seller profile
- `POST /api/seller/profile/image` - Upload profile image
- `POST /api/seller/profile/documents` - Upload business documents

### Products

- `GET /api/seller/products` - Get all seller products
- `GET /api/seller/products/:id` - Get a specific product
- `POST /api/seller/products` - Create a new product
- `PUT /api/seller/products/:id` - Update a product
- `DELETE /api/seller/products/:id` - Delete a product
- `POST /api/seller/products/:id/images` - Upload product images
- `GET /api/seller/products/stats` - Get product statistics

### Orders

- `GET /api/seller/orders` - Get all seller orders
- `GET /api/seller/orders/:id` - Get a specific order
- `PUT /api/seller/orders/:id/status` - Update order status
- `GET /api/seller/orders/stats` - Get order statistics
- `GET /api/seller/orders/pending` - Get pending orders
- `GET /api/seller/orders/shipping` - Get orders in shipping

### Payment Methods

- `GET /api/seller/payment-methods` - Get all payment methods
- `GET /api/seller/payment-methods/:id` - Get a specific payment method
- `POST /api/seller/payment-methods` - Create a new payment method
- `PUT /api/seller/payment-methods/:id` - Update a payment method
- `DELETE /api/seller/payment-methods/:id` - Delete a payment method
- `PUT /api/seller/payment-methods/:id/default` - Set a payment method as default

### Payment Transactions

- `GET /api/seller/payment-transactions` - Get all payment transactions
- `GET /api/seller/payment-transactions/:id` - Get a specific transaction
- `GET /api/seller/payment-transactions/summary` - Get payment summary

### Urgent Sales

- `GET /api/seller/urgent-sales` - Get all urgent sales
- `GET /api/seller/urgent-sales/:id` - Get a specific urgent sale
- `POST /api/seller/urgent-sales` - Create a new urgent sale
- `PUT /api/seller/urgent-sales/:id` - Update an urgent sale
- `DELETE /api/seller/urgent-sales/:id` - Delete an urgent sale

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=5001
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRE=30d
     ```
4. Start the development server:
   ```
   npm run dev
   ```

## Offline Support

The application includes a fallback mechanism for when the server is unavailable:

1. When the server is unreachable, the application switches to "mock mode"
2. In mock mode, all API calls return predefined mock data
3. User actions are stored in localStorage
4. The application periodically checks for server availability
5. When the server becomes available again, the application syncs the local data with the server

## Error Handling

The application includes comprehensive error handling:

1. Backend validation errors are properly formatted and returned to the frontend
2. Frontend displays appropriate error messages to the user
3. Network errors are caught and handled gracefully
4. Form validation prevents invalid data submission

## Future Enhancements

- **Real-time Updates**: Implement WebSockets for real-time order notifications
- **Advanced Analytics**: More detailed sales and performance analytics
- **Bulk Operations**: Support for bulk product uploads and updates
- **Multi-language Support**: Internationalization for the seller dashboard
- **Mobile App**: Native mobile application for sellers on the go
