import React, { useState, useEffect, useCallback } from 'react';
import { 
  Autocomplete, 
  TextField, 
  Box, 
  Typography, 
  Chip,
  CircularProgress,
  Popper,
  IconButton,
  Tooltip,
  InputAdornment,
  Paper
} from '@mui/material';
import { 
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { searchProducts, getAllProducts, getProductByName, getProductsByCategory } from '../../utils/productData';

// Custom Popper component to ensure proper positioning
const CustomPopper = function (props) {
  return (
    <Popper
      {...props}
      placement="bottom-start"
      disablePortal={true}
      modifiers={[
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            altBoundary: true,
            tether: true,
            rootBoundary: 'document',
            padding: 8,
          },
        },
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
        {
          name: 'flip',
          enabled: true,
        },
        {
          name: 'computeStyles',
          options: {
            gpuAcceleration: false // Helps with positioning stability
          }
        }
      ]}
      style={{
        width: props.style.width,
        zIndex: 1500
      }}
    />
  );
};

/**
 * ProductAutocomplete - A searchable dropdown component for product selection
 * 
 * @param {Object} props
 * @param {string} props.value - Current product name value
 * @param {function} props.onChange - Function called when product is selected
 * @param {function} props.onUnitChange - Function called when unit should be updated
 * @param {string} props.label - Label for the field
 * @param {boolean} props.error - Whether there's an error
 * @param {string} props.helperText - Helper text to display (usually error message)
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.categoryFilter - Optional category to filter products by
 * @param {boolean} props.showCategoryFilter - Whether to show the category filter
 */
const ProductAutocomplete = ({ 
  value, 
  onChange, 
  onUnitChange,
  label = "Product Name",
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  placeholder = "Search for a product...",
  categoryFilter = "",
  showCategoryFilter = true
}) => {
  // Convert string value to object if needed
  const getInitialValue = useCallback(() => {
    if (!value) return null;
    
    // If it's already an object with a name property, use it as is
    if (typeof value === 'object' && value?.name) {
      return value;
    }
    
    // If it's a string, look up the product or create a simple object
    if (typeof value === 'string' && value.trim()) {
      // First check if it's a known product
      const knownProduct = getProductByName(value);
      if (knownProduct) {
        return knownProduct;
      }
      // Otherwise create simple object
      return { name: value };
    }
    
    return null;
  }, [value]);

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(getInitialValue());
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || "");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  // Available categories
  const categories = [
    { value: "", label: "All Categories", color: "default" },
    { value: "vegetables", label: "Vegetables", color: "success" },
    { value: "fruits", label: "Fruits", color: "primary" },
    { value: "herbs", label: "Herbs", color: "info" },
    { value: "organic", label: "Organic", color: "secondary" }
  ];
  
  // Load all products initially
  useEffect(() => {
    if (selectedCategory) {
      setOptions(getProductsByCategory(selectedCategory));
    } else {
      setOptions(getAllProducts());
    }
  }, [selectedCategory]);
  
  // Update when external category filter changes
  useEffect(() => {
    if (categoryFilter !== selectedCategory) {
      setSelectedCategory(categoryFilter);
    }
  }, [categoryFilter]);
  
  // Update the selected product when the value prop changes
  useEffect(() => {
    // Only log meaningful changes - not empty values
    if (value) {
      console.log("Value prop changed:", value);
    }
    
    const newValue = getInitialValue();
    
    // Only update if the value has actually changed to avoid infinite loops
    if (JSON.stringify(newValue) !== JSON.stringify(selectedProduct)) {
      if (newValue) {
        console.log("Updating selectedProduct to:", newValue);
      }
      
      setSelectedProduct(newValue);
      
      if (newValue?.name) {
        setInputValue(newValue.name);
      } else if (typeof newValue === 'string') {
        setInputValue(newValue);
      } else {
        setInputValue('');
      }
    }
  }, [value, selectedProduct]);
  
  // Handle search input changes
  const handleInputChange = (event, newInputValue) => {
    console.log("Input value changed to:", newInputValue);
    setInputValue(newInputValue);
    setLoading(true);
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      if (newInputValue) {
        // If a category is selected, filter by category first
        if (selectedCategory) {
          const categoryProducts = getProductsByCategory(selectedCategory);
          const filteredProducts = categoryProducts.filter(product => 
            product.name.toLowerCase().includes(newInputValue.toLowerCase())
          );
          setOptions(filteredProducts);
        } else {
          setOptions(searchProducts(newInputValue));
        }
      } else {
        // If no search term but category is selected, show all products in that category
        if (selectedCategory) {
          setOptions(getProductsByCategory(selectedCategory));
        } else {
          setOptions(getAllProducts());
        }
      }
      setLoading(false);
    }, 300);
  };
  
  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    // Update options based on selected category
    if (category) {
      setOptions(getProductsByCategory(category));
    } else {
      setOptions(getAllProducts());
    }
  };
  
  // Handle product selection
  const handleChange = (event, newValue) => {
    console.log("Product selected:", newValue);
    
    // Handle null selection (clearing)
    if (newValue === null) {
      setSelectedProduct(null);
      setInputValue('');
      if (onChange) {
        onChange(event, '');
      }
      return;
    }
    
    // Process the selected value
    let processedValue = newValue;
    
    // If newValue is a string, convert to object
    if (typeof newValue === 'string' && newValue.trim() !== '') {
      const existingProduct = getProductByName(newValue);
      processedValue = existingProduct || { name: newValue };
    }
    
    // Update the internal state
    setSelectedProduct(processedValue);
    
    // Set input value for display
    if (typeof processedValue === 'object' && processedValue?.name) {
      setInputValue(processedValue.name);
    } else if (typeof processedValue === 'string') {
      setInputValue(processedValue);
    }
    
    // Notify the parent component with properly processed value
    if (onChange) {
      onChange(event, processedValue);
    }
    
    // If a product was selected, update related fields
    if (processedValue && onUnitChange) {
      let product;
      if (typeof processedValue === 'string') {
        product = getProductByName(processedValue);
      } else if (processedValue.name) {
        product = getProductByName(processedValue.name);
      }
      
      if (product) {
        // Batch these updates together to avoid multiple re-renders
        const updates = {};
        
        if (product.defaultUnit) {
          console.log("Updating unit from product:", product.defaultUnit);
          updates.unit = product.defaultUnit;
        }
        
        if (product.category) {
          console.log("Updating category from product:", product.category);
          updates.category = product.category;
          setSelectedCategory(product.category);
        }
        
        // Send a single update if we have changes
        if (Object.keys(updates).length > 0) {
          onUnitChange({
            target: {
              name: 'batch',
              value: updates
            }
          });
        }
      }
    }
  };
  
  // Get the current category object
  const getCurrentCategory = () => {
    return categories.find(cat => cat.value === selectedCategory) || categories[0];
  };
  
  return (
    <Autocomplete
      id="product-autocomplete"
      options={options}
      value={selectedProduct}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      getOptionLabel={(option) => {
        // Handle different option types
        if (typeof option === 'string') return option;
        return option?.name || '';
      }}
      isOptionEqualToValue={(option, value) => {
        // Ensure proper comparison for option equality
        if (!option || !value) return false;
        if (typeof option === 'string' && typeof value === 'string') 
          return option === value;
        return option.name === value.name;
      }}
      renderOption={(props, option) => {
        return (
          <Box component="li" {...props} key={option.id || option.name}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body1">{option.name}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Chip 
                  label={option.category} 
                  size="small" 
                  color={
                    option.category === 'vegetables' ? 'success' :
                    option.category === 'fruits' ? 'primary' :
                    option.category === 'herbs' ? 'info' : 
                    'default'
                  }
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Default unit: {option.defaultUnit}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      }}
      freeSolo
      selectOnFocus
      clearOnBlur={false}
      loading={loading}
      disabled={disabled}
      fullWidth
      PopperComponent={CustomPopper}
      slotProps={{
        popper: {
          sx: { 
            "& .MuiAutocomplete-listbox": { 
              maxHeight: '300px',
              overflow: 'auto'
            } 
          }
        }
      }}
      onBlur={() => {
        // If user typed something but didn't select from dropdown
        if (inputValue && (!selectedProduct || selectedProduct.name !== inputValue)) {
          const product = getProductByName(inputValue);
          if (product) {
            // If we found a matching product, use it
            console.log("Found product on blur:", product);
            handleChange(null, product);
          } else if (inputValue.trim()) {
            // Create a custom product
            console.log("Creating custom product on blur:", inputValue);
            handleChange(null, { name: inputValue.trim() });
          }
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {showCategoryFilter && (
                  <InputAdornment position="end">
                    {selectedCategory && (
                      <Chip
                        label={getCurrentCategory().label}
                        size="small"
                        color={getCurrentCategory().color}
                        onDelete={() => handleCategoryChange("")}
                        sx={{ mr: 1 }}
                      />
                    )}
                    {!selectedCategory && (
                      <Tooltip 
                        title="Filter by category" 
                        placement="bottom"
                        arrow
                      >
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setFilterMenuOpen(!filterMenuOpen);
                          }}
                          color="primary"
                          aria-label="Filter products by category"
                        >
                          <FilterIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </InputAdornment>
                )}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default ProductAutocomplete; 