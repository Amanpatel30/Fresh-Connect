import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5003/api';

const contentService = {
  // Pages
  getPages: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pages`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch pages');
    }
  },

  createPage: async (pageData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pages`, pageData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create page');
    }
  },

  updatePage: async (id, pageData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/pages/${id}`, pageData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update page');
    }
  },

  deletePage: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/pages/${id}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete page');
    }
  },

  // Blog Posts
  getBlogPosts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blog-posts`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch blog posts');
    }
  },

  createBlogPost: async (postData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/blog-posts`, postData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create blog post');
    }
  },

  updateBlogPost: async (id, postData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/blog-posts/${id}`, postData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update blog post');
    }
  },

  deleteBlogPost: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/blog-posts/${id}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete blog post');
    }
  },

  // Media
  getMedia: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/media`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch media');
    }
  },

  uploadMedia: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to upload media');
    }
  },

  updateMedia: async (id, mediaData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/media/${id}`, mediaData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update media');
    }
  },

  deleteMedia: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/media/${id}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete media');
    }
  },
};

export default contentService; 