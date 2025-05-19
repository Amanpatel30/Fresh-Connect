import UrgentSale from '../models/urgentSaleModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all urgent sales for a seller
export const getSellerUrgentSales = catchAsync(async (req, res, next) => {
  // Get all urgent sales for the seller
  const urgentSales = await UrgentSale.find({ seller: req.user._id });

  // Calculate dashboard stats
  const totalSales = urgentSales.reduce((sum, product) => sum + (product.sales || 0), 0);
  const totalRevenue = urgentSales.reduce((sum, product) => sum + ((product.discountedPrice || 0) * (product.sales || 0)), 0);
  const totalDiscount = urgentSales.reduce((sum, product) => sum + (product.discount || 0), 0);
  const averageDiscount = urgentSales.length > 0 ? totalDiscount / urgentSales.length : 0;
    
  // Group by category
  const categorySalesMap = {};
  urgentSales.forEach(product => {
    if (product.category) {
      categorySalesMap[product.category] = (categorySalesMap[product.category] || 0) + (product.sales || 0);
    }
  });
    
  const categorySales = Object.entries(categorySalesMap).map(([name, value]) => ({ name, value }));

  // Calculate expiring soon products
  const now = new Date();
  const twoDaysFromNow = new Date(now);
  twoDaysFromNow.setDate(now.getDate() + 2);
  
  const expiringSoon = urgentSales.filter(product => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate > now && expiryDate <= twoDaysFromNow && product.status === 'active';
  });

  res.status(200).json({
    status: 'success',
    results: urgentSales.length,
    data: {
      urgentSales,
      stats: {
        totalSales,
        totalRevenue,
        averageDiscount,
        categorySales,
        expiringSoon: expiringSoon.length
      }
    }
  });
});

// Get a single urgent sale by ID
export const getUrgentSaleById = catchAsync(async (req, res, next) => {
  const urgentSale = await UrgentSale.findOne({
    _id: req.params.id,
    seller: req.user._id
  });

  if (!urgentSale) {
    return next(new AppError('Urgent sale not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      urgentSale
    }
  });
});

// Create a new urgent sale
export const createUrgentSale = catchAsync(async (req, res, next) => {
  // Create urgent sale with seller ID from authenticated user
  const newUrgentSale = await UrgentSale.create({
    ...req.body,
    seller: req.user._id,
    images: req.file ? [{
      url: `/uploads/${req.file.filename}`,
      key: req.file.filename
    }] : []
  });

  res.status(201).json({
    status: 'success',
    data: {
      urgentSale: newUrgentSale
    }
  });
});

// Update an urgent sale
export const updateUrgentSale = catchAsync(async (req, res, next) => {
  // Find and update the urgent sale
  const updatedUrgentSale = await UrgentSale.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedUrgentSale) {
    return next(new AppError('Urgent sale not found', 404));
  }

  // If there's a new image, add it to the images array
  if (req.file) {
    updatedUrgentSale.images.push({
      url: `/uploads/${req.file.filename}`,
      key: req.file.filename
    });
    await updatedUrgentSale.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      urgentSale: updatedUrgentSale
    }
  });
});

// Delete an urgent sale
export const deleteUrgentSale = catchAsync(async (req, res, next) => {
  const urgentSale = await UrgentSale.findOneAndDelete({
    _id: req.params.id,
    seller: req.user._id
  });

  if (!urgentSale) {
    return next(new AppError('Urgent sale not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Toggle featured status of an urgent sale
// @route   PATCH /api/urgent-sales/:id/featured
// @access  Private/Seller
export const toggleFeatured = catchAsync(async (req, res, next) => {
  const urgentSale = await UrgentSale.findById(req.params.id);

  if (!urgentSale) {
    return next(new AppError('Urgent sale not found', 404));
  }

  // Check if the urgent sale belongs to the logged-in seller
  if (urgentSale.seller.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this urgent sale', 401));
  }

  urgentSale.featured = !urgentSale.featured;
  await urgentSale.save();

  res.status(200).json({
    status: 'success',
    data: {
      urgentSale
    }
  });
});

// @desc    Toggle status of an urgent sale (active/inactive)
// @route   PATCH /api/urgent-sales/:id/status
// @access  Private/Seller
export const toggleStatus = catchAsync(async (req, res, next) => {
  const urgentSale = await UrgentSale.findById(req.params.id);

  if (!urgentSale) {
    return next(new AppError('Urgent sale not found', 404));
  }

  // Check if the urgent sale belongs to the logged-in seller
  if (urgentSale.seller.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this urgent sale', 401));
  }

  urgentSale.status = urgentSale.status === 'active' ? 'inactive' : 'active';
  await urgentSale.save();

  res.status(200).json({
    status: 'success',
    data: {
      urgentSale
    }
  });
}); 