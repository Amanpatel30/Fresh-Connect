import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the Category schema locally to avoid requiring the Product model
const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    color: String,
    order: Number,
    seller: mongoose.Schema.Types.ObjectId,
    count: Number
  },
  { timestamps: true }
);

// Create Category model
const Category = mongoose.model('Category', categorySchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find categories with null or undefined slugs
      const categoriesWithoutSlugs = await Category.find({ 
        $or: [
          { slug: null },
          { slug: { $exists: false } }
        ]
      }).lean();
      
      console.log(`Found ${categoriesWithoutSlugs.length} categories without slugs`);
      
      // Update each category with a new unique slug
      for (const category of categoriesWithoutSlugs) {
        const timestamp = Date.now().toString().slice(-4);
        const newSlug = (category.name || 'category').toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          + '-' + timestamp;
        
        await Category.findByIdAndUpdate(category._id, { slug: newSlug });
        console.log(`Updated category "${category.name}" with new slug: ${newSlug}`);
      }
      
      console.log('All categories updated successfully!');
    } catch (error) {
      console.error('Error updating categories:', error);
    } finally {
      // Close the database connection
      mongoose.connection.close();
      console.log('Database connection closed');
    }
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  }); 