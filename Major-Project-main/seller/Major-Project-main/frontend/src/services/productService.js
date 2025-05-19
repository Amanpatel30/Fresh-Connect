import api from './api';

// Get all products with optional filters
export const getProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get a single product
export const getProduct = async (id) => {
  try {
    const response = await api.get(`/seller/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Get all seller products with optional filters
export const getSellerProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = `/seller/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/seller/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/seller/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/seller/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Duplicate a product
export const duplicateProduct = async (productId) => {
  try {
    const product = await getProduct(productId);
    
    if (!product.data) {
      throw new Error('Product not found');
    }
    
    // Create a copy of the product with a new name
    const productData = { ...product.data };
    delete productData._id;
    delete productData.createdAt;
    delete productData.updatedAt;
    
    productData.name = `${productData.name} (Copy)`;
    
    // Create the duplicated product
    const response = await createProduct(productData);
    return response;
  } catch (error) {
    console.error('Error duplicating product:', error);
    throw error;
  }
};

// Upload product images
export const uploadProductImages = async (id, formData) => {
  try {
    const response = await api.post(`/seller/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading product images:', error);
    throw error;
  }
};

// Get product statistics
export const getProductStats = async () => {
  try {
    const response = await api.get('/seller/products/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching product statistics:', error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async () => {
  try {
    const response = await api.get('/seller/products/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// Toggle featured status
export const toggleFeaturedStatus = async (id) => {
  try {
    const response = await api.patch(`/seller/products/${id}/featured`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling featured status for product ${id}:`, error);
    throw error;
  }
};

// Bulk update products
export const bulkUpdateProducts = async (productIds, updateData) => {
  try {
    const response = await api.patch('/seller/products/bulk-update', {
      productIds,
      updateData
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating products:', error);
    throw error;
  }
}; 