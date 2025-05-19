import UrgentSale from '../models/urgentSaleModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all urgent sales
// @route   GET /api/urgent-sales
// @access  Private/Seller
export const getUrgentSales = asyncHandler(async (req, res) => {
  const urgentSales = await UrgentSale.find({ seller: req.user._id });
  
  // Store results in res.locals instead of sending response
  res.locals.urgentSaleStats = {
    urgentSales,
    totalUrgentSales: urgentSales.length,
    activeUrgentSales: urgentSales.filter(sale => sale.status === 'active').length,
    expiringSoon: urgentSales.filter(sale => {
      const daysUntilExpiry = Math.ceil((new Date(sale.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 2 && daysUntilExpiry >= 0;
    }).length
  };
});

// @desc    Get a single urgent sale
// @route   GET /api/urgent-sales/:id
// @access  Private/Seller
export const getUrgentSale = asyncHandler(async (req, res) => {
  const urgentSale = await UrgentSale.findById(req.params.id);

  if (!urgentSale) {
    res.status(404);
    throw new Error('Urgent sale not found');
  }

  // Check if the urgent sale belongs to the logged-in seller
  if (urgentSale.seller.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this urgent sale');
  }

  res.status(200).json(urgentSale);
});

// @desc    Create a new urgent sale
// @route   POST /api/urgent-sales
// @access  Private/Seller
export const createUrgentSale = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    discountedPrice,
    quantity,
    unit,
    expiryDate,
    image,
    featured,
    tags,
    status
  } = req.body;

  // Validate required fields
  if (!name || !price || !discountedPrice || !quantity || !expiryDate) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  // Calculate discount percentage
  const discount = Math.round(((price - discountedPrice) / price) * 100);

  // Create new urgent sale
  const urgentSale = await UrgentSale.create({
    name,
    description,
    category,
    price,
    discountedPrice,
    quantity,
    unit,
    expiryDate,
    image,
    discount,
    featured: featured || false,
    tags: tags || [],
    status: status || 'active',
    seller: req.user._id,
    views: 0,
    sales: 0
  });

  res.status(201).json(urgentSale);
});

// @desc    Update an urgent sale
// @route   PUT /api/urgent-sales/:id
// @access  Private/Seller
export const updateUrgentSale = asyncHandler(async (req, res) => {
  const urgentSale = await UrgentSale.findById(req.params.id);

  if (!urgentSale) {
    res.status(404);
    throw new Error('Urgent sale not found');
  }

  // Check if the urgent sale belongs to the logged-in seller
  if (urgentSale.seller.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this urgent sale');
  }

  // Calculate discount if price and discountedPrice are provided
  let discount = urgentSale.discount;
  if (req.body.price && req.body.discountedPrice) {
    discount = Math.round(((req.body.price - req.body.discountedPrice) / req.body.price) * 100);
  }

  // Update the urgent sale
  const updatedUrgentSale = await UrgentSale.findByIdAndUpdate(
    req.params.id,
    { ...req.body, discount },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedUrgentSale);
});

// @desc    Delete an urgent sale
// @route   DELETE /api/urgent-sales/:id
// @access  Private/Seller
export const deleteUrgentSale = asyncHandler(async (req, res) => {
  const urgentSale = await UrgentSale.findById(req.params.id);

  if (!urgentSale) {
    res.status(404);
    throw new Error('Urgent sale not found');
  }

  // Check if the urgent sale belongs to the logged-in seller
  if (urgentSale.seller.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this urgent sale');
  }

  await urgentSale.remove();
  res.status(200).json({ id: req.params.id });
});

// @desc    Toggle featured status of an urgent sale
// @route   PATCH /api/urgent-sales/:id/featured
// @access  Private/Seller
export const toggleFeatured = asyncHandler(async (req, res) => {
  const urgentSale = await UrgentSale.findById(req.params.id);

  if (!urgentSale) {
    res.status(404);
    throw new Error('Urgent sale not found');
  }

  // Check if the urgent sale belongs to the logged-in seller
  if (urgentSale.seller.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this urgent sale');
  }

  urgentSale.featured = !urgentSale.featured;
  await urgentSale.save();

  res.status(200).json(urgentSale);
});

// @desc    Toggle status of an urgent sale (active/inactive)
// @route   PATCH /api/urgent-sales/:id/status
// @access  Private/Seller
export const toggleStatus = asyncHandler(async (req, res) => {
  const urgentSale = await UrgentSale.findById(req.params.id);

  if (!urgentSale) {
    res.status(404);
    throw new Error('Urgent sale not found');
  }

  // Check if the urgent sale belongs to the logged-in seller
  if (urgentSale.seller.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this urgent sale');
  }

  urgentSale.status = urgentSale.status === 'active' ? 'inactive' : 'active';
  await urgentSale.save();

  res.status(200).json(urgentSale);
}); 