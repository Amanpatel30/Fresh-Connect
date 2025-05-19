import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Contacts as ContactIcon,
  LibraryBooks as BlogIcon,
  Policy as PolicyIcon,
  Description as TermsIcon,
  Description
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Rich text editor mockup component
const RichTextEditor = styled(TextField)({
  width: '100%',
  '& .MuiInputBase-root': {
    fontFamily: 'monospace',
    lineHeight: 1.5,
  },
});

// Sample content data for demonstration
const SAMPLE_CONTENT = {
  pages: [
    { id: 1, title: 'Home Page', slug: 'home', lastUpdated: '2023-05-12', status: 'published' },
    { id: 2, title: 'About Us', slug: 'about', lastUpdated: '2023-04-28', status: 'published' },
    { id: 3, title: 'Contact', slug: 'contact', lastUpdated: '2023-03-15', status: 'published' },
    { id: 4, title: 'FAQ', slug: 'faq', lastUpdated: '2023-02-10', status: 'published' },
    { id: 5, title: 'Terms & Conditions', slug: 'terms', lastUpdated: '2023-01-05', status: 'published' },
    { id: 6, title: 'Privacy Policy', slug: 'privacy', lastUpdated: '2023-01-05', status: 'published' }
  ],
  blogPosts: [
    { id: 1, title: 'Top 10 Destinations for 2023', slug: 'top-destinations-2023', category: 'Travel', author: 'John Smith', publishDate: '2023-05-20', status: 'published' },
    { id: 2, title: 'Budget Travel Tips', slug: 'budget-travel-tips', category: 'Tips', author: 'Jane Doe', publishDate: '2023-05-15', status: 'published' },
    { id: 3, title: 'Adventure Sports Guide', slug: 'adventure-sports-guide', category: 'Activities', author: 'John Smith', publishDate: '2023-05-10', status: 'published' },
    { id: 4, title: 'Best Restaurants in Paris', slug: 'best-restaurants-paris', category: 'Food', author: 'Sarah Wilson', publishDate: '2023-05-05', status: 'published' },
    { id: 5, title: 'Summer Vacation Planning', slug: 'summer-vacation-planning', category: 'Planning', author: 'Mike Johnson', publishDate: '2023-04-28', status: 'draft' }
  ],
  banners: [
    { id: 1, title: 'Summer Sale', image: 'banner1.jpg', link: '/summer-sale', active: true, position: 'home_top' },
    { id: 2, title: 'New Collection', image: 'banner2.jpg', link: '/new-collection', active: true, position: 'home_middle' },
    { id: 3, title: 'Special Offer', image: 'banner3.jpg', link: '/special-offer', active: false, position: 'category_page' }
  ]
};

const ContentManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pages, setPages] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [itemType, setItemType] = useState('');

  // Fetch content data
  useEffect(() => {
    const fetchContentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real application, this would be API calls
        // For demo, using setTimeout to simulate API calls
        setTimeout(() => {
          setPages(SAMPLE_CONTENT.pages);
          setBlogPosts(SAMPLE_CONTENT.blogPosts);
          setBanners(SAMPLE_CONTENT.banners);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching content data:', err);
        setError('Failed to load content data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchContentData();
  }, []);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dialog handlers
  const handleOpenDialog = (type, item = null) => {
    setItemType(type);
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
  };

  const handleOpenDeleteDialog = (type, item) => {
    setItemType(type);
    setEditItem(item);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEditItem(null);
  };

  // Save handlers
  const handleSavePage = () => {
    // In a real app, this would save to the backend
    console.log('Saving page:', editItem);
    handleCloseDialog();
  };

  const handleSaveBlogPost = () => {
    // In a real app, this would save to the backend
    console.log('Saving blog post:', editItem);
    handleCloseDialog();
  };

  const handleSaveBanner = () => {
    // In a real app, this would save to the backend
    console.log('Saving banner:', editItem);
    handleCloseDialog();
  };

  // Delete handler
  const handleDelete = () => {
    // In a real app, this would delete from the backend
    console.log('Deleting item:', editItem);
    handleCloseDeleteDialog();
  };

  // Form change handler
  const handleFormChange = (field, value) => {
    setEditItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render page list
  const renderPagesList = () => (
    <Paper sx={{ width: '100%', mb: 3 }}>
      <List>
        {pages.map((page) => (
          <React.Fragment key={page.id}>
            <ListItem>
              <ListItemIcon>
                {page.slug === 'home' ? <HomeIcon /> : 
                 page.slug === 'about' ? <InfoIcon /> : 
                 page.slug === 'contact' ? <ContactIcon /> : 
                 page.slug === 'privacy' ? <PolicyIcon /> : 
                 page.slug === 'terms' ? <TermsIcon /> : <Description />}
              </ListItemIcon>
              <ListItemText 
                primary={page.title}
                secondary={`Last updated: ${page.lastUpdated} · Status: ${page.status}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleOpenDialog('page', page)}>
                  <EditIcon />
                </IconButton>
                {page.slug !== 'home' && page.slug !== 'about' && page.slug !== 'contact' && (
                  <IconButton edge="end" onClick={() => handleOpenDeleteDialog('page', page)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('page')}
        >
          Add New Page
        </Button>
      </Box>
    </Paper>
  );

  // Render blog posts list
  const renderBlogPostsList = () => (
    <Paper sx={{ width: '100%', mb: 3 }}>
      <List>
        {blogPosts.map((post) => (
          <React.Fragment key={post.id}>
            <ListItem>
              <ListItemIcon>
                <BlogIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {post.title}
                    <Chip 
                      size="small" 
                      label={post.status} 
                      color={post.status === 'published' ? 'success' : 'default'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={`Category: ${post.category} · Author: ${post.author} · Published: ${post.publishDate}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleOpenDialog('blog', post)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleOpenDeleteDialog('blog', post)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('blog')}
        >
          Add New Blog Post
        </Button>
      </Box>
    </Paper>
  );

  // Render banners grid
  const renderBannersGrid = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {banners.map((banner) => (
        <Grid item xs={12} sm={6} md={4} key={banner.id}>
          <Card>
            <Box 
              sx={{ 
                height: 140, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'action.hover',
                position: 'relative'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Banner Image Preview
              </Typography>
              <ImageIcon sx={{ position: 'absolute', fontSize: 60, opacity: 0.2 }} />
            </Box>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {banner.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Position: {banner.position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Link: {banner.link}
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={banner.active} 
                    onChange={() => {}} 
                    size="small"
                  />
                }
                label={banner.active ? 'Active' : 'Inactive'}
              />
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<EditIcon />}
                onClick={() => handleOpenDialog('banner', banner)}
              >
                Edit
              </Button>
              <Button 
                size="small" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => handleOpenDeleteDialog('banner', banner)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <AddIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('banner')}
          >
            Add New Banner
          </Button>
        </Card>
      </Grid>
    </Grid>
  );

  // Render page edit dialog
  const renderPageEditDialog = () => (
    <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {editItem ? `Edit Page: ${editItem.title}` : 'Create New Page'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Page Title"
              fullWidth
              value={editItem?.title || ''}
              onChange={(e) => handleFormChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="URL Slug"
              fullWidth
              value={editItem?.slug || ''}
              onChange={(e) => handleFormChange('slug', e.target.value)}
              helperText="This will be used in the page URL"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editItem?.status || 'draft'}
                onChange={(e) => handleFormChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Page Content</Typography>
            <RichTextEditor
              multiline
              rows={12}
              fullWidth
              variant="outlined"
              value={editItem?.content || ''}
              onChange={(e) => handleFormChange('content', e.target.value)}
              placeholder="Enter the page content here..."
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={editItem?.showInMenu || false} 
                  onChange={(e) => handleFormChange('showInMenu', e.target.checked)} 
                />
              }
              label="Show in Navigation Menu"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button variant="contained" onClick={handleSavePage}>
          {editItem ? 'Update Page' : 'Create Page'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render blog post edit dialog
  const renderBlogEditDialog = () => (
    <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {editItem ? `Edit Blog Post: ${editItem.title}` : 'Create New Blog Post'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Post Title"
              fullWidth
              value={editItem?.title || ''}
              onChange={(e) => handleFormChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="URL Slug"
              fullWidth
              value={editItem?.slug || ''}
              onChange={(e) => handleFormChange('slug', e.target.value)}
              helperText="This will be used in the post URL"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editItem?.category || ''}
                onChange={(e) => handleFormChange('category', e.target.value)}
                label="Category"
              >
                <MenuItem value="Travel">Travel</MenuItem>
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Tips">Tips</MenuItem>
                <MenuItem value="Activities">Activities</MenuItem>
                <MenuItem value="Planning">Planning</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Author</InputLabel>
              <Select
                value={editItem?.author || ''}
                onChange={(e) => handleFormChange('author', e.target.value)}
                label="Author"
              >
                <MenuItem value="John Smith">John Smith</MenuItem>
                <MenuItem value="Jane Doe">Jane Doe</MenuItem>
                <MenuItem value="Sarah Wilson">Sarah Wilson</MenuItem>
                <MenuItem value="Mike Johnson">Mike Johnson</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editItem?.status || 'draft'}
                onChange={(e) => handleFormChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Featured Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="outlined" component="label">
                Upload Image
                <input type="file" hidden />
              </Button>
              <Typography variant="body2" sx={{ ml: 2 }}>
                {editItem?.featuredImage || 'No image selected'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Post Content</Typography>
            <RichTextEditor
              multiline
              rows={12}
              fullWidth
              variant="outlined"
              value={editItem?.content || ''}
              onChange={(e) => handleFormChange('content', e.target.value)}
              placeholder="Write your blog post content here..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button variant="contained" onClick={handleSaveBlogPost}>
          {editItem ? 'Update Post' : 'Publish Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render banner edit dialog
  const renderBannerEditDialog = () => (
    <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editItem ? `Edit Banner: ${editItem.title}` : 'Create New Banner'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Banner Title"
              fullWidth
              value={editItem?.title || ''}
              onChange={(e) => handleFormChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Link URL"
              fullWidth
              value={editItem?.link || ''}
              onChange={(e) => handleFormChange('link', e.target.value)}
              helperText="Where should this banner link to?"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={editItem?.position || ''}
                onChange={(e) => handleFormChange('position', e.target.value)}
                label="Position"
              >
                <MenuItem value="home_top">Home Page - Top</MenuItem>
                <MenuItem value="home_middle">Home Page - Middle</MenuItem>
                <MenuItem value="home_bottom">Home Page - Bottom</MenuItem>
                <MenuItem value="category_page">Category Pages</MenuItem>
                <MenuItem value="sidebar">Sidebar</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Banner Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="outlined" component="label">
                Upload Image
                <input type="file" hidden />
              </Button>
              <Typography variant="body2" sx={{ ml: 2 }}>
                {editItem?.image || 'No image selected'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={editItem?.active || false} 
                  onChange={(e) => handleFormChange('active', e.target.checked)} 
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button variant="contained" onClick={handleSaveBanner}>
          {editItem ? 'Update Banner' : 'Create Banner'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render delete confirmation dialog
  const renderDeleteDialog = () => (
    <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
      <DialogTitle>
        Confirm Delete
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete{' '}
          {itemType === 'page' ? 'the page' : 
           itemType === 'blog' ? 'the blog post' : 
           'the banner'}{' '}
          <strong>"{editItem?.title}"</strong>?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Content Management
      </Typography>

      {/* Content Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Pages" />
          <Tab label="Blog Posts" />
          <Tab label="Banners" />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content based on selected tab */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 && renderPagesList()}
          {tabValue === 1 && renderBlogPostsList()}
          {tabValue === 2 && renderBannersGrid()}
        </>
      )}

      {/* Edit Dialogs */}
      {dialogOpen && itemType === 'page' && renderPageEditDialog()}
      {dialogOpen && itemType === 'blog' && renderBlogEditDialog()}
      {dialogOpen && itemType === 'banner' && renderBannerEditDialog()}

      {/* Delete Dialog */}
      {deleteDialogOpen && renderDeleteDialog()}
    </Box>
  );
};

export default ContentManagement; 