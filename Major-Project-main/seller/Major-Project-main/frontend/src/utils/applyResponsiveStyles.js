import { responsiveCardStyles, responsiveGridContainerStyles, responsiveButtonStyles } from './responsiveUtils';

/**
 * Applies responsive styles to Material-UI components
 * This function can be used to quickly make components responsive
 * 
 * @param {Object} component - The component to apply styles to
 * @param {String} type - The type of component (card, grid, button, etc.)
 * @param {Object} additionalStyles - Additional styles to merge with the responsive styles
 * @returns {Object} - The component with responsive styles applied
 */
export const applyResponsiveStyles = (component, type, additionalStyles = {}) => {
  let styles = {};
  
  switch (type) {
    case 'card':
      styles = { ...responsiveCardStyles, ...additionalStyles };
      break;
    case 'grid':
      styles = { ...responsiveGridContainerStyles, ...additionalStyles };
      break;
    case 'button':
      styles = { ...responsiveButtonStyles, ...additionalStyles };
      break;
    default:
      styles = additionalStyles;
  }
  
  // Apply the styles to the component
  return {
    ...component,
    sx: {
      ...(component.sx || {}),
      ...styles
    }
  };
};

/**
 * Makes a component fully responsive for mobile devices
 * 
 * @param {Object} theme - The Material-UI theme object
 * @param {Object} component - The component to make responsive
 * @returns {Object} - The responsive component
 */
export const makeResponsive = (theme, component) => {
  // Apply responsive styles based on component type
  if (component.type === 'Card') {
    return applyResponsiveStyles(component, 'card');
  }
  
  if (component.type === 'Grid') {
    return applyResponsiveStyles(component, 'grid');
  }
  
  if (component.type === 'Button') {
    return applyResponsiveStyles(component, 'button');
  }
  
  // For other components, return as is
  return component;
};

/**
 * Applies responsive typography styles to text elements
 * 
 * @param {String} variant - The typography variant (h1, h2, body1, etc.)
 * @returns {Object} - The responsive typography styles
 */
export const getResponsiveTypography = (variant) => {
  const baseStyles = {
    h1: { fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } },
    h2: { fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } },
    h3: { fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } },
    h4: { fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } },
    h5: { fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } },
    h6: { fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } },
    body1: { fontSize: { xs: '0.875rem', sm: '1rem' } },
    body2: { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
  };
  
  return baseStyles[variant] || {};
};

/**
 * Applies responsive spacing to components
 * 
 * @param {String} type - The type of spacing (margin, padding)
 * @param {String} direction - The direction of spacing (top, bottom, left, right)
 * @param {Number} value - The base value for the spacing
 * @returns {Object} - The responsive spacing styles
 */
export const getResponsiveSpacing = (type, direction, value) => {
  const prop = `${type}${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
  
  return {
    [prop]: { xs: value * 0.75, sm: value, md: value * 1.25 }
  };
};

/**
 * Applies responsive flex layout to components
 * 
 * @param {String} direction - The flex direction for mobile (column or row)
 * @returns {Object} - The responsive flex layout styles
 */
export const getResponsiveFlexLayout = (direction = 'column') => {
  return {
    flexDirection: { xs: direction, sm: 'row' },
    alignItems: { xs: 'flex-start', sm: 'center' },
    gap: { xs: 2, sm: 1 }
  };
}; 