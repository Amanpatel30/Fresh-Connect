/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency (INR)
 * @param {number} amount - The amount to format
 * @param {string} currencySymbol - The currency symbol to use (defaults to ₹)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencySymbol = '₹') => {
  if (amount === null || amount === undefined) {
    return `${currencySymbol}0`;
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return `${currencySymbol}0`;
  }

  // Format with Indian numbering system (e.g., 1,00,000 instead of 100,000)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Replace the INR symbol with the provided currency symbol
  return formatter.format(numAmount).replace('₹', currencySymbol);
};

/**
 * Format a date string to a readable format
 * @param {string|Date} dateString - The date to format
 * @param {boolean} includeTime - Whether to include the time
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    
    return date.toLocaleDateString('en-IN', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
};

/**
 * Format a number with commas for thousands
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) {
    return '0';
  }
  
  // Convert to number if it's a string
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-IN').format(numValue);
};

/**
 * Truncate a string if it exceeds a certain length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Format a file size in bytes to a human-readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  formatCurrency,
  formatDate,
  formatNumber,
  truncateString,
  formatFileSize
}; 