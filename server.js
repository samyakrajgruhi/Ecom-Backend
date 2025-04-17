/* eslint-disable node/no-unsupported-features/es-syntax */
import express from "express";
import cors from "cors";
import { syncDatabase } from "./models/index.js";

// Import routes
import productRoutes from './routes/productRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import resetRoutes from './routes/resetRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing for request bodies
app.use(express.json());
app.use(cors(
  {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  }
));

// Serve static files from the images directory
app.use('/images', express.static('images'));

// Use the route files with /api prefix
app.use('/api/products', productRoutes);
app.use('/api/delivery-options', deliveryRoutes);
app.use('/api/cart-items', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/payment-summary', paymentRoutes);

// Initialize database and start server
syncDatabase().then(async () => {
  // Start Server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Images can be accessed at http://localhost:${PORT}/images/`);
    console.log(`API endpoints are available at http://localhost:${PORT}/api/*`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error.message);
  console.error('Stack trace:', error.stack);
});