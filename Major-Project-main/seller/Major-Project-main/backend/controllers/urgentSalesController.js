import UrgentSale from '../models/UrgentSale.js';

// Get all urgent sales for the logged-in seller
export const getUrgentSales = async (req, res) => {
  try {
    const urgentSales = await UrgentSale.find({ seller: req.user.id })
                                       .sort({ createdAt: -1 });
    
    return res.json(urgentSales);
  } catch (error) {
    console.error('Error fetching urgent sales:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a single urgent sale by ID
export const getUrgentSaleById = async (req, res) => {
  try {
    const urgentSale = await UrgentSale.findOne({ 
      _id: req.params.id,
      seller: req.user.id 
    });
    
    if (!urgentSale) {
      return res.status(404).json({ message: 'Urgent sale not found' });
    }
    
    return res.json(urgentSale);
  } catch (error) {
    console.error(`Error fetching urgent sale ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new urgent sale
export const createUrgentSale = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discount,
      quantity,
      unit,
      expiryDate,
      image,
      featured,
      tags
    } = req.body;
    
    // Calculate discounted price
    const discountedPrice = price - (price * discount / 100);
    
    const newUrgentSale = new UrgentSale({
      seller: req.user.id,
      name,
      description,
      category,
      price,
      discountedPrice,
      discount,
      quantity,
      unit,
      expiryDate,
      image,
      featured,
      tags
    });
    
    const savedUrgentSale = await newUrgentSale.save();
    return res.status(201).json(savedUrgentSale);
  } catch (error) {
    console.error('Error creating urgent sale:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update an urgent sale
export const updateUrgentSale = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discount,
      quantity,
      unit,
      expiryDate,
      image,
      featured,
      tags,
      status
    } = req.body;
    
    // Calculate discounted price
    const discountedPrice = price - (price * discount / 100);
    
    const updatedFields = {
      name,
      description,
      category,
      price,
      discountedPrice,
      discount,
      quantity,
      unit,
      expiryDate,
      image,
      featured,
      tags,
      status
    };
    
    // Remove undefined fields
    Object.keys(updatedFields).forEach(key => 
      updatedFields[key] === undefined && delete updatedFields[key]
    );
    
    const urgentSale = await UrgentSale.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );
    
    if (!urgentSale) {
      return res.status(404).json({ message: 'Urgent sale not found' });
    }
    
    return res.json(urgentSale);
  } catch (error) {
    console.error(`Error updating urgent sale ${req.params.id}:`, error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete an urgent sale
export const deleteUrgentSale = async (req, res) => {
  try {
    const urgentSale = await UrgentSale.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.id
    });
    
    if (!urgentSale) {
      return res.status(404).json({ message: 'Urgent sale not found' });
    }
    
    return res.json({ message: 'Urgent sale deleted successfully' });
  } catch (error) {
    console.error(`Error deleting urgent sale ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Toggle featured status
export const toggleFeatured = async (req, res) => {
  try {
    const urgentSale = await UrgentSale.findOne({
      _id: req.params.id,
      seller: req.user.id
    });
    
    if (!urgentSale) {
      return res.status(404).json({ message: 'Urgent sale not found' });
    }
    
    urgentSale.featured = !urgentSale.featured;
    await urgentSale.save();
    
    return res.json(urgentSale);
  } catch (error) {
    console.error(`Error toggling featured status for urgent sale ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Toggle active/inactive status
export const toggleStatus = async (req, res) => {
  try {
    const urgentSale = await UrgentSale.findOne({
      _id: req.params.id,
      seller: req.user.id
    });
    
    if (!urgentSale) {
      return res.status(404).json({ message: 'Urgent sale not found' });
    }
    
    urgentSale.status = urgentSale.status === 'active' ? 'inactive' : 'active';
    await urgentSale.save();
    
    return res.json(urgentSale);
  } catch (error) {
    console.error(`Error toggling status for urgent sale ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 