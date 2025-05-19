import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

// Generate a random date between start and end dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random number between min and max
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function addSampleData() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get the hotel ID
    const hotels = await mongoose.connection.db.collection('hotels').find({}).toArray();
    if (hotels.length === 0) {
      console.log('No hotels found in the database. Please create a hotel first.');
      await mongoose.connection.close();
      return;
    }

    const hotelId = hotels[0]._id;
    console.log(`Using hotel ID: ${hotelId}`);

    try {
      // Get or create menu items
      let menuItems = await mongoose.connection.db.collection('menuitems').find({ hotel: hotelId }).toArray();
      console.log(`Found ${menuItems.length} existing menu items for this hotel`);
      
      if (menuItems.length < 5) {
        console.log('Creating sample menu items...');
        
        const sampleMenuItems = [
          {
            hotel: hotelId,
            name: "Butter Chicken",
            description: "Tender chicken in a rich buttery tomato sauce",
            price: 250,
            category: "main course",
            isVegetarian: false,
            isAvailable: true,
            preparationTime: 25,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            hotel: hotelId,
            name: "Paneer Tikka",
            description: "Grilled cottage cheese with spices",
            price: 180,
            category: "starter",
            isVegetarian: true,
            isAvailable: true,
            preparationTime: 15,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            hotel: hotelId,
            name: "Veg Biryani",
            description: "Fragrant rice with mixed vegetables",
            price: 200,
            category: "main course",
            isVegetarian: true,
            isAvailable: true,
            preparationTime: 30,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            hotel: hotelId,
            name: "Chicken Biryani",
            description: "Fragrant rice with tender chicken pieces",
            price: 220,
            category: "main course",
            isVegetarian: false,
            isAvailable: true,
            preparationTime: 30,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            hotel: hotelId,
            name: "Gulab Jamun",
            description: "Sweet milk solids balls soaked in sugar syrup",
            price: 80,
            category: "dessert",
            isVegetarian: true,
            isAvailable: true,
            preparationTime: 10,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        try {
          const result = await mongoose.connection.db.collection('menuitems').insertMany(sampleMenuItems);
          console.log(`${result.insertedCount} menu items inserted`);
          
          menuItems = await mongoose.connection.db.collection('menuitems').find({ hotel: hotelId }).toArray();
          console.log(`Now have ${menuItems.length} menu items`);
        } catch (menuError) {
          console.error('Error inserting menu items:', menuError);
        }
      }
      
      // Create sample orders for the past 30 days
      console.log('Creating sample orders...');
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
      const paymentMethods = ['cash', 'online', 'card'];
      
      const sampleOrders = [];
      
      // Create 50 sample orders
      for (let i = 0; i < 50; i++) {
        const orderDate = randomDate(startDate, endDate);
        const status = orderStatuses[randomNumber(0, orderStatuses.length - 1)];
        const paymentMethod = paymentMethods[randomNumber(0, paymentMethods.length - 1)];
        
        // Select 1-3 random menu items for this order
        const numItems = randomNumber(1, 3);
        const orderItems = [];
        let totalAmount = 0;
        
        for (let j = 0; j < numItems; j++) {
          if (menuItems.length === 0) {
            console.error('No menu items available for orders');
            break;
          }
          
          const menuItem = menuItems[randomNumber(0, menuItems.length - 1)];
          const quantity = randomNumber(1, 3);
          const itemPrice = menuItem.price;
          const itemTotal = quantity * itemPrice;
          
          orderItems.push({
            product: menuItem._id,
            name: menuItem.name,
            quantity: quantity,
            unit: 'plate',
            price: itemPrice
          });
          
          totalAmount += itemTotal;
        }
        
        if (orderItems.length === 0) {
          console.log('Skipping order creation due to no items');
          continue;
        }
        
        // Find a valid user ID to use as buyer
        let buyerId;
        try {
          const users = await mongoose.connection.db.collection('users').find({}).limit(1).toArray();
          if (users.length > 0) {
            buyerId = users[0]._id;
            console.log(`Using user ID for buyer: ${buyerId}`);
          } else {
            buyerId = new mongoose.Types.ObjectId(); // Generate a random ID if no users found
            console.log('No users found, using generated ID');
          }
        } catch (userError) {
          console.error('Error finding users:', userError);
          buyerId = new mongoose.Types.ObjectId(); // Generate a random ID if error
        }
        
        sampleOrders.push({
          buyer: buyerId,
          seller: hotelId,
          hotelId: hotelId,
          items: orderItems,
          shippingAddress: {
            street: "123 Sample St",
            city: "Sample City",
            state: "Sample State",
            postalCode: "12345",
            country: "India"
          },
          phone: "9876543210",
          totalAmount: totalAmount,
          status: status,
          paymentMethod: paymentMethod,
          paymentStatus: status === 'cancelled' ? 'refunded' : (status === 'delivered' || status === 'completed' ? 'completed' : 'pending'),
          isUrgentSale: false,
          createdAt: orderDate,
          updatedAt: orderDate
        });
      }
      
      // Insert the orders
      try {
        console.log(`Attempting to insert ${sampleOrders.length} orders`);
        if (sampleOrders.length > 0) {
          const orderResult = await mongoose.connection.db.collection('orders').insertMany(sampleOrders);
          console.log(`${orderResult.insertedCount} orders inserted`);
        } else {
          console.log('No orders to insert');
        }
      } catch (orderError) {
        console.error('Error inserting orders:', orderError);
      }

      // Create sample inventory items
      console.log('Creating sample inventory items...');
      
      const categories = ['vegetables', 'meat', 'dairy', 'grains', 'spices'];
      const sampleInventory = [];
      
      // Create 20 sample inventory items
      for (let i = 0; i < 20; i++) {
        const category = categories[randomNumber(0, categories.length - 1)];
        const quantity = randomNumber(5, 100);
        const price = randomNumber(10, 200);
        
        sampleInventory.push({
          hotel: hotelId,
          name: `Sample ${category} item ${i+1}`,
          category: category,
          quantity: quantity,
          unit: category === 'meat' || category === 'vegetables' ? 'kg' : (category === 'dairy' ? 'liter' : 'unit'),
          price: price,
          supplier: {
            name: "Sample Supplier",
            contact: "9876543210",
            email: "supplier@example.com"
          },
          expiryDate: new Date(new Date().setDate(new Date().getDate() + randomNumber(30, 180))),
          minStockLevel: 10,
          isLowStock: quantity <= 10,
          isOutOfStock: quantity === 0,
          location: "Main Storage",
          notes: `Sample ${category} item for testing`,
          purchaseDate: new Date(new Date().setDate(new Date().getDate() - randomNumber(1, 30))),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Insert the inventory items
      try {
        const inventoryResult = await mongoose.connection.db.collection('inventories').insertMany(sampleInventory);
        console.log(`${inventoryResult.insertedCount} inventory items inserted`);
      } catch (inventoryError) {
        console.error('Error inserting inventory items:', inventoryError);
      }
    } catch (dataError) {
      console.error('Error in data creation process:', dataError);
    }

    console.log('Sample data added successfully!');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error adding sample data:', error);
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed after error');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
  }
}

// Execute the function
addSampleData(); 