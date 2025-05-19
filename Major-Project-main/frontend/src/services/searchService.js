import api from './api';

export const searchProducts = async (query, filters = {}) => {
  try {
    const response = await api.get('/search/products', {
      params: {
        q: query,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getSearchSuggestions = async (query) => {
  try {
    const response = await api.get('/search/suggestions', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    throw error;
  }
};

export const getPopularSearches = async () => {
  try {
    const response = await api.get('/search/popular');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    throw error;
  }
};

export const recordSearch = async (query) => {
  try {
    const response = await api.post('/search/record', { query });
    return response.data;
  } catch (error) {
    console.error('Error recording search:', error);
    // Don't throw error as this is not critical for user experience
    return null;
  }
};

export const searchCategories = async (query) => {
  try {
    const response = await api.get('/search/categories', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
};

export default {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  recordSearch,
  searchCategories
}; 