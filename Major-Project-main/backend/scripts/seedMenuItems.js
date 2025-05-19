import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../models/MenuItem.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Replace this with your actual hotel ID from the logs
const hotelId = '67ce83e6b49cd8fe9297a753';

// Sample menu items
const menuItems = [
  {
    name: "Vegetable Biryani",
    description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices, served with raita.",
    price: 250,
    category: "main course",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isVegetarian: true,
    isAvailable: true,
    hotel: hotelId,
    preparationTime: 25
  },
  {
    name: "Butter Chicken",
    description: "Tender chicken pieces simmered in a rich tomato and butter gravy with Indian spices.",
    price: 320,
    category: "main course",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isVegetarian: false,
    isAvailable: true,
    hotel: hotelId,
    preparationTime: 30
  },
  {
    name: "Masala Dosa",
    description: "Crispy rice crepe filled with spiced potato filling, served with sambhar and chutney.",
    price: 120,
    category: "appetizer",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isVegetarian: true,
    isAvailable: true,
    hotel: hotelId,
    preparationTime: 15
  },
  {
    name: "Mango Lassi",
    description: "Refreshing yogurt drink blended with fresh mango pulp and a hint of cardamom.",
    price: 80,
    category: "beverage",
    image: "https://images.unsplash.com/photo-1605197948693-5a8085b4f8d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isVegetarian: true,
    isAvailable: true,
    hotel: hotelId,
    preparationTime: 5
  },
  {
    name: "Gulab Jamun",
    description: "Sweet milk solids dumplings soaked in rose and cardamom flavored sugar syrup.",
    price: 100,
    category: "dessert",
    image: "https://images.unsplash.com/photo-1615832494023-211d6b950011?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isVegetarian: true,
    isAvailable: true,
    hotel: hotelId,
    preparationTime: 10
  },
  {
    name: "Paneer Tikka",
    description: "Chunks of paneer marinated in spices and grilled in a tandoor.",
    price: 220,
    category: "appetizer",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isVegetarian: true,
    isAvailable: true,
    hotel: hotelId,
    preparationTime: 20
  }
];

// Seed function
const seedMenuItems = async () => {
  try {
    // Clear existing menu items for this hotel
    await MenuItem.deleteMany({ hotel: hotelId });
    
    // Insert new menu items
    const result = await MenuItem.insertMany(menuItems);
    
    console.log(`✅ Successfully added ${result.length} menu items to the database`);
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding menu items:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedMenuItems(); 