/* eslint-disable node/no-unsupported-features/es-syntax */
import express from "express";
import { syncDatabase } from "./models/index.js";

// Import routes
import productRoutes from './routes/productRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import resetRoutes from './routes/resetRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing for request bodies
app.use(express.json());

// Serve static files from the images directory
app.use('/images', express.static('images'));

// Use the route files
app.use('/products', productRoutes);
app.use('/delivery-options', deliveryRoutes);
app.use('/cart-items', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/reset', resetRoutes);

// Initialize database and start server
syncDatabase().then(async () => {
  // Start Server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Images can be accessed at http://localhost:${PORT}/images/`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error.message);
  console.error('Stack trace:', error.stack);
});