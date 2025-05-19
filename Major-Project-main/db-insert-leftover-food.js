/**
 * MongoDB Script to Insert Leftover Food Items into the Inventory Collection
 * 
 * 1. Connect to your MongoDB shell using: mongo
 * 2. Switch to your database using: use your-database-name
 * 3. Copy and paste the following query to add sample leftover food items
 */

// Sample MongoDB Query
db.inventories.insertMany([
  {
    hotel: ObjectId("YOUR_HOTEL_ID"), // Replace with your actual hotel ID from the database
    name: "Leftover Pasta Primavera",
    description: "Delicious pasta with fresh seasonal vegetables in a light cream sauce.",
    quantity: 5,
    unit: "portions",
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    price: 12.99,
    category: "other", // Maps to "meals" in leftover food
    notes: "Dietary info: vegetarian\nLeftover food listing\nDelicious pasta with fresh seasonal vegetables in a light cream sauce.",
    isLeftoverFood: true, // Flag to identify as leftover food
    isLowStock: false,
    isOutOfStock: false,
    location: "Leftover Food",
    minStockLevel: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    hotel: ObjectId("YOUR_HOTEL_ID"), // Replace with your actual hotel ID from the database
    name: "Leftover Pizza Margherita",
    description: "Classic pizza with fresh tomatoes, mozzarella, and basil.",
    quantity: 8,
    unit: "portions",
    expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    price: 5.99,
    category: "other", // Maps to "meals" in leftover food
    notes: "Dietary info: vegetarian\nLeftover food listing\nClassic pizza with fresh tomatoes, mozzarella, and basil.",
    isLeftoverFood: true, // Flag to identify as leftover food
    isLowStock: false,
    isOutOfStock: false,
    location: "Leftover Food",
    minStockLevel: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    hotel: ObjectId("YOUR_HOTEL_ID"), // Replace with your actual hotel ID from the database
    name: "Chocolate Brownies",
    description: "Rich, fudgy brownies with walnuts. Made this morning, perfect for dessert or a sweet snack.",
    quantity: 12,
    unit: "portions",
    expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    price: 3.50,
    category: "other", // Maps to "desserts" in leftover food
    notes: "Dietary info: contains-nuts\nLeftover food listing\nRich, fudgy brownies with walnuts. Made this morning, perfect for dessert or a sweet snack.",
    isLeftoverFood: true, // Flag to identify as leftover food
    isLowStock: false,
    isOutOfStock: false,
    location: "Leftover Food",
    minStockLevel: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

/**
 * To get your hotel ID, run the following query in MongoDB shell:
 * 
 * db.hotels.find({}, {_id: 1, name: 1, email: 1})
 * 
 * This will show all hotel IDs along with their names and emails.
 * Replace "YOUR_HOTEL_ID" in the above query with your actual hotel ID.
 */ 