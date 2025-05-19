import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  CircularProgress,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  Article as ArticleIcon,
  PhotoLibrary as BannerIcon,
  FileDownload as ExportIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import contentService from '../services/contentService';

// Sample data for content management
const SAMPLE_PAGES = [
  { id: 1, title: 'Home Page', slug: 'home', status: 'Published', lastUpdated: '2023-05-15', author: 'Mike Johnson' },
  { id: 2, title: 'About Us', slug: 'about-us', status: 'Published', lastUpdated: '2023-04-20', author: 'Sarah Wilson' },
  { id: 3, title: 'Services', slug: 'services', status: 'Published', lastUpdated: '2023-04-10', author: 'Mike Johnson' },
  { id: 4, title: 'Contact', slug: 'contact', status: 'Published', lastUpdated: '2023-03-22', author: 'John Smith' },
  { id: 5, title: 'FAQ', slug: 'faq', status: 'Draft', lastUpdated: '2023-05-18', author: 'Sarah Wilson' },
  { id: 6, title: 'Terms of Service', slug: 'terms', status: 'Published', lastUpdated: '2023-02-15', author: 'Mike Johnson' },
];

const SAMPLE_BLOG_POSTS = [
  { id: 1, title: '10 Productivity Tips for Remote Work', slug: 'productivity-tips-remote-work', category: 'Productivity', status: 'Published', lastUpdated: '2023-05-20', author: 'Sarah Wilson' },
  { id: 2, title: 'How AI is Transforming Business', slug: 'ai-transforming-business', category: 'Technology', status: 'Published', lastUpdated: '2023-05-15', author: 'Mike Johnson' },
  { id: 3, title: 'Building Effective Teams', slug: 'building-effective-teams', category: 'Management', status: 'Draft', lastUpdated: '2023-05-18', author: 'John Smith' },
  { id: 4, title: 'The Future of Remote Work', slug: 'future-remote-work', category: 'Work Culture', status: 'Published', lastUpdated: '2023-05-10', author: 'Sarah Wilson' },
  { id: 5, title: 'Digital Transformation Strategies', slug: 'digital-transformation-strategies', category: 'Technology', status: 'Scheduled', lastUpdated: '2023-05-12', author: 'Mike Johnson' },
];

const SAMPLE_MEDIA = [
  { id: 1, title: 'Team Meeting', type: 'image/jpeg', size: '1.2 MB', dimensions: '1920x1080', uploadDate: '2023-05-15', url: '/images/sample1.jpg' },
  { id: 2, title: 'Office Space', type: 'image/jpeg', size: '0.8 MB', dimensions: '1600x900', uploadDate: '2023-05-10', url: '/images/sample2.jpg' },
  { id: 3, title: 'Product Demo', type: 'video/mp4', size: '15.4 MB', dimensions: '1920x1080', uploadDate: '2023-05-05', url: '/videos/demo.mp4' },
  { id: 4, title: 'Company Logo', type: 'image/png', size: '0.2 MB', dimensions: '512x512', uploadDate: '2023-04-20', url: '/images/logo.png' },
  { id: 5, title: 'Annual Report', type: 'application/pdf', size: '2.5 MB', dimensions: '-', uploadDate: '2023-04-15', url: '/documents/report.pdf' },
];

const ContentManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentData, setContentData] = useState({
    pages: [],
    blogPosts: [],
    media: []
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const formRefs = useRef({
    title: null,
    slug: null,
    status: null,
    content: null,
    category: null,
    author: null,
    altText: null
  });

  // Load content data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pages, blogPosts, media] = await Promise.all([
          contentService.getPages(),
          contentService.getBlogPosts(),
          contentService.getMedia()
        ]);
        
        setContentData({
          pages,
          blogPosts,
          media
        });
      } catch (err) {
        console.error('Content loading error:', err);
        setError(`Failed to fetch content. Please make sure the API server is running on port 5003. Error: ${err.message}`);
        showSnackbar(`Failed to load content: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter data based on search query and filters
  const getFilteredData = () => {
    let data = [];
    
    // Get data based on current tab
    if (tabValue === 0) data = [...contentData.pages];
    else if (tabValue === 1) data = [...contentData.blogPosts];
    else data = [...contentData.media];
    
    // Apply search filter
    if (searchQuery) {
      data = data.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all' && tabValue !== 2) {
      data = data.filter(item => item.status.toLowerCase() === filterStatus.toLowerCase());
    }
    
    // Apply sorting
    data.sort((a, b) => {
      if (sortBy === 'lastUpdated') {
        const dateA = new Date(a.lastUpdated || a.uploadDate);
        const dateB = new Date(b.lastUpdated || b.uploadDate);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (a[sortBy] < b[sortBy]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return data;
  };

  // Open dialog for create/edit
  const handleOpenDialog = (type, item = null) => {
    // Map 'create' to the appropriate type based on current tab
    if (type === 'create') {
      type = tabValue === 0 ? 'addPage' : tabValue === 1 ? 'addPost' : 'addMedia';
    }
    setDialogType(type);
    setSelectedItem(item);
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  // Open menu for item actions
  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  // Close menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // Open delete confirmation dialog
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Close delete confirmation dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  // Handle create/edit item
  const handleSaveItem = async () => {
    try {
      // Collect form data based on dialog type
      let formData = {};
      
      if (dialogType === 'addPage' || dialogType === 'editPage') {
        formData = {
          title: formRefs.current.title?.value || 'New Page',
          slug: formRefs.current.slug?.value || 'new-page',
          status: formRefs.current.status?.value || 'Draft',
          content: formRefs.current.content?.value || '',
          author: 'Current User',
          lastUpdated: new Date().toISOString()
        };
      } else if (dialogType === 'addPost' || dialogType === 'editPost') {
        formData = {
          title: formRefs.current.title?.value || 'New Post',
          slug: formRefs.current.slug?.value || 'new-post',
          category: formRefs.current.category?.value || 'General',
          status: formRefs.current.status?.value || 'Draft',
          author: formRefs.current.author?.value || 'Current User',
          content: formRefs.current.content?.value || '',
          lastUpdated: new Date().toISOString()
        };
      } else if (dialogType === 'editMedia') {
        formData = {
          title: formRefs.current.title?.value || 'Untitled',
          altText: formRefs.current.altText?.value || '',
          lastUpdated: new Date().toISOString()
        };
      }
      
      let updatedItem;
      
      if (selectedItem) {
        // Update existing item
        if (tabValue === 0) {
          updatedItem = await contentService.updatePage(selectedItem.id, formData);
          setContentData(prev => ({
            ...prev,
            pages: prev.pages.map(page => page.id === updatedItem.id ? updatedItem : page)
          }));
        } else if (tabValue === 1) {
          updatedItem = await contentService.updateBlogPost(selectedItem.id, formData);
          setContentData(prev => ({
            ...prev,
            blogPosts: prev.blogPosts.map(post => post.id === updatedItem.id ? updatedItem : post)
          }));
        } else {
          updatedItem = await contentService.updateMedia(selectedItem.id, formData);
          setContentData(prev => ({
            ...prev,
            media: prev.media.map(item => item.id === updatedItem.id ? updatedItem : item)
          }));
        }
      } else {
        // Create new item
        if (tabValue === 0) {
          updatedItem = await contentService.createPage(formData);
          setContentData(prev => ({
            ...prev,
            pages: [...prev.pages, updatedItem]
          }));
        } else if (tabValue === 1) {
          updatedItem = await contentService.createBlogPost(formData);
          setContentData(prev => ({
            ...prev,
            blogPosts: [...prev.blogPosts, updatedItem]
          }));
        }
      }
      
      showSnackbar(`Successfully ${selectedItem ? 'updated' : 'created'} item`);
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    try {
      if (tabValue === 0) {
        await contentService.deletePage(selectedItem.id);
        setContentData(prev => ({
          ...prev,
          pages: prev.pages.filter(page => page.id !== selectedItem.id)
        }));
      } else if (tabValue === 1) {
        await contentService.deleteBlogPost(selectedItem.id);
        setContentData(prev => ({
          ...prev,
          blogPosts: prev.blogPosts.filter(post => post.id !== selectedItem.id)
        }));
      } else {
        await contentService.deleteMedia(selectedItem.id);
        setContentData(prev => ({
          ...prev,
          media: prev.media.filter(item => item.id !== selectedItem.id)
        }));
      }
      
      showSnackbar('Successfully deleted item');
      handleDeleteDialogClose();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  // Handle media upload
  const handleMediaUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadedMedia = await contentService.uploadMedia(formData);
      setContentData(prev => ({
        ...prev,
        media: [...prev.media, uploadedMedia]
      }));
      showSnackbar('Successfully uploaded media');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  // Render pages table
  const renderPagesTable = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No pages found
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('addPage')}
            sx={{ mt: 2 }}
          >
            Create your first page
          </Button>
        </Box>
      );
    }
    
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Author</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((page) => (
              <TableRow key={page.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.light', 
                        width: 36, 
                        height: 36, 
                        mr: 2 
                      }}
                    >
                      <ArticleIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">{page.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{page.slug}</TableCell>
                <TableCell>
                  <Chip 
                    label={page.status} 
                    size="small"
                    color={
                      page.status === 'Published' ? 'success' :
                      page.status === 'Draft' ? 'default' :
                      'primary'
                    }
                  />
                </TableCell>
                <TableCell>{page.lastUpdated}</TableCell>
                <TableCell>{page.author}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small"
                    onClick={(event) => handleMenuOpen(event, page)}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render blog posts table
  const renderBlogPostsTable = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No blog posts found
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('addPost')}
            sx={{ mt: 2 }}
          >
            Create your first blog post
          </Button>
        </Box>
      );
    }
    
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Author</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((post) => (
              <TableRow key={post.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'secondary.light', 
                        width: 36, 
                        height: 36, 
                        mr: 2 
                      }}
                    >
                      <ArticleIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">{post.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={post.category} 
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={post.status} 
                    size="small"
                    color={
                      post.status === 'Published' ? 'success' :
                      post.status === 'Draft' ? 'default' :
                      'primary'
                    }
                  />
                </TableCell>
                <TableCell>{post.lastUpdated}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small"
                    onClick={(event) => handleMenuOpen(event, post)}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render media gallery
  const renderMediaGallery = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No media found
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('addMedia')}
            sx={{ mt: 2 }}
          >
            Upload your first media
          </Button>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {filteredData.map((media) => (
          <Grid item key={media.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <Box 
                sx={{ 
                  height: 180, 
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {media.type.startsWith('image/') ? (
                  <ImageIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                ) : media.type.startsWith('video/') ? (
                  <BannerIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                ) : (
                  <ArticleIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                )}
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    bgcolor: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                  onClick={(event) => handleMenuOpen(event, media)}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
              <CardContent>
                <Typography variant="subtitle2" noWrap gutterBottom>
                  {media.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                  {media.type} • {media.size}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                  Uploaded: {media.uploadDate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render actions menu
  const renderActionsMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => {
        handleOpenDialog(tabValue === 0 ? 'editPage' : tabValue === 1 ? 'editPost' : 'editMedia', selectedItem);
        handleMenuClose();
      }}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} />
        Edit
      </MenuItem>
      <MenuItem onClick={handleDeleteDialogOpen}>
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
        Delete
      </MenuItem>
    </Menu>
  );

  // Render dialog based on type
  const renderDialog = () => {
    // Define form content based on dialog type
    let dialogTitle = '';
    let formContent = null;
    
    if (dialogType === 'addPage' || dialogType === 'editPage') {
      dialogTitle = dialogType === 'addPage' ? 'Add New Page' : `Edit Page: ${selectedItem?.title}`;
      formContent = (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              fullWidth
              defaultValue={selectedItem?.title || ''}
              variant="outlined"
              required
              inputRef={el => formRefs.current.title = el}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Slug"
              fullWidth
              defaultValue={selectedItem?.slug || ''}
              variant="outlined"
              required
              helperText="URL-friendly name (e.g., 'about-us')"
              inputRef={el => formRefs.current.slug = el}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                defaultValue={selectedItem?.status || 'Draft'}
                label="Status"
                inputRef={el => formRefs.current.status = el}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Content"
              multiline
              rows={8}
              fullWidth
              defaultValue={selectedItem?.content || ''}
              variant="outlined"
              inputRef={el => formRefs.current.content = el}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Show in Navigation"
            />
          </Grid>
        </Grid>
      );
    } else if (dialogType === 'addPost' || dialogType === 'editPost') {
      dialogTitle = dialogType === 'addPost' ? 'Add New Blog Post' : `Edit Post: ${selectedItem?.title}`;
      formContent = (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              fullWidth
              defaultValue={selectedItem?.title || ''}
              variant="outlined"
              required
              inputRef={el => formRefs.current.title = el}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Slug"
              fullWidth
              defaultValue={selectedItem?.slug || ''}
              variant="outlined"
              required
              helperText="URL-friendly name"
              inputRef={el => formRefs.current.slug = el}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                defaultValue={selectedItem?.category || ''}
                label="Category"
                inputRef={el => formRefs.current.category = el}
              >
                <MenuItem value="Productivity">Productivity</MenuItem>
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Management">Management</MenuItem>
                <MenuItem value="Work Culture">Work Culture</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                defaultValue={selectedItem?.status || 'Draft'}
                label="Status"
                inputRef={el => formRefs.current.status = el}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Author"
              fullWidth
              defaultValue={selectedItem?.author || ''}
              variant="outlined"
              inputRef={el => formRefs.current.author = el}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              sx={{ mb: 2 }}
            >
              Add Featured Image
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Content"
              multiline
              rows={8}
              fullWidth
              defaultValue={selectedItem?.content || ''}
              variant="outlined"
              inputRef={el => formRefs.current.content = el}
            />
          </Grid>
        </Grid>
      );
    } else if (dialogType === 'addMedia' || dialogType === 'editMedia') {
      dialogTitle = dialogType === 'addMedia' ? 'Add New Media' : `Edit Media: ${selectedItem?.title}`;
      formContent = (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              fullWidth
              defaultValue={selectedItem?.title || ''}
              variant="outlined"
              required
              inputRef={el => formRefs.current.title = el}
            />
          </Grid>
          {dialogType === 'addMedia' && (
            <Grid item xs={12}>
              <input
                accept="image/*,video/*,application/pdf"
                style={{ display: 'none' }}
                id="raised-button-file"
                multiple
                type="file"
                onChange={handleMediaUpload}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="outlined"
                  fullWidth
                  component="span"
                  startIcon={<ImageIcon />}
                  sx={{ py: 5 }}
                >
                  Click to upload or drag and drop
                </Button>
              </label>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              label="Alt Text"
              fullWidth
              defaultValue={selectedItem?.altText || ''}
              variant="outlined"
              helperText="Description for accessibility"
              inputRef={el => formRefs.current.altText = el}
            />
          </Grid>
          {selectedItem && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                File Information
              </Typography>
              <Typography variant="body2">
                Type: {selectedItem.type} | Size: {selectedItem.size} | Dimensions: {selectedItem.dimensions}
              </Typography>
            </Grid>
          )}
        </Grid>
      );
    }
    
    return (
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          {formContent}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveItem}
          >
            {dialogType.startsWith('add') ? 'Create' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render delete confirmation dialog
  const renderDeleteDialog = () => (
    <Dialog
      open={deleteDialogOpen}
      onClose={handleDeleteDialogClose}
    >
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to delete "{selectedItem?.title}"?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeleteDialogClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="error"
          onClick={handleDeleteItem}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => {
                setLoading(true);
                setError(null);
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Pages" icon={<ArticleIcon />} />
              <Tab label="Blog Posts" icon={<ImageIcon />} />
              <Tab label="Media" icon={<BannerIcon />} />
            </Tabs>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('create')}
              >
                Add New
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 2 }}>
          {tabValue === 0 && renderPagesTable()}
          {tabValue === 1 && renderBlogPostsTable()}
          {tabValue === 2 && renderMediaGallery()}
        </Paper>
      )}

      {renderDialog()}
      {renderDeleteDialog()}
      {renderActionsMenu()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContentManagement; 