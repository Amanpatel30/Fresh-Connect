import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FilterIcon, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Check, 
  Star, 
  DollarSign,
  Clock,
  Truck,
  Percent,
  Leaf
} from 'lucide-react';
import './FilterSection.css';

const FilterSection = ({ 
  title = "Filters", 
  defaultOpen = true, 
  categories = [], 
  priceRange = [0, 1000],
  ratings = [5, 4, 3, 2, 1],
  additionalFilters = [],
  onFilterChange,
  clearFilters,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(priceRange);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedAdditionalFilters, setSelectedAdditionalFilters] = useState({});
  
  // State for sub-filter sections
  const [openSections, setOpenSections] = useState({
    categories: false,
    priceRange: false,
    ratings: false,
    additionalFilters: false
  });

  // Initialize additional filters
  useEffect(() => {
    const initialAdditionalFilters = {};
    additionalFilters.forEach(filter => {
      initialAdditionalFilters[filter.id] = false;
    });
    setSelectedAdditionalFilters(initialAdditionalFilters);
  }, [additionalFilters]);

  // Notify parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        categories: selectedCategories,
        priceRange: selectedPrice,
        rating: selectedRating,
        additionalFilters: selectedAdditionalFilters
      });
    }
  }, [selectedCategories, selectedPrice, selectedRating, selectedAdditionalFilters, onFilterChange]);

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Handle price range change
  const handlePriceChange = (e, index) => {
    const value = parseInt(e.target.value, 10) || 0;
    setSelectedPrice(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      return newRange;
    });
  };

  // Toggle additional filter
  const toggleAdditionalFilter = (filterId) => {
    setSelectedAdditionalFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  // Toggle a specific section
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedPrice(priceRange);
    setSelectedRating(0);
    
    const resetAdditionalFilters = {};
    additionalFilters.forEach(filter => {
      resetAdditionalFilters[filter.id] = false;
    });
    setSelectedAdditionalFilters(resetAdditionalFilters);
    
    if (clearFilters) {
      clearFilters();
    }
  };

  return (
    <div className={`filter-section bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Filter Header */}
      <div 
        className="filter-header flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <FilterIcon className="w-5 h-5 text-gray-700" />
          <h3 className="filter-section-title font-medium text-gray-800">{title}</h3>
        </div>
        <button className="filter-section-button text-gray-500 hover:text-gray-700">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Filter Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 'auto', opacity: 1 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="filter-content overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-100">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="filter-group mb-4">
                  <div 
                    className="filter-group-header flex items-center justify-between cursor-pointer py-2"
                    onClick={() => toggleSection('categories')}
                  >
                    <h4 className="filter-group-title font-medium text-gray-700">Categories</h4>
                    <button className="filter-section-button text-gray-500 hover:text-gray-700">
                      {openSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {openSections.categories && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 mt-2">
                          {categories.map((category) => (
                            <div 
                              key={category} 
                              className="filter-item flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                              onClick={() => toggleCategory(category)}
                            >
                              <div className={`filter-checkbox w-5 h-5 rounded-md flex items-center justify-center ${
                                selectedCategories.includes(category) 
                                  ? 'checked bg-green-500 text-white' 
                                  : 'border border-gray-300'
                              }`}>
                                {selectedCategories.includes(category) && <Check className="filter-checkbox-icon w-3.5 h-3.5" />}
                              </div>
                              <span className="text-gray-700">{category}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Price Range */}
              <div className="filter-group mb-4 border-t border-gray-100 pt-2">
                <div 
                  className="filter-group-header flex items-center justify-between cursor-pointer py-2"
                  onClick={() => toggleSection('priceRange')}
                >
                  <h4 className="filter-group-title font-medium text-gray-700">Price Range</h4>
                  <button className="filter-section-button text-gray-500 hover:text-gray-700">
                    {openSections.priceRange ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {openSections.priceRange && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-4 mt-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <DollarSign className="w-4 h-4" />
                          </span>
                          <input
                            type="number"
                            value={selectedPrice[0]}
                            onChange={(e) => handlePriceChange(e, 0)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Min"
                          />
                        </div>
                        <span className="text-gray-400">to</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <DollarSign className="w-4 h-4" />
                          </span>
                          <input
                            type="number"
                            value={selectedPrice[1]}
                            onChange={(e) => handlePriceChange(e, 1)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ratings */}
              <div className="filter-group mb-4 border-t border-gray-100 pt-2">
                <div 
                  className="filter-group-header flex items-center justify-between cursor-pointer py-2"
                  onClick={() => toggleSection('ratings')}
                >
                  <h4 className="filter-group-title font-medium text-gray-700">Ratings</h4>
                  <button className="filter-section-button text-gray-500 hover:text-gray-700">
                    {openSections.ratings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {openSections.ratings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 mt-2">
                        {ratings.map((rating) => (
                          <div 
                            key={rating} 
                            className={`filter-item flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors ${
                              selectedRating === rating ? 'bg-green-50' : ''
                            }`}
                            onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                          >
                            <div className={`filter-checkbox w-5 h-5 rounded-full flex items-center justify-center ${
                              selectedRating === rating 
                                ? 'checked bg-green-500 text-white' 
                                : 'border border-gray-300'
                            }`}>
                              {selectedRating === rating && <Check className="filter-checkbox-icon w-3.5 h-3.5" />}
                            </div>
                            <div className="flex items-center">
                              {[...Array(rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                              ))}
                              {[...Array(5 - rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-gray-300" />
                              ))}
                              <span className="ml-1 text-gray-700">{rating}+ stars</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Additional Filters */}
              {additionalFilters.length > 0 && (
                <div className="filter-group mb-4 border-t border-gray-100 pt-2">
                  <div 
                    className="filter-group-header flex items-center justify-between cursor-pointer py-2"
                    onClick={() => toggleSection('additionalFilters')}
                  >
                    <h4 className="filter-group-title font-medium text-gray-700">Additional Filters</h4>
                    <button className="filter-section-button text-gray-500 hover:text-gray-700">
                      {openSections.additionalFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {openSections.additionalFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 mt-2">
                          {additionalFilters.map((filter) => (
                            <div 
                              key={filter.id} 
                              className="filter-item flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                              onClick={() => toggleAdditionalFilter(filter.id)}
                            >
                              <div className={`filter-checkbox w-5 h-5 rounded-md flex items-center justify-center ${
                                selectedAdditionalFilters[filter.id] 
                                  ? 'checked bg-green-500 text-white' 
                                  : 'border border-gray-300'
                              }`}>
                                {selectedAdditionalFilters[filter.id] && <Check className="filter-checkbox-icon w-3.5 h-3.5" />}
                              </div>
                              <div className="flex items-center gap-2">
                                {filter.icon}
                                <span className="text-gray-700">{filter.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Clear Filters Button */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <button
                  className="clear-filters-button w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  onClick={handleClearFilters}
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSection; 
