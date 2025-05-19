const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// File size threshold (10MB in bytes)
// Files larger than this will be stored in the filesystem
// Files smaller than this will be stored in MongoDB
const FILE_SIZE_THRESHOLD = 10 * 1024 * 1024;

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Common Vite and React ports
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// MongoDB Connection with better error handling
mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    
    // Migrate any existing users to the new schema format
    migrateExistingData();
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Please make sure MongoDB is running');
});

/**
 * Migration helper function
 * Finds users with old schema format and updates them to new format
 * This ensures compatibility with existing data after schema changes
 */
async function migrateExistingData() {
    try {
        // Find users that might need migration (those without storageType field)
        const usersToMigrate = await User.find({
            $or: [
                { 'image.storageType': { $exists: false } },
                { 'image.storageType': null }
            ]
        });
        
        if (usersToMigrate.length > 0) {
            console.log(`Found ${usersToMigrate.length} users that need migration`);
            
            for (const user of usersToMigrate) {
                // If user has image data in the old format, migrate to new format
                if (user.image && user.image.data) {
                    // Users with binary data are migrated to database storage type
                    user.image.storageType = 'database';
                    await user.save();
                    console.log(`Migrated user ${user._id} to database storage`);
                } else if (user.image && user.image.imagePath) {
                    // Legacy format with imagePath field
                    user.image.filePath = user.image.imagePath; // Update field name
                    user.image.storageType = 'filesystem';
                    await user.save();
                    console.log(`Migrated user ${user._id} to filesystem storage`);
                }
            }
            
            console.log('Migration completed');
        }
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Store all uploaded files initially in the uploads directory
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        // Generate unique filename using timestamp to prevent collisions
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
// This prevents errors when first running the application
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Serve uploaded files statically
// This allows direct access to files in the uploads directory via URL
app.use('/uploads', express.static('uploads'));

/**
 * User Model Schema Definition
 * Implements hybrid storage approach for images:
 * - Small images (<10MB) are stored directly in MongoDB as binary data
 * - Large images (>10MB) are stored in the filesystem with path references in MongoDB
 */
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    image: { 
        // For small files (stored in MongoDB)
        data: { type: Buffer }, // Binary image data stored directly in MongoDB
        contentType: { type: String }, // MIME type of the image
        
        // For large files (stored in filesystem)
        filePath: { type: String }, // Path to image in the filesystem
        
        // Flag to determine storage method
        storageType: { 
            type: String, 
            enum: ['database', 'filesystem'], // Only these two values are allowed
            required: true 
        }
    }
});

const User = mongoose.model('User', userSchema);

// Simple test endpoint
// Use this to verify server is running correctly
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

/**
 * Create new user with image upload
 * Implements hybrid storage strategy based on file size:
 * - Files > 10MB are stored in filesystem
 * - Files < 10MB are stored in MongoDB
 */
app.post('/api/users', upload.single('image'), async (req, res) => {
    try {
        // Validate request has an image file
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const { name, age } = req.body;
        
        // Validate required fields
        if (!name || !age) {
            return res.status(400).json({ message: 'Name and age are required' });
        }

        const fileSize = req.file.size;
        let userData = {
            name,
            age,
            image: {}
        };
        
        // Implement hybrid storage based on file size
        if (fileSize > FILE_SIZE_THRESHOLD) {
            // Large file: Keep in filesystem
            // Only store path reference in MongoDB
            userData.image = {
                filePath: req.file.path,
                contentType: req.file.mimetype || 'application/octet-stream',
                storageType: 'filesystem'
            };
            
            console.log(`Large file (${fileSize} bytes) stored in filesystem: ${req.file.path}`);
        } else {
            // Small file: Store in MongoDB as binary data
            try {
                // Read file into memory
                userData.image = {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype || 'application/octet-stream',
                    storageType: 'database'
                };
                
                // Remove temporary file after reading for database storage
                // This prevents duplicate storage and saves disk space
                fs.unlinkSync(req.file.path);
                
                console.log(`Small file (${fileSize} bytes) stored in database`);
            } catch (fileError) {
                console.error('Error reading file:', fileError);
                return res.status(500).json({ message: 'Error processing image file' });
            }
        }

        // Create and save new user with appropriate image storage
        const user = new User(userData);
        await user.save();
        
        // Return success response without sending back the image data
        res.status(201).json({ 
            message: 'User created successfully', 
            user: {
                _id: user._id,
                name: user.name,
                age: user.age,
                storageType: user.image.storageType
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

/**
 * Get all users endpoint
 * Returns list of all users without image binary data for better performance
 */
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-image.data'); // Exclude image data for better performance
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

/**
 * Image retrieval endpoint
 * Implements a fallback strategy:
 * 1. First checks if image exists in filesystem (regardless of storageType)
 * 2. If not found, attempts to serve from MongoDB
 * This provides resilience against data inconsistencies
 */
app.get('/api/users/image/:id', async (req, res) => {
    try {
        // Find user by ID
        const user = await User.findById(req.params.id);
        if (!user || !user.image) {
            return res.status(404).send('Image not found');
        }
        
        // Check if content type exists and is valid, use a default if not
        // This prevents invalid content type errors in the response
        let contentType = 'application/octet-stream'; // Default content type
        if (user.image.contentType && typeof user.image.contentType === 'string') {
            contentType = user.image.contentType;
        }
        
        // Set content type for the response
        res.set('Content-Type', contentType);
        
        // FILESYSTEM PRIORITY STRATEGY:
        // First check if image exists in filesystem regardless of storage type
        // This provides resilience against database inconsistencies
        if (user.image.filePath) {
            const filePath = path.resolve(user.image.filePath);
            
            // If file exists in filesystem, serve it
            if (fs.existsSync(filePath)) {
                console.log(`Serving image for user ${user._id} from filesystem: ${filePath}`);
                return fs.createReadStream(filePath).pipe(res);
            } else {
                console.log(`File path exists but file not found for user ${user._id}: ${filePath}`);
                // Continue to database check if file not found
            }
        }
        
        // DATABASE FALLBACK:
        // If not found in filesystem or no filePath, check database
        if (user.image.data) {
            console.log(`Serving image for user ${user._id} from database`);
            return res.send(user.image.data);
        }
        
        // If we reach here, image is not available in either location
        return res.status(404).send('Image not found in filesystem or database');
        
    } catch (error) {
        console.error('Error retrieving image:', error);
        return res.status(500).send('Error retrieving image');
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the API at http://localhost:${PORT}/api/test`);
    console.log(`Files larger than ${FILE_SIZE_THRESHOLD/1024/1024}MB will be stored in the filesystem`);
    console.log(`Files smaller than ${FILE_SIZE_THRESHOLD/1024/1024}MB will be stored in MongoDB`);
}); 