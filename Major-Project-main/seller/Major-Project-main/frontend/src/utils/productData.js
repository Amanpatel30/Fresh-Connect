/**
 * Predefined product data for dropdown selection
 * Contains common vegetables, fruits, and herbs with their default units
 */

const productData = [
  // Vegetables
  { name: 'Tomato', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Potato', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Onion', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Carrot', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Cucumber', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Cabbage', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Cauliflower', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Broccoli', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Spinach', category: 'vegetables', defaultUnit: 'bunch' },
  { name: 'Bell Pepper', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Eggplant', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Zucchini', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Lettuce', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Peas', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Corn', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Garlic', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Ginger', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Mushroom', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Radish', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Beetroot', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Sweet Potato', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Okra', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Bitter Gourd', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Bottle Gourd', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Ridge Gourd', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Snake Gourd', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Pumpkin', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Turnip', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Green Beans', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Cluster Beans', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Drumstick', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Taro Root', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Yam', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Plantain', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Green Chili', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Capsicum', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Artichoke', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Asparagus', category: 'vegetables', defaultUnit: 'bunch' },
  { name: 'Bamboo Shoots', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Brussels Sprouts', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Celery', category: 'vegetables', defaultUnit: 'bunch' },
  { name: 'Chard', category: 'vegetables', defaultUnit: 'bunch' },
  { name: 'Collard Greens', category: 'vegetables', defaultUnit: 'bunch' },
  { name: 'Daikon', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Endive', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Fennel', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Fiddlehead', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Horseradish', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Jicama', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Kale', category: 'vegetables', defaultUnit: 'bunch' },
  { name: 'Kohlrabi', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Leek', category: 'vegetables', defaultUnit: 'bunch' },
  { name: 'Lotus Root', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Napa Cabbage', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Parsnip', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Radicchio', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Rhubarb', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Rutabaga', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Shallot', category: 'vegetables', defaultUnit: 'kg' },
  { name: 'Squash', category: 'vegetables', defaultUnit: 'piece' },
  { name: 'Watercress', category: 'vegetables', defaultUnit: 'bunch' },
  { name: 'Water Chestnut', category: 'vegetables', defaultUnit: 'kg' },
  
  // Fruits
  { name: 'Apple', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Banana', category: 'fruits', defaultUnit: 'dozen' },
  { name: 'Orange', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Grapes', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Watermelon', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Mango', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Pineapple', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Papaya', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Strawberry', category: 'fruits', defaultUnit: 'box' },
  { name: 'Kiwi', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Pear', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Peach', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Plum', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Cherry', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Blueberry', category: 'fruits', defaultUnit: 'box' },
  { name: 'Raspberry', category: 'fruits', defaultUnit: 'box' },
  { name: 'Blackberry', category: 'fruits', defaultUnit: 'box' },
  { name: 'Lemon', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Lime', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Grapefruit', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Pomegranate', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Guava', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Lychee', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Coconut', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Fig', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Avocado', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Jackfruit', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Custard Apple', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Dragon Fruit', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Passion Fruit', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Sapota', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Mulberry', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Jamun', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Star Fruit', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Apricot', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Cantaloupe', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Cranberry', category: 'fruits', defaultUnit: 'box' },
  { name: 'Currant', category: 'fruits', defaultUnit: 'box' },
  { name: 'Date', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Durian', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Elderberry', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Gooseberry', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Honeydew', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Kiwano', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Kumquat', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Longan', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Loquat', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Mandarin', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Mangosteen', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Nectarine', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Persimmon', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Quince', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Rambutan', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Soursop', category: 'fruits', defaultUnit: 'piece' },
  { name: 'Tamarillo', category: 'fruits', defaultUnit: 'kg' },
  { name: 'Tamarind', category: 'fruits', defaultUnit: 'kg' },
  
  // Herbs
  { name: 'Mint', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Coriander', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Basil', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Parsley', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Thyme', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Rosemary', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Sage', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Dill', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Oregano', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Chives', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Lemongrass', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Bay Leaf', category: 'herbs', defaultUnit: 'pack' },
  { name: 'Curry Leaves', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Fenugreek Leaves', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Cilantro', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Anise', category: 'herbs', defaultUnit: 'pack' },
  { name: 'Arugula', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Borage', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Caraway', category: 'herbs', defaultUnit: 'pack' },
  { name: 'Cardamom', category: 'herbs', defaultUnit: 'pack' },
  { name: 'Chamomile', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Chervil', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Chicory', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Clove', category: 'herbs', defaultUnit: 'pack' },
  { name: 'Cumin', category: 'herbs', defaultUnit: 'pack' },
  { name: 'Epazote', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Fennel Seeds', category: 'herbs', defaultUnit: 'pack' },
  { name: 'Hyssop', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Lavender', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Lemon Balm', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Lovage', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Marjoram', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Nasturtium', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Nettle', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Savory', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Sorrel', category: 'herbs', defaultUnit: 'bunch' },
  { name: 'Tarragon', category: 'herbs', defaultUnit: 'bunch' },
  
  // Organic Products
  { name: 'Organic Tomato', category: 'organic', defaultUnit: 'kg' },
  { name: 'Organic Potato', category: 'organic', defaultUnit: 'kg' },
  { name: 'Organic Spinach', category: 'organic', defaultUnit: 'bunch' },
  { name: 'Organic Apple', category: 'organic', defaultUnit: 'kg' },
  { name: 'Organic Carrot', category: 'organic', defaultUnit: 'kg' },
  { name: 'Organic Cucumber', category: 'organic', defaultUnit: 'kg' },
  { name: 'Organic Banana', category: 'organic', defaultUnit: 'dozen' },
  { name: 'Organic Mint', category: 'organic', defaultUnit: 'bunch' },
  { name: 'Organic Coriander', category: 'organic', defaultUnit: 'bunch' },
  { name: 'Organic Onion', category: 'organic', defaultUnit: 'kg' },
  { name: 'Organic Kale', category: 'organic', defaultUnit: 'bunch' },
  { name: 'Organic Blueberry', category: 'organic', defaultUnit: 'box' },
  { name: 'Organic Strawberry', category: 'organic', defaultUnit: 'box' },
  { name: 'Organic Avocado', category: 'organic', defaultUnit: 'piece' },
  { name: 'Organic Broccoli', category: 'organic', defaultUnit: 'piece' },
  { name: 'Organic Lettuce', category: 'organic', defaultUnit: 'piece' },
  { name: 'Organic Bell Pepper', category: 'organic', defaultUnit: 'kg' },
  { name: 'Organic Basil', category: 'organic', defaultUnit: 'bunch' },
  { name: 'Organic Garlic', category: 'organic', defaultUnit: 'kg' },
  { name: 'Organic Ginger', category: 'organic', defaultUnit: 'kg' },
  
  // Dairy & Eggs
  { name: 'Milk', category: 'dairy', defaultUnit: 'liter' },
  { name: 'Cheese', category: 'dairy', defaultUnit: 'kg' },
  { name: 'Butter', category: 'dairy', defaultUnit: 'kg' },
  { name: 'Yogurt', category: 'dairy', defaultUnit: 'kg' },
  { name: 'Eggs', category: 'dairy', defaultUnit: 'dozen' },
  { name: 'Cream', category: 'dairy', defaultUnit: 'liter' },
  { name: 'Paneer', category: 'dairy', defaultUnit: 'kg' },
  { name: 'Ghee', category: 'dairy', defaultUnit: 'kg' },
  
  // Grains & Cereals
  { name: 'Rice', category: 'grains', defaultUnit: 'kg' },
  { name: 'Wheat', category: 'grains', defaultUnit: 'kg' },
  { name: 'Oats', category: 'grains', defaultUnit: 'kg' },
  { name: 'Barley', category: 'grains', defaultUnit: 'kg' },
  { name: 'Quinoa', category: 'grains', defaultUnit: 'kg' },
  { name: 'Millet', category: 'grains', defaultUnit: 'kg' },
  { name: 'Corn Flour', category: 'grains', defaultUnit: 'kg' },
  { name: 'Rye', category: 'grains', defaultUnit: 'kg' },
  
  // Nuts & Seeds
  { name: 'Almonds', category: 'Nuts', defaultUnit: 'kg' },
  { name: 'Cashews', category: 'Nuts', defaultUnit: 'kg' },
  { name: 'Walnuts', category: 'Nuts', defaultUnit: 'kg' },
  { name: 'Peanuts', category: 'Nuts', defaultUnit: 'kg' },
  { name: 'Pistachios', category: 'Nuts', defaultUnit: 'kg' },
  { name: 'Sunflower Seeds', category: 'Nuts', defaultUnit: 'kg' },
  { name: 'Pumpkin Seeds', category: 'Nuts', defaultUnit: 'kg' },
  { name: 'Flax Seeds', category: 'Nuts', defaultUnit: 'kg' },
  { name: 'Chia Seeds', category: 'Nuts', defaultUnit: 'kg' },
];

// Helper function to search products
export const searchProducts = (query) => {
  if (!query) return [];
  
  const lowerCaseQuery = query.toLowerCase();
  return productData.filter(product => 
    product.name.toLowerCase().includes(lowerCaseQuery)
  );
};

// Helper function to get product by name
export const getProductByName = (name) => {
  if (!name) return null;
  
  return productData.find(product => 
    product.name.toLowerCase() === name.toLowerCase()
  );
};

// Helper function to get all products
export const getAllProducts = () => {
  return [...productData];
};

// Helper function to get products by category
export const getProductsByCategory = (category) => {
  if (!category) return [];
  
  return productData.filter(product => product.category === category);
};

// Helper function to get unique categories
export const getUniqueCategories = () => {
  const categories = new Set(productData.map(product => product.category));
  return Array.from(categories);
};

// Helper function to get default unit for a product
export const getDefaultUnit = (productName) => {
  const product = getProductByName(productName);
  return product ? product.defaultUnit : 'kg';
};

export default productData;