// MongoDB query to insert orders with seller field included

db.orders.insertMany([
  {
    _id: ObjectId("67ce83e6b49cd8fe9297a753"),
    buyer: {
      _id: ObjectId("67ce83e6b49cd8fe9297a754"),
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 9876543210"
    },
    seller: ObjectId("67ce83e6b49cd8fe9297a753"), // Add seller field with the same ID as in the auth token
    items: [
      {
        name: "Butter Chicken",
        quantity: 2,
        price: 350,
        unit: "plate"
      },
      {
        name: "Naan",
        quantity: 4,
        price: 40,
        unit: "piece"
      }
    ],
    shippingAddress: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India"
    },
    phone: "+91 9876543210", // Add phone field as it's required in the schema
    totalAmount: 860,
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67ce83e6b49cd8fe9297a755"),
    buyer: {
      _id: ObjectId("67ce83e6b49cd8fe9297a756"),
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+91 9876543211"
    },
    seller: ObjectId("67ce83e6b49cd8fe9297a753"), // Add seller field with the same ID as in the auth token
    items: [
      {
        name: "Paneer Tikka",
        quantity: 1,
        price: 280,
        unit: "plate"
      },
      {
        name: "Veg Biryani",
        quantity: 2,
        price: 220,
        unit: "plate"
      }
    ],
    shippingAddress: {
      street: "456 Park Avenue",
      city: "Delhi",
      state: "Delhi",
      postalCode: "110001",
      country: "India"
    },
    phone: "+91 9876543211", // Add phone field as it's required in the schema
    totalAmount: 720,
    status: "processing",
    paymentMethod: "online",
    paymentStatus: "paid",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date()
  }
]); 