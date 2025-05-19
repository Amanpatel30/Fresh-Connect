const listingRoutes = require('./routes/listingRoutes');
const verificationRoutes = require('./routes/verificationRoutes');

// Routes
app.use('/api/listings', listingRoutes);
app.use('/api/verifications', verificationRoutes); 