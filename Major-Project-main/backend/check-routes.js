import express from 'express';
import leftoverFoodRoutes from './routes/leftoverFoodRoutes.js';

// Create a simple express app
const app = express();

// Register the routes DIRECTLY without any middleware
app.use('/api/leftover-food', leftoverFoodRoutes);

// Function to print all routes with more detail
function printRoutes(app) {
  console.log('\n=== DETAILED ROUTE INSPECTION ===\n');
  
  const _print = (path, layer) => {
    if (layer.route) {
      layer.route.stack.forEach(routeStack => {
        const method = Object.keys(routeStack.method)[0].toUpperCase();
        console.log(`${method}\t${path}${layer.route.path}`);
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      let routerPath = path;
      
      if (layer.regexp) {
        const match = layer.regexp.toString().match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\\/);
        if (match) {
          routerPath = path + match[1].replace(/\\\//, '/');
        }
      }
      
      layer.handle.stack.forEach(stackItem => {
        _print(routerPath, stackItem);
      });
    }
  };
  
  app._router.stack.forEach(layer => {
    _print('', layer);
  });
  
  console.log('\n=== RAW MIDDLEWARE STACK ===\n');
  let index = 0;
  
  // Print the raw middleware stack for debugging
  app._router.stack.forEach(middleware => {
    console.log(`[${index++}] ${middleware.name || 'anonymous'}`);
    
    if (middleware.name === 'router') {
      console.log('  Router path regexp:', middleware.regexp);
      console.log('  Router middleware stack:');
      
      middleware.handle.stack.forEach((handler, i) => {
        console.log(`    [${i}] ${handler.name || 'anonymous'} ${handler.route ? handler.route.path : ''}`);
        
        // Print any sub-middleware for this route
        if (handler.handle && typeof handler.handle === 'function') {
          console.log(`      Handler: ${handler.handle.name || 'anonymous function'}`);
        }
        
        // If this is a route with multiple handlers, print them
        if (handler.route && handler.route.stack) {
          handler.route.stack.forEach((routeHandler, j) => {
            console.log(`      Route handler [${j}]: ${routeHandler.method} ${routeHandler.name || 'anonymous'}`);
          });
        }
      });
    }
  });
  
  console.log('\n=== END OF ROUTE INSPECTION ===\n');
}

// Print all routes
printRoutes(app);

console.log('Check complete! This is not a server, just a route checker.');
process.exit(0); 