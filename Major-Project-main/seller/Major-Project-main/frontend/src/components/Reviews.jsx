// Add this at line 61 in the fetchReviews function, just after the reviews are fetched

// Debug the response data
console.log('API Reviews Response:', response);
console.log('API Reviews Response Data:', response.data);
console.log('API Reviews Response Data Type:', typeof response.data);
console.log('API Reviews Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');

// And add this at line 85 in the fetchStats function, just after the stats are fetched

// Debug the response data
console.log('API Stats Response:', response);
console.log('API Stats Response Data:', response.data);
console.log('API Stats Response Data Type:', typeof response.data);
console.log('API Stats Response Data Keys:', response.data ? Object.keys(response.data) : 'No data'); 