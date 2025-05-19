import api from './api';

// Get all categories
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/api/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Update category order
export const updateCategoryOrder = async (categoryIds) => {
  try {
    const response = await api.put('/api/categories/order', { categoryIds });
    return response.data;
  } catch (error) {
    console.error('Error updating category order:', error);
    throw error;
  }
}; 