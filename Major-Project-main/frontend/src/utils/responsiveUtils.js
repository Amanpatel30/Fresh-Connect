// Responsive utility functions and mixins for seller pages

// Common responsive styles for cards
export const responsiveCardStyles = {
  height: '100%',
  borderRadius: { xs: '12px', sm: '16px' },
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  }
};

// Common responsive styles for grid containers with optimized spacing
export const responsiveGridContainerStyles = {
  spacing: { xs: 2, sm: 3 },
  mb: { xs: 2, sm: 3 }
};

// Common responsive styles for section headers
export const responsiveSectionHeaderStyles = {
  fontSize: { xs: '1.25rem', sm: '1.5rem' },
  fontWeight: 600,
  mb: { xs: 2, sm: 3 }
};

// Common responsive styles for buttons
export const responsiveButtonStyles = {
  fontSize: { xs: '0.875rem', sm: '1rem' },
  py: { xs: 0.75, sm: 1 },
  px: { xs: 1.5, sm: 2 }
};

// Common responsive styles for dialogs
export const responsiveDialogStyles = (theme) => ({
  fullScreen: theme.breakpoints.down('sm'),
  '& .MuiDialogTitle-root': {
    py: { xs: 1, sm: 1.5 },
    px: { xs: 1.5, sm: 2 },
    fontSize: { xs: '1.125rem', sm: '1.25rem' }
  }
});

// Common responsive styles for dialog actions
export const responsiveDialogActionStyles = {
  px: { xs: 1.5, sm: 2 }, 
  py: { xs: 1, sm: 1.5 }, 
  flexDirection: { xs: 'column', sm: 'row' }, 
  gap: { xs: 0.5, sm: 0 }
};

// Common responsive styles for form fields
export const responsiveFormFieldStyles = {
  mb: { xs: 1, sm: 1.5 },
  '& .MuiInputBase-root': {
    height: { xs: '36px', sm: '40px' }
  }
};

// Common responsive styles for tables
export const responsiveTableStyles = {
  minWidth: { xs: '100%', sm: 650, md: 750 },
  '& .MuiTableCell-root': {
    py: { xs: 0.75, sm: 1 },
    px: { xs: 0.5, sm: 1 }
  }
};

// Common responsive styles for list items
export const responsiveListItemStyles = {
  p: { xs: 1, sm: 1.5 },
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 0.5, sm: 0 }
};

// Common responsive styles for flex containers
export const responsiveFlexContainerStyles = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'flex-start', sm: 'center' },
  gap: { xs: 1, sm: 2 }
};

// Common responsive styles for paper components
export const responsivePaperStyles = {
  p: { xs: 1, sm: 1.5 },
  borderRadius: 2,
  width: '100%'
};

// Common responsive styles for typography
export const responsiveTypographyStyles = {
  fontSize: { 
    h1: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
    h2: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
    h3: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
    h4: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
    h5: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
    h6: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
    body1: { xs: '0.75rem', sm: '0.875rem' },
    body2: { xs: '0.7rem', sm: '0.75rem' }
  }
};

// Optimized container styles for all seller pages
export const optimizedContainerStyles = {
  width: '100%',
  maxWidth: '100%',
  mx: 'auto',
  px: { xs: 2, sm: 3 },
  py: { xs: 2, sm: 3 },
  overflowX: 'hidden',
  willChange: 'transform',
  backfaceVisibility: 'hidden'
}; 