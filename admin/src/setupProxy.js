const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const apiProxy = createProxyMiddleware('/api', {
    target: 'http://localhost:5003',
    changeOrigin: true,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.log('Proxy Error:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ 
        message: 'Backend server is not running or not accessible', 
        error: err.message 
      }));
    },
    pathRewrite: {
      '^/api': '/api'  // No rewrite needed
    }
  });

  const paymentsProxy = createProxyMiddleware('/payments', {
    target: 'http://localhost:3000',
    changeOrigin: true,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.log('Payments Proxy Error:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ 
        message: 'Payments server is not running or not accessible', 
        error: err.message 
      }));
    }
  });

  app.use('/api', apiProxy);
  app.use('/payments', paymentsProxy);
}; 