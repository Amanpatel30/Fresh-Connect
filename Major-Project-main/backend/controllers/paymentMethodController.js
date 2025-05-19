import PaymentMethod from '../models/PaymentMethod.js';
import errorHandler from '../utils/errorHandler.js';

// Get all payment methods for a seller
export const getPaymentMethods = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const paymentMethods = await PaymentMethod.find({ seller: sellerId });
    
    res.status(200).json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// Get a single payment method
export const getPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Check if the payment method belongs to the logged-in seller
    if (paymentMethod.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment method'
      });
    }
    
    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// Create a new payment method
export const createPaymentMethod = async (req, res) => {
  try {
    // Add seller ID to the request body
    req.body.seller = req.user._id;
    
    // Create the payment method
    const paymentMethod = await PaymentMethod.create(req.body);
    
    res.status(201).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// Update a payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    let paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Check if the payment method belongs to the logged-in seller
    if (paymentMethod.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this payment method'
      });
    }
    
    // Update the payment method
    paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// Delete a payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Check if the payment method belongs to the logged-in seller
    if (paymentMethod.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this payment method'
      });
    }
    
    await PaymentMethod.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { id } = req.params;
    
    // Find the payment method
    const paymentMethod = await PaymentMethod.findById(id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Check if the payment method belongs to the logged-in seller
    if (paymentMethod.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this payment method'
      });
    }
    
    // Update all payment methods to not be default
    await PaymentMethod.updateMany(
      { seller: sellerId },
      { isDefault: false }
    );
    
    // Set the selected payment method as default
    paymentMethod.isDefault = true;
    await paymentMethod.save();
    
    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    errorHandler(error, res);
  }
}; 