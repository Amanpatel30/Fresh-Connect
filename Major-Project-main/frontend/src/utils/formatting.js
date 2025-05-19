// Format date to a readable string
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Format options
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

// Format short date (without time)
export const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Format options
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

// Format currency value
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'N/A';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount).replace('₹', '₹');
};

// Format number with commas
export const formatNumber = (number) => {
  if (number === undefined || number === null) return 'N/A';
  
  return new Intl.NumberFormat('en-IN').format(number);
};

// Calculate time elapsed since date
export const timeElapsed = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffMs = now - date;
  
  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  
  // Less than a minute
  if (diffSec < 60) {
    return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);
  
  // Less than an hour
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to hours
  const diffHour = Math.floor(diffMin / 60);
  
  // Less than a day
  if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to days
  const diffDay = Math.floor(diffHour / 24);
  
  // Less than a week
  if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to weeks
  const diffWeek = Math.floor(diffDay / 7);
  
  // Less than a month
  if (diffWeek < 4) {
    return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to months
  const diffMonth = Math.floor(diffDay / 30);
  
  // Less than a year
  if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to years
  const diffYear = Math.floor(diffDay / 365);
  
  return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
}; 