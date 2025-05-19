const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// In-memory storage for demo purposes
// In a real app, this would be replaced with a database
let pages = [
  { id: 1, title: 'Home Page', slug: 'home', status: 'Published', lastUpdated: '2023-05-15', author: 'Mike Johnson' },
  { id: 2, title: 'About Us', slug: 'about-us', status: 'Published', lastUpdated: '2023-04-20', author: 'Sarah Wilson' },
  { id: 3, title: 'Services', slug: 'services', status: 'Published', lastUpdated: '2023-04-10', author: 'Mike Johnson' },
  { id: 4, title: 'Contact', slug: 'contact', status: 'Published', lastUpdated: '2023-03-22', author: 'John Smith' },
  { id: 5, title: 'FAQ', slug: 'faq', status: 'Draft', lastUpdated: '2023-05-18', author: 'Sarah Wilson' }
];

let blogPosts = [
  { id: 1, title: '10 Productivity Tips for Remote Work', slug: 'productivity-tips-remote-work', category: 'Productivity', status: 'Published', lastUpdated: '2023-05-20', author: 'Sarah Wilson' },
  { id: 2, title: 'How AI is Transforming Business', slug: 'ai-transforming-business', category: 'Technology', status: 'Published', lastUpdated: '2023-05-15', author: 'Mike Johnson' },
  { id: 3, title: 'Building Effective Teams', slug: 'building-effective-teams', category: 'Management', status: 'Draft', lastUpdated: '2023-05-18', author: 'John Smith' }
];

let media = [
  { id: 1, title: 'Team Meeting', type: 'image/jpeg', size: '1.2 MB', dimensions: '1920x1080', uploadDate: '2023-05-15', url: '/images/sample1.jpg' },
  { id: 2, title: 'Office Space', type: 'image/jpeg', size: '0.8 MB', dimensions: '1600x900', uploadDate: '2023-05-10', url: '/images/sample2.jpg' },
  { id: 3, title: 'Product Demo', type: 'video/mp4', size: '15.4 MB', dimensions: '1920x1080', uploadDate: '2023-05-05', url: '/videos/demo.mp4' }
];

// Pages routes
router.get('/pages', async (req, res) => {
  try {
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.post('/pages', async (req, res) => {
  try {
    const newPage = {
      id: Date.now(),
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    pages.push(newPage);
    res.status(201).json(newPage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create page' });
  }
});

router.put('/pages/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = pages.findIndex(page => page.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Page not found' });
    }
    pages[index] = {
      ...pages[index],
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    res.json(pages[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page' });
  }
});

router.delete('/pages/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    pages = pages.filter(page => page.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// Blog posts routes
router.get('/blog-posts', async (req, res) => {
  try {
    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

router.post('/blog-posts', async (req, res) => {
  try {
    const newPost = {
      id: Date.now(),
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    blogPosts.push(newPost);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

router.put('/blog-posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = blogPosts.findIndex(post => post.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    blogPosts[index] = {
      ...blogPosts[index],
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    res.json(blogPosts[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

router.delete('/blog-posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    blogPosts = blogPosts.filter(post => post.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Media routes
router.get('/media', async (req, res) => {
  try {
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

router.post('/media/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newMedia = {
      id: Date.now(),
      title: req.file.originalname,
      type: req.file.mimetype,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      url: `/uploads/${req.file.filename}`,
      uploadDate: new Date().toISOString()
    };

    media.push(newMedia);
    res.status(201).json(newMedia);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

router.put('/media/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = media.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Media not found' });
    }
    media[index] = {
      ...media[index],
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    res.json(media[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update media' });
  }
});

router.delete('/media/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mediaItem = media.find(item => item.id === id);
    if (!mediaItem) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete file from uploads directory
    const filePath = path.join(__dirname, '..', mediaItem.url);
    await fs.unlink(filePath);

    media = media.filter(item => item.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

module.exports = router; 