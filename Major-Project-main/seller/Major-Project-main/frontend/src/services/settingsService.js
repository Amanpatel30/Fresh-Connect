import api from './api';

// Get user settings
export const getSettings = async () => {
  try {
    const response = await api.get('/seller/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

// Update general settings
export const updateGeneralSettings = async (generalSettings) => {
  try {
    const response = await api.put('/seller/settings/general', generalSettings);
    return response.data;
  } catch (error) {
    console.error('Error updating general settings:', error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (notificationSettings) => {
  try {
    const response = await api.put('/seller/settings/notifications', notificationSettings);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

// Update security settings
export const updateSecuritySettings = async (securitySettings) => {
  try {
    const response = await api.put('/seller/settings/security', securitySettings);
    return response.data;
  } catch (error) {
    console.error('Error updating security settings:', error);
    throw error;
  }
};

// Reset all settings to default
export const resetSettings = async () => {
  try {
    const response = await api.post('/seller/settings/reset');
    return response.data;
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw error;
  }
}; 