const Setting = require('../models/Setting');

// Initialize default settings
const initializeSettings = async () => {
  console.log('Initializing default settings...');
  
  const defaultSettings = [
    {
      key: 'siteName',
      value: 'E-Commerce Platform',
      description: 'Name of the website',
      category: 'general',
      isPublic: true
    },
    {
      key: 'logo',
      value: '/images/logo.png',
      description: 'Site logo URL',
      category: 'appearance',
      isPublic: true
    },
    {
      key: 'currency',
      value: 'USD',
      description: 'Default currency',
      category: 'payment',
      isPublic: true
    },
    {
      key: 'taxRate',
      value: 0.07,
      description: 'Default tax rate',
      category: 'payment',
      isPublic: true
    },
    {
      key: 'shippingFee',
      value: 10,
      description: 'Default shipping fee',
      category: 'shipping',
      isPublic: true
    },
    {
      key: 'emailNotifications',
      value: true,
      description: 'Enable email notifications',
      category: 'email',
      isPublic: false
    },
    {
      key: 'maintenanceMode',
      value: false,
      description: 'Put site in maintenance mode',
      category: 'general',
      isPublic: true
    },
    {
      key: 'contactEmail',
      value: 'contact@example.com',
      description: 'Contact email address',
      category: 'general',
      isPublic: true
    },
    {
      key: 'supportPhone',
      value: '123-456-7890',
      description: 'Support phone number',
      category: 'general',
      isPublic: true
    },
    {
      key: 'socialLinks',
      value: {
        facebook: 'https://facebook.com/example',
        twitter: 'https://twitter.com/example',
        instagram: 'https://instagram.com/example'
      },
      description: 'Social media links',
      category: 'general',
      isPublic: true
    }
  ];

  // For each default setting, create if not exists
  for (const setting of defaultSettings) {
    try {
      const exists = await Setting.findOne({ key: setting.key });
      if (!exists) {
        await Setting.create(setting);
        console.log(`Created setting: ${setting.key}`);
      }
    } catch (error) {
      console.error(`Error creating setting ${setting.key}:`, error.message);
    }
  }
  
  console.log('Default settings initialization complete');
};

module.exports = initializeSettings; 